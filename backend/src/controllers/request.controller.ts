// File: backend/src/controllers/request.controller.ts
// Purpose: Controller for managing citizen service requests (Registration, Verification, Transfer)

import { Request, Response } from 'express';
import prisma from '../config/database';
import { parseFormData, serializeFormData } from '../utils/formData';
import { REQUIRED_DOCS_BY_TYPE } from '../utils/documentRequirements';

// Unified Submit Request Endpoint
export const createRequest = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const {
            type,
            plotNumber,
            region,
            zone,
            wereda,
            kebele,
            landSize,
            landUseType,
        } = req.body;

        if (!type) {
            return res.status(400).json({ error: 'Request type is required' });
        }

        // Generate descriptive reference number
        let prefix = 'REQ';
        if (type === 'Land Registration' || type === 'Registration Request') {
            prefix = 'REG';
        } else if (type === 'Ownership Verification') {
            prefix = 'VER';
        } else if (type === 'Ownership Transfer') {
            prefix = 'TRF';
        }
        const referenceNumber = `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Build robust formData JSON object containing all details
        const formData = {
            ...req.body,
            landSize: typeof landSize === 'string' ? parseFloat(landSize || '0') : (landSize || 0)
        };

        const newRequest = await prisma.request.create({
            data: {
                type,
                status: 'Under Review',
                referenceNumber,
                formData: serializeFormData(formData),
                userId,
            }
        });

        return res.status(201).json({ request: newRequest });
    } catch (error) {
        console.error('Create request error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// List requests for the authenticated user
export const getRequests = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let requests;
        if (role === 'Officer' || role === 'Admin' || role === 'officer' || role === 'admin') {
            const rawRequests = await prisma.request.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                        }
                    }
                }
            });
            requests = rawRequests.map(req => {
                const formDataObj = parseFormData(req.formData);
                return {
                    ...req,
                    ownerName: formDataObj.fullName || formDataObj.ownerName || req.user.fullName,
                    ownerNationalId: formDataObj.faydaId || formDataObj.ownerNationalId || 'N/A',
                    plotNumber: formDataObj.plotNumber || 'N/A',
                    location: formDataObj.kebele ? { kebele: formDataObj.kebele, wereda: formDataObj.wereda || formDataObj.woreda } : (formDataObj.location || 'N/A'),
                    landSize: formDataObj.landSize || 0,
                    urgency: formDataObj.urgency || 'medium',
                    additionalNotes: formDataObj.additionalNotes || formDataObj.purpose || 'N/A',
                };
            });
        } else {
            requests = await prisma.request.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
        }

        return res.json({ requests });
    } catch (error) {
        console.error('Get requests error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get details for a request by Reference Number or ID
export const getRequestDetail = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { referenceNumber } = req.params;
        const refNum = String(referenceNumber || '');
        const isOfficer =
            role === 'Officer' || role === 'Admin' || role === 'officer' || role === 'admin';

        const request = await prisma.request.findFirst({
            where: {
                OR: [{ referenceNumber: refNum }, { id: refNum }],
                ...(isOfficer ? {} : { userId }),
            },
        });

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        return res.json({ request });
    } catch (error) {
        console.error('Get request detail error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Update request status (Admin/Officer only)
export const updateRequestStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        if (role !== 'Officer' && role !== 'Admin' && role !== 'officer' && role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Officer/Admin access required' });
        }
        
        const id = String(req.params.id || '');
        const { status, docValidation } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        
        const currentRequest = await prisma.request.findUnique({
            where: { id },
        });
        if (!currentRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const existingFormData = parseFormData(currentRequest.formData);
        const requestedStatus = String(status);
        const normalizedStatus = requestedStatus.toLowerCase();
        const requiredDocs = REQUIRED_DOCS_BY_TYPE[currentRequest.type] || ['Supporting Documents'];

        const needsDocPayload =
            normalizedStatus === 'approved' ||
            normalizedStatus === 'document validation' ||
            normalizedStatus === 'rejected';

        if (needsDocPayload && (!docValidation || typeof docValidation !== 'object')) {
            return res.status(400).json({
                error: 'Document authenticity checklist is required for this status change.',
            });
        }

        const docsMap = (docValidation?.docs || {}) as Record<string, boolean>;

        if (normalizedStatus === 'approved') {
            const missingValidation = requiredDocs.filter((doc) => docsMap[doc] !== true);
            if (missingValidation.length > 0) {
                return res.status(400).json({
                    error: `Cannot approve. These documents are not validated as authentic: ${missingValidation.join(', ')}`,
                });
            }
        }

        if (normalizedStatus === 'document validation') {
            const hasAnyReview = requiredDocs.some(
                (doc) => docsMap[doc] === true || docsMap[doc] === false
            );
            if (!hasAnyReview) {
                return res.status(400).json({
                    error: 'Mark at least one document as authentic or not authentic before saving.',
                });
            }
        }

        const displayStatus =
            normalizedStatus === 'document validation'
                ? 'Document Validation'
                : requestedStatus;

        const nextFormData = {
            ...existingFormData,
            docAuthenticity: docValidation
                ? {
                    ...docValidation,
                    requiredDocs,
                    validatedByUserId: userId,
                    validatedAt: new Date().toISOString(),
                }
                : existingFormData.docAuthenticity,
        };

        const isApproved = normalizedStatus === 'approved';

        const updatedRequest = await prisma.$transaction(async (tx) => {
            // Update request status + persist docAuthenticity payload
            const reqUpdated = await tx.request.update({
                where: { id },
                data: {
                    status: displayStatus,
                    formData: serializeFormData(nextFormData),
                },
            });

            if (!isApproved) {
                return reqUpdated;
            }

            const formData = parseFormData(reqUpdated.formData);
            const plotNumber = String((formData as any)?.plotNumber || '').trim();
            if (!plotNumber) {
                // Approval without plotNumber: nothing to link/create.
                return reqUpdated;
            }

            const requestType = String(reqUpdated.type || '');
            const isTransfer = requestType === 'Ownership Transfer';

            // Determine intended owner for the land after approval
            let ownerId = reqUpdated.userId;
            if (isTransfer) {
                const meta = (formData as any)?.metadata || {};
                const newOwner = meta?.newOwner || {};
                const newOwnerNationalId = String(newOwner?.nationalId || '').replace(/\s/g, '');
                const newOwnerEmail = String(newOwner?.email || '').toLowerCase().trim();
                const newOwnerPhone = String(newOwner?.phone || '').replace(/\s/g, '');

                const target = await tx.user.findFirst({
                    where: {
                        OR: [
                            ...(newOwnerNationalId ? [{ faydaId: newOwnerNationalId }] : []),
                            ...(newOwnerEmail ? [{ email: newOwnerEmail }] : []),
                            ...(newOwnerPhone ? [{ phone: newOwnerPhone }] : []),
                        ],
                    },
                    select: { id: true },
                });
                if (target?.id) ownerId = target.id;
            }

            // Upsert land by plotNumber and mark verified
            const existingLand = await tx.land.findUnique({ where: { plotNumber } });
            const land =
                existingLand
                    ? await tx.land.update({
                        where: { id: existingLand.id },
                        data: {
                            ownerId,
                            verified: true,
                            region: (formData as any).region || existingLand.region,
                            zone: (formData as any).zone || existingLand.zone,
                            wereda: (formData as any).wereda || (formData as any).woreda || existingLand.wereda,
                            kebele: (formData as any).kebele || existingLand.kebele,
                            landUseType: (formData as any).landUseType || existingLand.landUseType,
                            landSize:
                                typeof (formData as any).landSize === 'string'
                                    ? parseFloat((formData as any).landSize || String(existingLand.landSize))
                                    : (formData as any).landSize ?? existingLand.landSize,
                        },
                    })
                    : await tx.land.create({
                        data: {
                            plotNumber,
                            region: (formData as any).region || 'Addis Ababa',
                            zone: (formData as any).zone || '',
                            wereda: (formData as any).wereda || (formData as any).woreda || '',
                            kebele: (formData as any).kebele || '',
                            landSize:
                                typeof (formData as any).landSize === 'string'
                                    ? parseFloat((formData as any).landSize || '0')
                                    : (formData as any).landSize || 0.0,
                            landUseType: (formData as any).landUseType || 'Residential',
                            ownerId,
                            verified: true,
                        },
                    });

            // Link the request to the land so staff/citizen UIs can correlate.
            return await tx.request.update({
                where: { id: reqUpdated.id },
                data: { landId: land.id },
            });
        });

        return res.json({ request: updatedRequest });
    } catch (error) {
        console.error('Update request status error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


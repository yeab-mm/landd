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

        // Update request status
        const updatedRequest = await prisma.request.update({
            where: { id },
            data: {
                status: displayStatus,
                formData: serializeFormData(nextFormData),
            },
        });
        
        // If approved and request has land details, we should create or verify the Land in database!
        if (normalizedStatus === 'approved') {
            const formData = parseFormData(updatedRequest.formData);
            if (formData && formData.plotNumber) {
                // Check if land already exists
                const existingLand = await prisma.land.findUnique({
                    where: { plotNumber: formData.plotNumber }
                });
                
                if (existingLand) {
                    await prisma.land.update({
                        where: { id: existingLand.id },
                        data: { verified: true }
                    });
                } else {
                    // Create new land record if it is a new registration
                    await prisma.land.create({
                        data: {
                            plotNumber: formData.plotNumber,
                            region: formData.region || 'Addis Ababa',
                            zone: formData.zone || '',
                            wereda: formData.wereda || formData.woreda || '',
                            kebele: formData.kebele || '',
                            landSize: typeof formData.landSize === 'string' ? parseFloat(formData.landSize) : (formData.landSize || 0.0),
                            landUseType: formData.landUseType || 'Residential',
                            ownerId: updatedRequest.userId,
                            verified: true
                        }
                    });
                }
            }
        }
        
        return res.json({ request: updatedRequest });
    } catch (error) {
        console.error('Update request status error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


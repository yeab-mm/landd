// File: backend/src/controllers/request.controller.ts
// Purpose: Controller for managing citizen service requests (Registration, Verification, Transfer)

import { Request, Response } from 'express';
import prisma from '../config/database';
import { parseFormData, serializeFormData } from '../utils/formData';
import { REQUIRED_DOCS_BY_TYPE } from '../utils/documentRequirements';
import { fulfillApprovedRequest } from '../utils/requestFulfillment';
import { notifyUser } from '../utils/notifyUser';
import { notifyRole } from '../utils/notifyRole';

const normalizeRole = (role: string) => (role || '').toLowerCase();

const statusKey = (status: string) => (status || '').toLowerCase().trim();

function adminClearedForOfficer(formData: Record<string, unknown>): boolean {
    const adminReview = formData.adminReview as { decision?: string } | undefined;
    return (
        adminReview?.decision === 'approved' ||
        Boolean(formData.forwardedByAdminId)
    );
}

// Admin must review/validate docs first, then forward to officer.
const ADMIN_FORWARD_FROM = ['document validation'];
const ADMIN_FORWARD_FROM_TRIAGE = ['submitted', 'pending', 'under review'];

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
                status: 'Submitted',
                referenceNumber,
                formData: serializeFormData(formData),
                userId,
            }
        });

        // Staff notifications (Admin & Officer)
        const staffMsg = `New ${type} request submitted (${referenceNumber}). Plot: ${plotNumber || 'N/A'}.`;
        await Promise.all([
            notifyRole('Admin',   { title: 'New request submitted', message: staffMsg, type: 'info' }),
            notifyRole('Officer', { title: 'New request submitted', message: staffMsg, type: 'info' }),
        ]);

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
                    documents: formDataObj.documents || {},
                    adminReview: formDataObj.adminReview || null,
                    officerReview: formDataObj.officerReview || null,
                    docAuthenticity: formDataObj.docAuthenticity || null,
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

// Update request status (Admin/Officer can validate, forward, approve, reject)
export const updateRequestStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const role = (req as any).user?.role;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const roleNorm = normalizeRole(role);
        const isAdmin = roleNorm === 'admin';
        const isOfficer = roleNorm === 'officer';

        if (!isAdmin && !isOfficer) {
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
        const normalizedStatus = statusKey(requestedStatus);
        const currentStatusKey = statusKey(currentRequest.status);
        const requiredDocs = REQUIRED_DOCS_BY_TYPE[currentRequest.type] || ['Supporting Documents'];

        // Admin: validate documents, forward to officer, or reject (no final approval).
        if (isAdmin) {
            if (normalizedStatus === 'approved') {
                return res.status(400).json({
                    error: 'Admins forward validated requests to officers. Use "Assigned to Officer" after document review.',
                });
            }
            if (normalizedStatus === 'assigned to officer') {
                const hasDocsPayload = Boolean(docValidation && (docValidation as any).docs);
                const canForwardDirectly =
                    hasDocsPayload && ADMIN_FORWARD_FROM_TRIAGE.includes(currentStatusKey);

                if (!ADMIN_FORWARD_FROM.includes(currentStatusKey) && !canForwardDirectly) {
                    return res.status(400).json({
                        error: `Cannot forward request in status "${currentRequest.status}".`,
                    });
                }

                // Enforce: admin must mark ALL required docs authentic before forwarding
                const docsMapToCheck = (docValidation?.docs || existingFormData?.docAuthenticity?.docs || {}) as Record<
                    string,
                    boolean
                >;
                const missingValidation = requiredDocs.filter((doc) => docsMapToCheck[doc] !== true);
                if (missingValidation.length > 0) {
                    return res.status(400).json({
                        error: `Cannot forward. These documents are not validated as authentic: ${missingValidation.join(', ')}`,
                    });
                }
            } else if (
                normalizedStatus !== 'under review' &&
                normalizedStatus !== 'document validation' &&
                normalizedStatus !== 'rejected'
            ) {
                return res.status(403).json({
                    error: 'Admins may document-validate, reject, or forward requests to officers.',
                });
            }
        }

        // Officers review, validate documents, approve or reject
        if (isOfficer) {
            if (normalizedStatus === 'assigned to officer') {
                return res.status(403).json({
                    error: 'Only admins can forward requests to the officer queue.',
                });
            }
            if (normalizedStatus === 'approved') {
                if (!adminClearedForOfficer(existingFormData)) {
                    return res.status(400).json({
                        error: 'Admin must approve documents and forward this listing before it can be published.',
                    });
                }
            }
        }

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

        let displayStatus = requestedStatus;
        if (normalizedStatus === 'document validation') {
            displayStatus = 'Document Validation';
        } else if (normalizedStatus === 'assigned to officer') {
            displayStatus = 'Assigned to Officer';
        } else if (normalizedStatus === 'approved') {
            displayStatus = 'Approved';
        } else if (normalizedStatus === 'rejected') {
            displayStatus = 'Rejected';
        } else if (normalizedStatus === 'under review') {
            displayStatus = 'Under Review';
        }

        const nextFormData: Record<string, unknown> = {
            ...existingFormData,
            docAuthenticity: docValidation
                ? {
                      ...docValidation,
                      requiredDocs,
                      validatedByUserId: userId,
                      validatedAt: new Date().toISOString(),
                      validatedByRole: roleNorm,
                  }
                : existingFormData.docAuthenticity,
        };

        if (isAdmin && docValidation && (normalizedStatus === 'assigned to officer' || normalizedStatus === 'rejected')) {
            const docsMapAdmin = (docValidation.docs || {}) as Record<string, boolean>;
            const allAuthentic = requiredDocs.every((doc) => docsMapAdmin[doc] === true);
            const anyRejected = requiredDocs.some((doc) => docsMapAdmin[doc] === false);
            let decision: 'approved' | 'rejected' = 'approved';
            if (normalizedStatus === 'rejected' || anyRejected) {
                decision = 'rejected';
            } else if (!allAuthentic) {
                decision = 'rejected';
            }
            nextFormData.adminReview = {
                decision,
                docs: docsMapAdmin,
                notes: docValidation.notes || '',
                reviewedAt: new Date().toISOString(),
                reviewedByUserId: userId,
                reviewedByRole: 'admin',
            };
        }

        if (normalizedStatus === 'assigned to officer' && isAdmin) {
            nextFormData.forwardedByAdminId = userId;
            nextFormData.forwardedAt = new Date().toISOString();
        }

        if (isOfficer && docValidation && (normalizedStatus === 'approved' || normalizedStatus === 'rejected')) {
            const docsMapOfficer = (docValidation.docs || {}) as Record<string, boolean>;
            nextFormData.officerReview = {
                decision: normalizedStatus === 'approved' ? 'approved' : 'rejected',
                docs: docsMapOfficer,
                notes: docValidation.notes || '',
                reviewedAt: new Date().toISOString(),
                reviewedByUserId: userId,
                reviewedByRole: 'officer',
            };
        }

        const updatedRequest = await prisma.request.update({
            where: { id },
            data: {
                status: displayStatus,
                formData: serializeFormData(nextFormData),
            },
        });

        if (normalizedStatus === 'assigned to officer' && isAdmin) {
            await notifyRole('Officer', {
                title: 'Request forwarded to officer queue',
                message: `A request was forwarded for officer review (${updatedRequest.referenceNumber}).`,
                type: 'info',
            });
        }

        if (normalizedStatus === 'rejected' && isAdmin) {
            const ref = currentRequest.referenceNumber || 'your request';
            const notes =
                typeof docValidation?.notes === 'string' && docValidation.notes.trim()
                    ? ` Reason: ${docValidation.notes.trim()}`
                    : '';
            await notifyUser(currentRequest.userId, {
                title: 'Listing request rejected',
                message: `Your ${currentRequest.type} (${ref}) was rejected by admin.${notes}`,
                type: 'error',
            });
            await notifyRole('Officer', {
                title: 'Request rejected by admin',
                message: `Admin rejected ${ref}. Officer review not required.`,
                type: 'info',
            });
        }

        if (normalizedStatus === 'approved' && isOfficer) {
            const land = await fulfillApprovedRequest({
                id: updatedRequest.id,
                userId: updatedRequest.userId,
                type: updatedRequest.type,
                formData: updatedRequest.formData,
                referenceNumber: updatedRequest.referenceNumber,
            });

            const isMarketplace = updatedRequest.type === 'Marketplace Listing';
            return res.json({
                request: updatedRequest,
                published: isMarketplace,
                message: isMarketplace
                    ? 'Listing published successfully. It is now visible in the marketplace.'
                    : 'Request approved successfully.',
                land,
            });
        }

        if (normalizedStatus === 'rejected' && isOfficer) {
            const ref = currentRequest.referenceNumber || 'your request';
            const notes =
                typeof docValidation?.notes === 'string' && docValidation.notes.trim()
                    ? ` Reason: ${docValidation.notes.trim()}`
                    : '';
            await notifyUser(currentRequest.userId, {
                title: 'Request rejected',
                message: `Your ${currentRequest.type} (${ref}) was not approved.${notes}`,
                type: 'error',
            });
        }

        return res.json({ request: updatedRequest });
    } catch (error) {
        console.error('Update request status error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


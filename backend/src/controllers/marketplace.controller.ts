import { Request, Response } from 'express';
import prisma from '../config/database';
import { serializeFormData } from '../utils/formData';
import { notifyRole } from '../utils/notifyRole';
import { REQUIRED_DOCS_BY_TYPE } from '../utils/documentRequirements';

/** Public/active marketplace listings only (officer-approved). */
export const getMarketplaceListings = async (req: Request, res: Response) => {
  try {
    const lands = await prisma.land.findMany({
      where: {
        listingStatus: 'active',
        forSale: true,
      },
      include: {
        owner: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const listings = lands.map((land) => {
      let images: string[] = [];
      try {
        images = land.listingImages ? JSON.parse(land.listingImages) : [];
      } catch {
        images = [];
      }
      const price = land.listingPrice || 0;
      return {
        id: land.id,
        title: land.listingTitle || `${land.landUseType} — ${land.kebele}`,
        location: `${land.zone}, ${land.kebele}`,
        price: `ETB ${price.toLocaleString()}`,
        priceValue: price,
        area: `${land.landSize} m²`,
        areaValue: land.landSize,
        type: land.transactionType || 'For Sale',
        verified: land.verified,
        plotNumber: land.plotNumber,
        description: land.listingDescription || '',
        seller: land.owner.fullName,
        sellerId: land.owner.id,
        phone: land.owner.phone,
        images,
        landUseType: land.landUseType,
      };
    });

    return res.json({ listings });
  } catch (error) {
    console.error('getMarketplaceListings', error);
    return res.status(500).json({ error: 'Failed to fetch marketplace listings' });
  }
};

/** Submit listing for admin review (no direct publish). */
export const submitMarketplaceListing = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const body = req.body;
    const plotNumber = String(body.plotNumber || '').trim();
    if (!plotNumber) {
      return res.status(400).json({ error: 'Plot number is required' });
    }

    const referenceNumber = `MKT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const requiredDocs = REQUIRED_DOCS_BY_TYPE['Marketplace Listing'] || [];
    const documents = (body.documents || {}) as Record<string, string>;
    const missingDocs = requiredDocs.filter((doc) => {
      const v = documents[doc];
      return typeof v !== 'string' || !v.trim();
    });
    if (missingDocs.length > 0) {
      return res.status(400).json({
        error: `Missing required listing documents: ${missingDocs.join(', ')}`,
      });
    }

    const formData = {
      ...body,
      plotNumber,
      landSize: typeof body.area === 'string' ? parseFloat(body.area) : body.area || body.landSize,
      kebele: body.kebele || body.location?.kebele,
      zone: body.zone || body.location?.zone,
      region: body.region || body.location?.region || 'Amhara',
      documents,
    };

    const newRequest = await prisma.request.create({
      data: {
        type: 'Marketplace Listing',
        status: 'Submitted',
        referenceNumber,
        formData: serializeFormData(formData),
        userId,
      },
    });

    const staffMsg = `New marketplace listing request (${referenceNumber}) for plot ${plotNumber}.`;
    await Promise.all([
      notifyRole('Admin', { title: 'New marketplace listing', message: staffMsg, type: 'info' }),
      notifyRole('Officer', { title: 'New marketplace listing', message: staffMsg, type: 'info' }),
    ]);

    return res.status(201).json({
      message: 'Listing submitted for review. Admin will validate documents and forward to an officer.',
      request: newRequest,
    });
  } catch (error) {
    console.error('submitMarketplaceListing', error);
    return res.status(500).json({ error: 'Failed to submit listing' });
  }
};

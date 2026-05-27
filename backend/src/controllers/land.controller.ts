// File: backend/src/controllers/land.controller.ts
// Purpose: Handle land management operations
// ✅ TypeScript-safe + explicit 'data:' key (no  shorthand)

import { Request, Response } from 'express';
import prisma from '../config/database';

// Helper: Ensure id is always a string
const getId = (id: any): string => {
  if (Array.isArray(id)) return id[0];
  return String(id || '');
};

// ============================================
// GET /api/lands - List current user's lands
// ============================================
export const getLands = async (req: Request, res: Response): Promise<Response> => {
  try {
    const ownerId = (req as any).user?.userId;
    
    if (!ownerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const lands = await prisma.land.findMany({
      where: { ownerId: ownerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        plotNumber: true,
        region: true,
        zone: true,
        wereda: true,
        kebele: true,
        landSize: true,
        landUseType: true,
        verified: true,
        createdAt: true,
      },
    });

    return res.json({ lands: lands });
  } catch (error: any) {
    console.error('Get lands error:', error);
    return res.status(500).json({ error: 'Failed to fetch lands' });
  }
};

// ============================================
// GET /api/lands/:id - Get single land
// ============================================
export const getLand = async (req: Request, res: Response): Promise<Response> => {
  try {
    const ownerId = (req as any).user?.userId;
    const landId = getId(req.params.id);

    const land = await prisma.land.findUnique({
      where: { id: landId },
      select: {
        id: true,
        plotNumber: true,
        region: true,
        zone: true,
        wereda: true,
        kebele: true,
        landSize: true,
        landUseType: true,
        verified: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    if (land.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    return res.json({ land: land });
  } catch (error: any) {
    console.error('Get land error:', error);
    return res.status(500).json({ error: 'Failed to fetch land' });
  }
};

// ============================================
// POST /api/lands - Register new land
// ============================================
export const createLand = async (req: Request, res: Response): Promise<Response> => {
  try {
    const ownerId = (req as any).user?.userId;
    const role = (req as any).user?.role;
    if (!ownerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Citizens should not directly register land records.
    // Lands are created/verified as a result of staff approvals on requests.
    const r = String(role || '').toLowerCase();
    if (r !== 'admin' && r !== 'officer') {
      return res.status(403).json({
        error: 'Land registration must be submitted as a request and approved by staff.',
      });
    }

    const {
      plotNumber,
      region,
      zone,
      wereda,
      kebele,
      landSize,
      landUseType,
    } = req.body;

    if (!plotNumber || !region || !landSize) {
      return res.status(400).json({ error: 'Plot number, region, and land size are required' });
    }

    const existing = await prisma.land.findFirst({
      where: { plotNumber: plotNumber },
    });

    if (existing) {
      return res.status(400).json({ error: 'Land with this plot number already exists' });
    }

    // ✅ EXPLICIT 'data:' KEY
    const land = await prisma.land.create({
      data: { 
        ownerId: ownerId,
        plotNumber: plotNumber,
        region: region,
        zone: zone,
        wereda: wereda,
        kebele: kebele,
        landSize: parseFloat(landSize),
        landUseType: landUseType,
        verified: true,
      },
      select: {
        id: true,
        plotNumber: true,
        region: true,
        landSize: true,
        verified: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ message: 'Land registered successfully', land: land });
  } catch (error: any) {
    console.error('Create land error:', error);
    return res.status(500).json({ error: 'Failed to register land' });
  }
};

// ============================================
// PUT /api/lands/:id - Update land
// ============================================
export const updateLand = async (req: Request, res: Response): Promise<Response> => {
  try {
    const ownerId = (req as any).user?.userId;
    const landId = getId(req.params.id);

    const existingLand = await prisma.land.findUnique({
      where: { id: landId },
      select: { ownerId: true },
    });

    if (!existingLand) {
      return res.status(404).json({ error: 'Land not found' });
    }

    if (existingLand.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const {
      plotNumber,
      region,
      zone,
      wereda,
      kebele,
      landSize,
      landUseType,
    } = req.body;

    // Build update object
    const updateData: any = {};
    if (plotNumber) updateData.plotNumber = plotNumber;
    if (region) updateData.region = region;
    if (zone) updateData.zone = zone;
    if (wereda) updateData.wereda = wereda;
    if (kebele) updateData.kebele = kebele;
    if (landSize) updateData.landSize = parseFloat(landSize);
    if (landUseType) updateData.landUseType = landUseType;

    // ✅ EXPLICIT 'data:' KEY
    const updatedLand = await prisma.land.update({
      where: { id: landId },
      data: updateData,
      select: {
        id: true,
        plotNumber: true,
        region: true,
        landSize: true,
        updatedAt: true,
      },
    });

    return res.json({ message: 'Land updated successfully', land: updatedLand });
  } catch (error: any) {
    console.error('Update land error:', error);
    return res.status(500).json({ error: 'Failed to update land' });
  }
};

// ============================================
// DELETE /api/lands/:id - Delete land
// ============================================
export const deleteLand = async (req: Request, res: Response): Promise<Response> => {
  try {
    const ownerId = (req as any).user?.userId;
    const landId = getId(req.params.id);

    const existingLand = await prisma.land.findUnique({
      where: { id: landId },
      select: { ownerId: true },
    });

    if (!existingLand) {
      return res.status(404).json({ error: 'Land not found' });
    }

    if (existingLand.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.land.delete({
      where: { id: landId },
    });

    return res.json({ message: 'Land deleted successfully' });
  } catch (error: any) {
    console.error('Delete land error:', error);
    return res.status(500).json({ error: 'Failed to delete land' });
  }
};
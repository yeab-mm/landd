import prisma from '../config/database';
import { parseFormData, serializeFormData } from './formData';
import { notifyUser } from './notifyUser';

function parseImages(raw: unknown): string {
  if (!raw) return '[]';
  if (typeof raw === 'string') return raw;
  return JSON.stringify(raw);
}

/** When an officer approves a request, create or update land / marketplace listing. */
export async function fulfillApprovedRequest(request: {
  id: string;
  userId: string;
  type: string;
  formData: string;
  referenceNumber?: string;
}) {
  const formData = parseFormData(request.formData);
  const plotNumber = String(formData.plotNumber || '').trim();
  const ref = request.referenceNumber || 'your request';
  const isMarketplace = request.type === 'Marketplace Listing';

  if (!plotNumber) {
    console.warn(`Request ${request.id} approved but missing plotNumber`);
    await notifyUser(request.userId, {
      title: 'Request approved',
      message: `Your ${request.type} (${ref}) was approved. Contact support if details are missing.`,
      type: 'success',
    });
    return null;
  }

  const landSize =
    typeof formData.landSize === 'string'
      ? parseFloat(formData.landSize)
      : Number(formData.landSize || formData.area) || 0;

  const basePayload = {
    plotNumber,
    region: formData.region || formData.location?.region || 'Amhara',
    zone: formData.zone || formData.location?.zone || '',
    wereda: formData.wereda || formData.woreda || formData.location?.kebele || '',
    kebele: formData.kebele || formData.location?.kebele || '',
    landSize,
    landUseType: formData.landUseType || 'Residential',
    ownerId: request.userId,
    verified: true,
  };

  const marketplacePayload = isMarketplace
    ? {
        listingStatus: 'active',
        forSale: true,
        listingTitle: String(formData.title || formData.listingTitle || `${basePayload.landUseType} plot`),
        listingPrice: parseInt(String(formData.price || formData.listingPrice || '0').replace(/\D/g, ''), 10) || 0,
        governmentTax: parseInt(String(formData.governmentTax || '0').replace(/\D/g, ''), 10) || 0,
        transactionType: formData.transactionType || 'For Sale',
        listingDescription: String(formData.description || formData.listingDescription || ''),
        listingImages: parseImages(formData.images || formData.listingImages),
      }
    : {
        listingStatus: null,
        forSale: false,
      };

  const existingLand = await prisma.land.findUnique({ where: { plotNumber } });

  const land = existingLand
    ? await prisma.land.update({
        where: { id: existingLand.id },
        data: { ...basePayload, ...marketplacePayload },
      })
    : await prisma.land.create({
        data: { ...basePayload, ...marketplacePayload },
      });

  await prisma.request.update({
    where: { id: request.id },
    data: { landId: land.id },
  });

  if (isMarketplace) {
    await notifyUser(request.userId, {
      title: 'Listing approved',
      message: `Your marketplace listing (${ref}) for plot ${plotNumber} is now live on the Land Portal marketplace. Buyers can view it and contact you in chat.`,
      type: 'success',
    });
  } else {
    await notifyUser(request.userId, {
      title: 'Request approved',
      message: `Your ${request.type} (${ref}) was approved. Plot ${plotNumber} is now listed under My Lands.`,
      type: 'success',
    });
  }

  return land;
}

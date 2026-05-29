import { buildDocumentsMap } from './documentUpload';
import { getRequiredDocs } from '../constants/documentRequirements';
import type { ServiceRequestType } from '../api/requests';

type FileRef = { uri: string; name?: string; type?: string; mimeType?: string } | null | undefined;

export const WORKFLOW_SUCCESS_STEPS = [
  'Admin will validate your documents.',
  'Your request is forwarded to a land officer for final review.',
  'You will receive a notification when approved or if more information is needed.',
];

export async function buildVerificationPayload(formData: {
  plotNumber: string;
  location: { region: string; zone: string; wereda: string; kebele: string };
  landSize: string;
  landUseType: string;
  coordinates?: { latitude: number | null; longitude: number | null };
  verificationReason?: string;
  additionalNotes?: string;
  documents: { titleDeed: FileRef; surveyMap: FileRef };
}) {
  const documents = await buildDocumentsMap([
    { label: 'Title Deed', file: formData.documents.titleDeed },
    { label: 'Survey Map', file: formData.documents.surveyMap },
  ]);

  return {
    plotNumber: formData.plotNumber.trim(),
    region: formData.location.region,
    zone: formData.location.zone,
    wereda: formData.location.wereda,
    kebele: formData.location.kebele,
    landSize: parseFloat(formData.landSize) || 0,
    landUseType: formData.landUseType,
    verificationReason: formData.verificationReason,
    additionalNotes: formData.additionalNotes,
    coordinates: formData.coordinates,
    documents,
  };
}

export async function buildRegistrationPayload(formData: {
  acquisitionType: string;
  isPreviouslyRegistered: string;
  applicantInfo: Record<string, unknown>;
  landInfo: {
    plotNumber: string;
    location: { region: string; zone: string; wereda: string; kebele: string };
    landSize: string;
    landUseType: string;
    [key: string]: unknown;
  };
  acquisitionDocuments: Record<string, FileRef>;
  commonDocuments: {
    surveyMap: FileRef;
    landPhotos: FileRef[];
    witnesses: Array<{ idCopy: FileRef; statement: FileRef }>;
  };
}) {
  const ai = formData.applicantInfo as Record<string, FileRef>;
  const landPhoto =
    formData.commonDocuments.landPhotos?.find((p) => p?.uri) || null;
  const witness = formData.commonDocuments.witnesses?.[0];

  const documents = await buildDocumentsMap([
    { label: 'Kebele ID (Front)', file: ai.kebeleIdFront },
    { label: 'Kebele ID (Back)', file: ai.kebeleIdBack },
    { label: 'Applicant Photo', file: ai.applicantPhoto },
    { label: 'Survey Map', file: formData.commonDocuments.surveyMap },
    { label: 'Land Photos (N/S/E/W)', file: landPhoto },
    { label: 'Witness IDs & Statements', file: witness?.idCopy || witness?.statement },
  ]);

  return {
    type: 'Registration Request' as ServiceRequestType,
    plotNumber: formData.landInfo.plotNumber.trim(),
    region: formData.landInfo.location.region,
    zone: formData.landInfo.location.zone,
    wereda: formData.landInfo.location.wereda,
    kebele: formData.landInfo.location.kebele,
    landSize: parseFloat(formData.landInfo.landSize) || 0,
    landUseType: formData.landInfo.landUseType,
    acquisitionType: formData.acquisitionType,
    isPreviouslyRegistered: formData.isPreviouslyRegistered,
    applicantInfo: formData.applicantInfo,
    landInfo: formData.landInfo,
    acquisitionDocuments: formData.acquisitionDocuments,
    documents,
  };
}

export async function buildTransferPayload(formData: {
  transferType: string;
  currentOwner: Record<string, unknown>;
  newOwner: Record<string, unknown>;
  landInfo: {
    plotNumber: string;
    location: { region: string; zone: string; wereda: string; kebele: string };
    landSize: string;
    landUseType: string;
  };
  transferDetails: Record<string, unknown>;
  documents: Record<string, FileRef>;
}) {
  const d = formData.documents;
  const transferAgreement =
    d.saleContract || d.giftAgreement || d.exchangeAgreement || d.courtOrder;

  const documents = await buildDocumentsMap([
    { label: 'Transfer Agreement', file: transferAgreement },
    { label: 'Current Owner ID', file: d.currentOwnerIdCopy || d.currentOwnershipCertificate },
    { label: 'New Owner ID', file: d.newOwnerIdCopy },
    { label: 'Tax Clearance', file: d.taxClearance },
  ]);

  return {
    plotNumber: formData.landInfo.plotNumber.trim(),
    region: formData.landInfo.location.region,
    zone: formData.landInfo.location.zone,
    wereda: formData.landInfo.location.wereda,
    kebele: formData.landInfo.location.kebele,
    landSize: parseFloat(formData.landInfo.landSize) || 0,
    landUseType: formData.landInfo.landUseType,
    transferType: formData.transferType,
    currentOwner: formData.currentOwner,
    newOwner: formData.newOwner,
    transferDetails: formData.transferDetails,
    documents,
  };
}

export async function buildSimpleServicePayload(
  type: ServiceRequestType,
  fields: {
    plotNumber: string;
    region?: string;
    zone?: string;
    kebele?: string;
    wereda?: string;
    landUseType?: string;
    landSize?: number;
    documents: Record<string, FileRef>;
    extra?: Record<string, unknown>;
  }
) {
  const required = getRequiredDocs(type);
  const docEntries = required.map((label) => ({
    label,
    file: fields.documents[label],
  }));
  const documents = await buildDocumentsMap(docEntries);

  return {
    plotNumber: fields.plotNumber.trim(),
    region: fields.region || 'Amhara',
    zone: fields.zone || '',
    wereda: fields.wereda || '',
    kebele: fields.kebele || '',
    landUseType: fields.landUseType,
    landSize: fields.landSize ?? 0,
    documents,
    ...fields.extra,
  };
}

import { normalizeStatus } from '../api/requests';

export type TimelineStepStatus = 'completed' | 'active' | 'pending' | 'rejected';

export type TimelineStep = {
  step: number;
  title: string;
  description: string;
  date: string | null;
  status: TimelineStepStatus;
};

export type ParsedRequest = {
  id: string;
  referenceNumber: string;
  type: string;
  status: string;
  createdAt: string;
  formData: Record<string, unknown>;
};

export function parseRequestFormData(formData: unknown): Record<string, unknown> {
  if (!formData) return {};
  if (typeof formData === 'string') {
    try {
      return JSON.parse(formData) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof formData === 'object') return formData as Record<string, unknown>;
  return {};
}

export function formatRequestLocation(fd: Record<string, unknown>): string {
  const loc = fd.location as { kebele?: string; wereda?: string; region?: string } | undefined;
  const parts = [
    fd.kebele || loc?.kebele,
    fd.wereda || fd.woreda || loc?.wereda,
    fd.zone,
    fd.region || loc?.region,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

function fmtDate(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return null;
  }
}

/** Admin → officer → citizen workflow timeline */
export function buildRequestTimeline(request: {
  status: string;
  createdAt: string;
  formData?: unknown;
}): TimelineStep[] {
  const statusNorm = normalizeStatus(request.status);
  const statusKey = statusNorm.toLowerCase();
  const fd = parseRequestFormData(request.formData);
  const adminReview = fd.adminReview as { decision?: string; reviewedAt?: string } | undefined;
  const officerReview = fd.officerReview as { decision?: string; reviewedAt?: string; notes?: string } | undefined;
  const forwardedAt = fd.forwardedAt as string | undefined;
  const submittedDate = fmtDate(request.createdAt);

  const isRejected = statusKey.includes('reject');
  const isApproved = statusKey.includes('approv');
  const isDocValidation = statusKey.includes('document validation');
  const isAssignedOfficer =
    statusKey.includes('assigned to officer') || Boolean(fd.forwardedByAdminId);
  const adminApproved = adminReview?.decision === 'approved' || isDocValidation || isAssignedOfficer;

  const stepStatus = (
    done: boolean,
    active: boolean,
    rejected = false
  ): TimelineStepStatus => {
    if (rejected) return 'rejected';
    if (done) return 'completed';
    if (active) return 'active';
    return 'pending';
  };

  const steps: TimelineStep[] = [
    {
      step: 1,
      title: 'Request submitted',
      description: 'Your application was received and queued for admin review',
      date: submittedDate,
      status: 'completed',
    },
    {
      step: 2,
      title: 'Admin document review',
      description: 'Admin validates your uploaded documents',
      date: fmtDate(adminReview?.reviewedAt),
      status: stepStatus(
        adminApproved || isAssignedOfficer || isApproved || isRejected,
        !adminApproved && !isRejected && !isApproved && !isAssignedOfficer,
        isRejected && !adminApproved && !isAssignedOfficer
      ),
    },
    {
      step: 3,
      title: 'Forwarded to officer',
      description: 'Admin approved documents and assigned a land officer',
      date: fmtDate(forwardedAt || (isAssignedOfficer ? adminReview?.reviewedAt : null)),
      status: stepStatus(
        isAssignedOfficer || isApproved || (isRejected && Boolean(officerReview)),
        isDocValidation && adminApproved && !isAssignedOfficer,
        isRejected && adminApproved && !isAssignedOfficer && !officerReview
      ),
    },
    {
      step: 4,
      title: 'Officer final review',
      description: 'Land officer performs final verification and approval',
      date: fmtDate(officerReview?.reviewedAt),
      status: stepStatus(
        isApproved || (isRejected && Boolean(officerReview)),
        isAssignedOfficer && !isApproved && !isRejected,
        isRejected && Boolean(officerReview)
      ),
    },
    {
      step: 5,
      title: isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Final decision',
      description: isApproved
        ? 'Your request was approved. Check notifications and My Lands.'
        : isRejected
          ? 'Your request was not approved. See notifications for details.'
          : 'You will be notified when a final decision is made',
      date: isApproved || isRejected ? fmtDate(officerReview?.reviewedAt || forwardedAt) : null,
      status: stepStatus(isApproved, !isApproved && !isRejected && isAssignedOfficer, isRejected),
    },
  ];

  return steps;
}

export function mapRequestToDetail(raw: {
  id: string;
  referenceNumber: string;
  type: string;
  status: string;
  createdAt: string;
  formData?: unknown;
  user?: { fullName?: string };
}) {
  const fd = parseRequestFormData(raw.formData);
  const documents = (fd.documents || {}) as Record<string, string>;
  const docAuthenticity = (fd.docAuthenticity as { docs?: Record<string, boolean> } | undefined)?.docs;
  const officerReview = fd.officerReview as { notes?: string } | undefined;

  const documentList = Object.keys(documents).map((name) => {
    const uploaded = Boolean(documents[name]);
    let docStatus = 'Uploaded';
    if (docAuthenticity?.[name] === true) docStatus = 'Verified';
    else if (docAuthenticity?.[name] === false) docStatus = 'Needs review';
    return { name, status: docStatus, uploaded };
  });

  const landSize = fd.landSize
    ? `${fd.landSize} m²`
    : typeof fd.landSize === 'number'
      ? `${fd.landSize} m²`
      : '—';

  return {
    id: raw.id,
    referenceNumber: raw.referenceNumber,
    requestType: raw.type,
    submissionDate: new Date(raw.createdAt).toLocaleDateString(),
    status: normalizeStatus(raw.status),
    plotNumber: String(fd.plotNumber || '—'),
    location: formatRequestLocation(fd),
    landSize,
    landUse: String(fd.landUseType || '—'),
    ownerName: String(fd.fullName || fd.ownerName || raw.user?.fullName || '—'),
    ownerNationalId: String(fd.faydaId || fd.ownerNationalId || '—'),
    documents: documentList.length > 0 ? documentList : [{ name: 'Supporting documents', status: 'Uploaded', uploaded: true }],
    timeline: buildRequestTimeline(raw),
    officerNotes: officerReview?.notes || '',
  };
}

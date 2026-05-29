/** Must match backend/src/utils/documentRequirements.ts */
export const REQUIRED_DOCS_BY_TYPE: Record<string, string[]> = {
  'Land Registration': [
    'Kebele ID (Front)',
    'Kebele ID (Back)',
    'Applicant Photo',
    'Survey Map',
    'Land Photos (N/S/E/W)',
    'Witness IDs & Statements',
  ],
  'Registration Request': [
    'Kebele ID (Front)',
    'Kebele ID (Back)',
    'Applicant Photo',
    'Survey Map',
    'Land Photos (N/S/E/W)',
    'Witness IDs & Statements',
  ],
  'Ownership Verification': ['Title Deed', 'Survey Map'],
  'Ownership Transfer': [
    'Transfer Agreement',
    'Current Owner ID',
    'New Owner ID',
    'Tax Clearance',
  ],
  'Marketplace Listing': [
    'Title Deed',
    'Survey Map',
    'Kebele ID (Front)',
    'Tax Clearance',
  ],
  'Land Subdivision': ['Title Deed', 'Survey Map', 'Subdivision Plan'],
  'Land Mutation': ['Title Deed', 'Survey Map', 'Mutation Application'],
  'Zoning Change': ['Title Deed', 'Survey Map', 'Zoning Application'],
};

export function getRequiredDocs(requestType: string): string[] {
  return REQUIRED_DOCS_BY_TYPE[requestType] || ['Supporting Documents'];
}

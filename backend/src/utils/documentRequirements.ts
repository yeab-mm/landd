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
};

export const getRequiredDocs = (requestType: string): string[] =>
    REQUIRED_DOCS_BY_TYPE[requestType] || ['Supporting Documents'];

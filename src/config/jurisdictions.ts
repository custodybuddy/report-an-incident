export type JurisdictionCountry = 'CA' | 'US';

export interface JurisdictionMetadata {
  id: string;
  country: JurisdictionCountry;
  region: string;
}

export const normalizeJurisdiction = (value: string): string => value.trim().toLowerCase();

export const JURISDICTIONS: JurisdictionMetadata[] = [
  // Canada
  { id: 'alberta', country: 'CA', region: 'Alberta' },
  { id: 'british columbia', country: 'CA', region: 'British Columbia' },
  { id: 'manitoba', country: 'CA', region: 'Manitoba' },
  { id: 'new brunswick', country: 'CA', region: 'New Brunswick' },
  { id: 'newfoundland and labrador', country: 'CA', region: 'Newfoundland and Labrador' },
  { id: 'northwest territories', country: 'CA', region: 'Northwest Territories' },
  { id: 'nova scotia', country: 'CA', region: 'Nova Scotia' },
  { id: 'nunavut', country: 'CA', region: 'Nunavut' },
  { id: 'ontario', country: 'CA', region: 'Ontario' },
  { id: 'prince edward island', country: 'CA', region: 'Prince Edward Island' },
  { id: 'quebec', country: 'CA', region: 'Quebec' },
  { id: 'saskatchewan', country: 'CA', region: 'Saskatchewan' },
  { id: 'yukon', country: 'CA', region: 'Yukon' },
  // USA
  { id: 'alabama', country: 'US', region: 'Alabama' },
  { id: 'alaska', country: 'US', region: 'Alaska' },
  { id: 'arizona', country: 'US', region: 'Arizona' },
  { id: 'arkansas', country: 'US', region: 'Arkansas' },
  { id: 'california', country: 'US', region: 'California' },
  { id: 'colorado', country: 'US', region: 'Colorado' },
  { id: 'connecticut', country: 'US', region: 'Connecticut' },
  { id: 'delaware', country: 'US', region: 'Delaware' },
  { id: 'district of columbia', country: 'US', region: 'District of Columbia' },
  { id: 'florida', country: 'US', region: 'Florida' },
  { id: 'georgia', country: 'US', region: 'Georgia' },
  { id: 'hawaii', country: 'US', region: 'Hawaii' },
  { id: 'idaho', country: 'US', region: 'Idaho' },
  { id: 'illinois', country: 'US', region: 'Illinois' },
  { id: 'indiana', country: 'US', region: 'Indiana' },
  { id: 'iowa', country: 'US', region: 'Iowa' },
  { id: 'kansas', country: 'US', region: 'Kansas' },
  { id: 'kentucky', country: 'US', region: 'Kentucky' },
  { id: 'louisiana', country: 'US', region: 'Louisiana' },
  { id: 'maine', country: 'US', region: 'Maine' },
  { id: 'maryland', country: 'US', region: 'Maryland' },
  { id: 'massachusetts', country: 'US', region: 'Massachusetts' },
  { id: 'michigan', country: 'US', region: 'Michigan' },
  { id: 'minnesota', country: 'US', region: 'Minnesota' },
  { id: 'mississippi', country: 'US', region: 'Mississippi' },
  { id: 'missouri', country: 'US', region: 'Missouri' },
  { id: 'montana', country: 'US', region: 'Montana' },
  { id: 'nebraska', country: 'US', region: 'Nebraska' },
  { id: 'nevada', country: 'US', region: 'Nevada' },
  { id: 'new hampshire', country: 'US', region: 'New Hampshire' },
  { id: 'new jersey', country: 'US', region: 'New Jersey' },
  { id: 'new mexico', country: 'US', region: 'New Mexico' },
  { id: 'new york', country: 'US', region: 'New York' },
  { id: 'north carolina', country: 'US', region: 'North Carolina' },
  { id: 'north dakota', country: 'US', region: 'North Dakota' },
  { id: 'ohio', country: 'US', region: 'Ohio' },
  { id: 'oklahoma', country: 'US', region: 'Oklahoma' },
  { id: 'oregon', country: 'US', region: 'Oregon' },
  { id: 'pennsylvania', country: 'US', region: 'Pennsylvania' },
  { id: 'rhode island', country: 'US', region: 'Rhode Island' },
  { id: 'south carolina', country: 'US', region: 'South Carolina' },
  { id: 'south dakota', country: 'US', region: 'South Dakota' },
  { id: 'tennessee', country: 'US', region: 'Tennessee' },
  { id: 'texas', country: 'US', region: 'Texas' },
  { id: 'utah', country: 'US', region: 'Utah' },
  { id: 'vermont', country: 'US', region: 'Vermont' },
  { id: 'virginia', country: 'US', region: 'Virginia' },
  { id: 'washington', country: 'US', region: 'Washington' },
  { id: 'west virginia', country: 'US', region: 'West Virginia' },
  { id: 'wisconsin', country: 'US', region: 'Wisconsin' },
  { id: 'wyoming', country: 'US', region: 'Wyoming' },
];

const JURISDICTION_INDEX = JURISDICTIONS.reduce<Record<string, JurisdictionMetadata>>((acc, jurisdiction) => {
  acc[jurisdiction.id] = jurisdiction;
  return acc;
}, {});

export const getJurisdictionMetadata = (value: string): JurisdictionMetadata | undefined =>
  JURISDICTION_INDEX[normalizeJurisdiction(value)];

export const CANADIAN_JURISDICTIONS = JURISDICTIONS.filter(jurisdiction => jurisdiction.country === 'CA').map(
  jurisdiction => jurisdiction.id
);

export const US_JURISDICTIONS = JURISDICTIONS.filter(jurisdiction => jurisdiction.country === 'US').map(
  jurisdiction => jurisdiction.id
);

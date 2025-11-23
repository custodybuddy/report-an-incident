// Enhanced jurisdiction system with expanded metadata for family-law use cases
// Includes court-structure notes for CA + US, habitual residence rules, and UCCJEA applicability

export type JurisdictionCountry = 'CA' | 'US';

export interface JurisdictionMetadata {
  id: string; // normalized lowercase key
  country: JurisdictionCountry;
  region: string; // display name
  notes?: string; // family‑court context: court structure + core rules
  hasUnifiedFamilyCourt?: boolean; // Canada only
  usesUCCJEA?: boolean; // US only
}

export const normalizeJurisdiction = (value: string): string => value.trim().toLowerCase();

export const JURISDICTIONS: JurisdictionMetadata[] = [
  // ----------------------------
  // CANADA — Provinces & Territories
  // ----------------------------
  {
    id: 'alberta',
    country: 'CA',
    region: 'Alberta',
    notes:
      'Family cases heard in Court of Justice (for parenting/support) and Court of King’s Bench (for divorce/property). No unified family court.',
    hasUnifiedFamilyCourt: false,
  },
  {
    id: 'british columbia',
    country: 'CA',
    region: 'British Columbia',
    notes:
      'Provincial Court handles most parenting/support; Supreme Court handles divorce/property. No unified family court.',
    hasUnifiedFamilyCourt: false,
  },
  {
    id: 'manitoba',
    country: 'CA',
    region: 'Manitoba',
    notes: 'Unified Family Court exists within Court of King’s Bench in some regions, handling all family matters.',
    hasUnifiedFamilyCourt: true,
  },
  {
    id: 'new brunswick',
    country: 'CA',
    region: 'New Brunswick',
    notes:
      'Provincial Court handles child protection; Court of King’s Bench handles divorce, parenting, and support. Unified in some areas.',
    hasUnifiedFamilyCourt: true,
  },
  {
    id: 'newfoundland and labrador',
    country: 'CA',
    region: 'Newfoundland and Labrador',
    notes: 'Unified Family Court in St. John’s; elsewhere split between Provincial Court and Supreme Court.',
    hasUnifiedFamilyCourt: true,
  },
  {
    id: 'northwest territories',
    country: 'CA',
    region: 'Northwest Territories',
    notes:
      'Supreme Court handles divorce/property; Territorial Court handles support/parenting for unmarried parents.',
    hasUnifiedFamilyCourt: false,
  },
  {
    id: 'nova scotia',
    country: 'CA',
    region: 'Nova Scotia',
    notes: 'Nova Scotia Family Court + Supreme Court (Family Division). Largely unified in major centres.',
    hasUnifiedFamilyCourt: true,
  },
  {
    id: 'nunavut',
    country: 'CA',
    region: 'Nunavut',
    notes: 'Single‑level Nunavut Court of Justice handles all family matters including divorce.',
    hasUnifiedFamilyCourt: true,
  },
  {
    id: 'ontario',
    country: 'CA',
    region: 'Ontario',
    notes:
      'Three‑court system: Ontario Court of Justice, Superior Court of Justice, and Unified Family Court (SCJ‑FC). Divorce & property only in Superior.',
    hasUnifiedFamilyCourt: true,
  },
  {
    id: 'prince edward island',
    country: 'CA',
    region: 'Prince Edward Island',
    notes: 'Provincial Court for child protection; Supreme Court for divorce, parenting, and support. Not unified.',
    hasUnifiedFamilyCourt: false,
  },
  {
    id: 'quebec',
    country: 'CA',
    region: 'Quebec',
    notes: 'Superior Court handles divorce and family matters; Court of Quebec handles youth protection. Civil‑law system.',
    hasUnifiedFamilyCourt: false,
  },
  {
    id: 'saskatchewan',
    country: 'CA',
    region: 'Saskatchewan',
    notes: 'Unified Family Court available in some judicial centres.',
    hasUnifiedFamilyCourt: true,
  },
  {
    id: 'yukon',
    country: 'CA',
    region: 'Yukon',
    notes:
      'Supreme Court handles divorce/property; Territorial Court handles support/parenting for unmarried parents.',
    hasUnifiedFamilyCourt: false,
  },

  // ----------------------------
  // UNITED STATES — 50 States + D.C.
  // All use UCCJEA for child‑custody jurisdiction.
  // ----------------------------
  ...[
    'alabama',
    'alaska',
    'arizona',
    'arkansas',
    'california',
    'colorado',
    'connecticut',
    'delaware',
    'district of columbia',
    'florida',
    'georgia',
    'hawaii',
    'idaho',
    'illinois',
    'indiana',
    'iowa',
    'kansas',
    'kentucky',
    'louisiana',
    'maine',
    'maryland',
    'massachusetts',
    'michigan',
    'minnesota',
    'mississippi',
    'missouri',
    'montana',
    'nebraska',
    'nevada',
    'new hampshire',
    'new jersey',
    'new mexico',
    'new york',
    'north carolina',
    'north dakota',
    'ohio',
    'oklahoma',
    'oregon',
    'pennsylvania',
    'rhode island',
    'south carolina',
    'south dakota',
    'tennessee',
    'texas',
    'utah',
    'vermont',
    'virginia',
    'washington',
    'west virginia',
    'wisconsin',
    'wyoming',
  ].map((state) => ({
    id: state,
    country: 'US' as JurisdictionCountry,
    region: state.replace(/\b\w/g, (c) => c.toUpperCase()),
    usesUCCJEA: true,
    notes:
      'State‑level family court system. Uses UCCJEA for custody jurisdiction based on home‑state rule (last 6 months).',
  })),
];

// Index lookup
const JURISDICTION_INDEX = JURISDICTIONS.reduce<Record<string, JurisdictionMetadata>>((acc, jurisdiction) => {
  acc[jurisdiction.id] = jurisdiction;
  return acc;
}, {});

// Lookup by normalized value
export const getJurisdictionMetadata = (value: string): JurisdictionMetadata | undefined =>
  JURISDICTION_INDEX[normalizeJurisdiction(value)];

// Convenience arrays
export const CANADIAN_JURISDICTIONS = JURISDICTIONS.filter((j) => j.country === 'CA').map((j) => j.id);
export const US_JURISDICTIONS = JURISDICTIONS.filter((j) => j.country === 'US').map((j) => j.id);

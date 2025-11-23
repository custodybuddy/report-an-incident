export const PREDEFINED_PARTIES = [
  'Other Parent',
  'Grandparent',
  'Law Enforcement',
  'Teacher',
  'Neighbor',
  'Other'
];

export const PREDEFINED_CHILDREN = ['First Child', 'Second Child', 'Other'];

export const EVIDENCE_CATEGORIES = [
  'Screenshots',
  'Text Messages',
  'Emails',
  'Audio',
  'Video',
  'Documents',
  'Other'
];

import { JURISDICTIONS as JURISDICTION_METADATA } from '@/legal/jurisdictions';

export const JURISDICTIONS = JURISDICTION_METADATA.map((j) => j.region);

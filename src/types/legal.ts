export type BehaviorType =
  | 'isolation'
  | 'intimidation'
  | 'surveillance'
  | 'economicAbuse'
  | 'threats'
  | 'litigationAbuse'
  | 'manipulation'
  | 'propertyDamage';

export interface StatuteRef {
  label: string;
  link: string;
}

export interface AllegationSummary {
  raw: string;
  type: BehaviorType | string;
  statutes: StatuteRef[];
  summary: string;
}

export interface JurisdictionInfo {
  country: 'CA' | 'US';
  region: string;
  id: string;
}

export interface LegalSummaryResponse {
  allegations: AllegationSummary[];
  jurisdiction: JurisdictionInfo;
  generatedAt: string;
}

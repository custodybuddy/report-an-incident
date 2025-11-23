import { COERCIVE_CONTROL_GLOSSARY, CANADA_FEDERAL_STATUTES, CANADA_PROVINCIAL_ACTS, US_COERCIVE_CONTROL_LAWS } from '@/legal/data';
import { type JurisdictionInfo } from '@/types/legal';

interface PromptPayload {
  task: 'extract_and_map';
  input: string;
  jurisdiction: JurisdictionInfo;
  steps: string[];
  taxonomy: Record<string, string>;
  output_format: Record<string, unknown>;
  legal_tables: {
    COERCIVE_CONTROL_GLOSSARY: typeof COERCIVE_CONTROL_GLOSSARY;
    CANADA_FEDERAL_STATUTES: typeof CANADA_FEDERAL_STATUTES;
    CANADA_PROVINCIAL_ACTS: typeof CANADA_PROVINCIAL_ACTS;
    US_COERCIVE_CONTROL_LAWS: typeof US_COERCIVE_CONTROL_LAWS;
  };
}

export const buildLegalPromptPayload = (narrative: string, jurisdiction: JurisdictionInfo): PromptPayload => {
  const taxonomy = {
    isolation: 'Limiting contact, blocking support networks',
    intimidation: 'Threats, coercion, fear-based control',
    surveillance: 'Monitoring devices, stalking, tracking',
    economicAbuse: 'Financial control or deprivation',
    threats: 'Express or implied threats of harm',
    litigationAbuse: 'Using legal system to harass or intimidate',
    manipulation: 'Gaslighting, coercion, emotional control',
    propertyDamage: 'Destroying property to threaten or control',
  };

  return {
    task: 'extract_and_map',
    input: narrative,
    jurisdiction,
    steps: [
      '1. Extract each allegation or harmful behaviour.',
      '2. Classify behaviour using this taxonomy: isolation, intimidation, surveillance, economicAbuse, threats, litigationAbuse, manipulation, propertyDamage.',
      '3. Map each behaviour to statutes using the provided legal-link tables.',
      '4. Output a professional, neutral, court-ready paragraph with embedded hyperlinks.',
      '5. Never give legal advice; only cite statutes and describe behaviour neutrally.',
    ],
    taxonomy,
    output_format: {
      allegations: [
        {
          raw: 'string',
          type: 'string (classification)',
          statutes: [{ label: 'string', link: 'string' }],
          summary: 'narrative paragraph with embedded hyperlinks',
        },
      ],
    },
    legal_tables: {
      COERCIVE_CONTROL_GLOSSARY,
      CANADA_FEDERAL_STATUTES,
      CANADA_PROVINCIAL_ACTS,
      US_COERCIVE_CONTROL_LAWS,
    },
  };
};

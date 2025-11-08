import { type IncidentData } from '@/types';

import { META_PROMPT } from './constants';

const formatList = (items: string[], fallback = 'None specified') =>
  items.length > 0 ? items.join(', ') : fallback;

export const buildPromptContext = (incidentData: IncidentData): string => {
  const evidenceDetails =
    incidentData.evidence.length > 0
      ? incidentData.evidence
          .map(
            evidence =>
              `- File: ${evidence.name} (Category: ${evidence.category})\n  Description: ${evidence.description || 'N/A'}`
          )
          .join('\n')
      : 'None specified';

  return `
INCIDENT DETAILS:
- Date: ${incidentData.date || 'Not specified'}
- Time: ${incidentData.time || 'Not specified'}
- Jurisdiction: ${incidentData.jurisdiction || 'Not specified'}
- Case Number: ${incidentData.caseNumber || 'N/A'}
- Parties Involved: ${formatList(incidentData.parties)}
- Children Present/Affected: ${formatList(incidentData.children)}
- Evidence Attached:\n${evidenceDetails}
- Original Account: ${incidentData.narrative}
`;
};

export const composePrompt = (
  incidentData: IncidentData,
  template: string
): string => {
  const context = buildPromptContext(incidentData);
  const instructions = template.includes('{{CONTEXT}}')
    ? template.replace('{{CONTEXT}}', context)
    : `${template.trim()}\n${context}`;
  return `${META_PROMPT}
${instructions.trim()}`;
};


export const PREDEFINED_PARTIES: string[] = ['Ex-spouse/Co-parent', 'Their current partner', 'Grandparent', 'Other family member', 'Police/First Responder', 'Witness'];
export const PREDEFINED_CHILDREN: string[] = ['Child A', 'Child B', 'Child C'];
export const JURISDICTIONS: string[] = ['Ontario, Canada', 'British Columbia, Canada', 'Alberta, Canada', 'Quebec, Canada', 'Other Canadian Province', 'US State - Please specify'];

export const EVIDENCE_CATEGORIES = ['Screenshot', 'Document', 'Audio', 'Video', 'Other'] as const;
export type EvidenceCategory = (typeof EVIDENCE_CATEGORIES)[number];

export const AI_INSIGHT_LABEL = 'AI Insight:';

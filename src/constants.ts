
import { type Step } from '../types';
import {
  ConsentIcon,
  DateTimeIcon,
  EvidenceIcon,
  InvolvedPartiesIcon,
  NarrativeIcon,
  ReviewExportIcon,
} from './components/icons/StepIcons';

export const PREDEFINED_PARTIES: string[] = ['Ex-spouse/Co-parent', 'Their current partner', 'Grandparent', 'Other family member', 'Police/First Responder', 'Witness'];
export const PREDEFINED_CHILDREN: string[] = ['Child A', 'Child B', 'Child C'];
export const JURISDICTIONS: string[] = ['Ontario, Canada', 'British Columbia, Canada', 'Alberta, Canada', 'Quebec, Canada', 'Other Canadian Province', 'US State - Please specify'];

// Step metadata keeps presentation concerns lightweight by referencing reusable icon components.
export const STEPS: Step[] = [
  { number: 1, title: 'Consent', icon: ConsentIcon },
  { number: 2, title: 'Date & Time', icon: DateTimeIcon },
  { number: 3, title: 'What Happened', icon: NarrativeIcon },
  { number: 4, title: 'Who Was Involved', icon: InvolvedPartiesIcon },
  { number: 5, title: 'Location & Evidence', icon: EvidenceIcon },
  { number: 6, title: 'Review & Export', icon: ReviewExportIcon },
];

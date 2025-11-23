import { ConsentIcon, DateTimeIcon, EvidenceIcon, InvolvedPartiesIcon, NarrativeIcon } from '@/components/icons/StepIcons';
import { type Step } from '@/types/ui';

export const STEPS: Step[] = [
  { number: 1, title: 'Consent', icon: ConsentIcon },
  { number: 2, title: 'Date & Time', icon: DateTimeIcon },
  { number: 3, title: 'Narrative', icon: NarrativeIcon },
  { number: 4, title: 'Involved Parties', icon: InvolvedPartiesIcon },
  { number: 5, title: 'Evidence', icon: EvidenceIcon },
  { number: 6, title: 'Review & Export', icon: EvidenceIcon },
];

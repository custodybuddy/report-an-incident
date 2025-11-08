import { type Step } from '@/types/ui';
import {
  ConsentIcon,
  DateTimeIcon,
  EvidenceIcon,
  InvolvedPartiesIcon,
  NarrativeIcon,
  ReviewExportIcon,
} from '@/components/icons/StepIcons';

export const STEPS: Step[] = [
  { number: 1, title: 'Consent', icon: ConsentIcon },
  { number: 2, title: 'Date & Time', icon: DateTimeIcon },
  { number: 3, title: 'What Happened', icon: NarrativeIcon },
  { number: 4, title: 'Who Was Involved', icon: InvolvedPartiesIcon },
  { number: 5, title: 'Location & Evidence', icon: EvidenceIcon },
  { number: 6, title: 'Review & Export', icon: ReviewExportIcon },
];

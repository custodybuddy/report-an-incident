import type { ComponentType, SVGProps } from 'react';

export type StepIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface Step {
  number: number;
  title: string;
  icon: StepIcon;
}

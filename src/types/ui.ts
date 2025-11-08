import type { ComponentType, SVGProps } from 'react';

export type StepIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface Step {
  number: number;
  title: string;
  icon: StepIcon;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface SeverityStyles {
  card: string;
  label: string;
  value: string;
  accent: string;
}

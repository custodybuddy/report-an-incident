import type { ComponentType } from 'react';

export interface Step {
  number: number;
  title: string;
  icon: ComponentType<{ className?: string }>;
}

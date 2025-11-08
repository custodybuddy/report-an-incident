import { useMemo } from 'react';

import {
  compileLegalReferences,
  type LegalReferencesOptions,
  type LegalReferencesResult,
} from '@/services/reportReferences';

export interface UseLegalReferencesOptions extends LegalReferencesOptions {}
export interface UseLegalReferencesResult extends LegalReferencesResult {}

export const useLegalReferences = ({
  legalInsights,
  sources,
}: UseLegalReferencesOptions): UseLegalReferencesResult =>
  useMemo(
    () => compileLegalReferences({ legalInsights, sources }),
    [legalInsights, sources],
  );

export default useLegalReferences;

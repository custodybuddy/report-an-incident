import { useMemo } from 'react';

import {
  compileLegalReferences as compileLegalReferencesInternal,
  type LegalReferencesOptions,
  type LegalReferencesResult,
} from '@/services/reportReferences';

export type { LegalReference } from '@/services/reportReferences';
export {
  compileLegalReferences,
  deriveReadableTitle,
  getDomainFromUrl,
} from '@/services/reportReferences';

export interface UseLegalReferencesOptions extends LegalReferencesOptions {}
export interface UseLegalReferencesResult extends LegalReferencesResult {}

export const useLegalReferences = ({
  legalInsights,
  sources,
}: UseLegalReferencesOptions): UseLegalReferencesResult =>
  useMemo(
    () => compileLegalReferencesInternal({ legalInsights, sources }),
    [legalInsights, sources],
  );

export default useLegalReferences;

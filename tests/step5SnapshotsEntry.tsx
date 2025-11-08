import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import type { EvidenceFile } from '../types';
import EvidenceCard from '../src/components/steps/step5/EvidenceCard';
import GlossaryTile, { type GlossaryEntry } from '../src/components/steps/step5/GlossaryTile';
import ResourceLinksSection, {
  type ResourceLinksSectionItem,
} from '../src/components/steps/step5/ResourceLinksSection';
import SeverityRationaleCard from '../src/components/steps/step5/SeverityRationaleCard';
import SeveritySummaryCard from '../src/components/steps/step5/SeveritySummaryCard';
import { getSeverityTheme } from '../src/components/steps/step5/severityThemes';

const SNAPSHOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/components/steps/step5/__snapshots__'
);

const ensureSnapshotDir = () => {
  if (!existsSync(SNAPSHOT_DIR)) {
    mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
};

const readSnapshot = (name: string) => {
  const snapshotPath = path.join(SNAPSHOT_DIR, `${name}.html`);
  return existsSync(snapshotPath) ? readFileSync(snapshotPath, 'utf8') : null;
};

const writeSnapshot = (name: string, content: string) => {
  ensureSnapshotDir();
  const snapshotPath = path.join(SNAPSHOT_DIR, `${name}.html`);
  writeFileSync(snapshotPath, `${content}\n`, 'utf8');
};

const compareSnapshot = (name: string, actual: string) => {
  const expected = readSnapshot(name);
  if (!expected || process.env.UPDATE_STEP5_SNAPSHOTS === 'true') {
    writeSnapshot(name, actual.trim());
    return;
  }

  assert.equal(actual.trim(), expected.trim(), `${name} snapshot mismatch`);
};

const renderSeveritySummary = () => {
  const theme = getSeverityTheme('High');
  const markup = renderToStaticMarkup(<SeveritySummaryCard severity="High" theme={theme} />);
  compareSnapshot('SeveritySummaryCard', markup);
};

const renderSeverityRationale = () => {
  const theme = getSeverityTheme('Medium');
  const markup = renderToStaticMarkup(
    <SeverityRationaleCard severity="Medium" theme={theme}>
      <div dangerouslySetInnerHTML={{ __html: '<p>Example rationale</p>' }} />
    </SeverityRationaleCard>
  );
  compareSnapshot('SeverityRationaleCard', markup);
};

const renderEvidenceCard = () => {
  const evidence: EvidenceFile = {
    id: '1',
    name: 'Screenshot.png',
    size: 3072,
    type: 'image/png',
    category: 'Screenshot',
    description: 'A critical screenshot',
    storageId: 'storage-1',
    aiAnalysis: 'Supports timeline of events.',
  };

  const markup = renderToStaticMarkup(<EvidenceCard evidence={evidence} index={0} />);
  compareSnapshot('EvidenceCard', markup);
};

const renderResourceLinks = () => {
  const items: ResourceLinksSectionItem[] = [
    {
      title: 'Important Statute',
      url: 'https://example.com/statute',
      description: 'Review this statute for compliance requirements.',
    },
  ];

  const markup = renderToStaticMarkup(
    <ResourceLinksSection
      title="Sample Section"
      items={items}
      emptyMessage="No resources available."
    />
  );
  compareSnapshot('ResourceLinksSection', markup);
};

const renderGlossaryTiles = () => {
  const entry: GlossaryEntry = {
    title: 'Document Preservation',
    description: 'Maintain authenticated copies of all exhibits.',
  };

  const markup = renderToStaticMarkup(<GlossaryTile {...entry} />);
  compareSnapshot('GlossaryTile', markup);
};

export const runSnapshots = () => {
  renderSeveritySummary();
  renderSeverityRationale();
  renderEvidenceCard();
  renderResourceLinks();
  renderGlossaryTiles();
};

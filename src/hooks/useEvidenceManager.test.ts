import { strict as assert } from 'node:assert';
import { beforeEach, describe, test, mock } from 'node:test';
import React from 'react';
import type { IncidentData, IncidentDataUpdater } from '@/types';
import { useEvidenceManager, __resetEvidenceManagerDependencies, __setEvidenceManagerDependencies } from './useEvidenceManager';

type AsyncMock = ReturnType<typeof mock.fn>;

let saveEvidenceDataMock: AsyncMock;
let deleteEvidenceDataMock: AsyncMock;
let analyzeEvidenceMock: AsyncMock;

beforeEach(() => {
  saveEvidenceDataMock = mock.fn(async () => {});
  deleteEvidenceDataMock = mock.fn(async () => {});
  analyzeEvidenceMock = mock.fn(async () => '');
  __resetEvidenceManagerDependencies();
  __setEvidenceManagerDependencies({
    saveEvidenceData: saveEvidenceDataMock,
    deleteEvidenceData: deleteEvidenceDataMock,
    analyzeEvidence: analyzeEvidenceMock
  });
});

interface RenderHookResult<TReturn, TProps> {
  result: () => TReturn;
  rerender: (props: TProps) => void;
  unmount: () => void;
}

const createHookRenderer = <TProps, TReturn>(
  hook: (props: TProps) => TReturn,
  initialProps: TProps
): RenderHookResult<TReturn, TProps> => {
  let props = initialProps;
  let currentResult: TReturn;
  const states: unknown[] = [];
  const callbacks: Array<{ deps?: unknown[]; value: unknown }> = [];
  const effects: Array<{ deps?: unknown[]; cleanup?: () => void }> = [];

  const run = () => {
    let stateIndex = 0;
    let callbackIndex = 0;
    let effectIndex = 0;
    const pendingEffects: Array<() => void> = [];

    const dispatcher = {
      useState(initialValue: unknown) {
        const index = stateIndex++;
        if (!(index in states)) {
          states[index] = typeof initialValue === 'function'
            ? (initialValue as () => unknown)()
            : initialValue;
        }

        const setState = (value: unknown) => {
          const updater = typeof value === 'function'
            ? (value as (prev: unknown) => unknown)(states[index])
            : value;
          if (!Object.is(states[index], updater)) {
            states[index] = updater;
            run();
          }
        };

        return [states[index], setState] as const;
      },
      useEffect(create: () => void | (() => void), deps?: unknown[]) {
        const index = effectIndex++;
        const previous = effects[index];
        const hasChanged =
          !previous ||
          !deps ||
          !previous.deps ||
          deps.length !== previous.deps.length ||
          deps.some((dep, depIndex) => !Object.is(dep, previous.deps![depIndex]));

        effects[index] = { deps, cleanup: previous?.cleanup };

        if (hasChanged) {
          pendingEffects.push(() => {
            previous?.cleanup?.();
            const cleanup = create();
            effects[index].cleanup = typeof cleanup === 'function' ? cleanup : undefined;
          });
        }
      },
      useCallback(callback: unknown, deps?: unknown[]) {
        const index = callbackIndex++;
        const previous = callbacks[index];
        const hasChanged =
          !previous ||
          !deps ||
          !previous.deps ||
          deps.length !== previous.deps.length ||
          deps.some((dep, depIndex) => !Object.is(dep, previous.deps![depIndex]));

        if (hasChanged) {
          callbacks[index] = { value: callback, deps };
        }

        return callbacks[index].value;
      }
    };

    const internals = (React as any)
      .__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    if (!internals) {
      throw new Error('React internals unavailable in test environment.');
    }

    const previousDispatcher = internals.H;
    internals.H = dispatcher;

    try {
      currentResult = hook(props);
    } finally {
      internals.H = previousDispatcher;
    }

    pendingEffects.forEach(effect => effect());
  };

  run();

  return {
    result: () => currentResult,
    rerender: nextProps => {
      props = nextProps;
      run();
    },
    unmount: () => {
      effects.forEach(effect => effect.cleanup?.());
      effects.length = 0;
    }
  };
};

const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));

const createFileReader = (base64 = 'mock-base64') => {
  class MockFileReader {
    result: string | ArrayBuffer | null = null;
    onload: ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null = null;
    onerror: ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null = null;

    readAsDataURL() {
      this.result = `data:image/png;base64,${base64}`;
      this.onload?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
    }
  }

  (globalThis as any).FileReader = MockFileReader;
};

const ensureFileGlobal = () => {
  if (typeof File === 'undefined') {
    class PolyfillFile extends Blob {
      name: string;
      lastModified: number;

      constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
        super(bits, options);
        this.name = name;
        this.lastModified = options?.lastModified ?? Date.now();
      }
    }
    (globalThis as any).File = PolyfillFile;
  }
};

describe('useEvidenceManager', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: mock.fn(() => 'evidence-123')
      },
      configurable: true
    });
    ensureFileGlobal();
    createFileReader();
  });

  const buildIncident = (): IncidentData => ({
    consentAcknowledged: false,
    date: '',
    time: '',
    narrative: 'Initial narrative',
    parties: [],
    children: [],
    jurisdiction: '',
    evidence: [],
    caseNumber: ''
  });

  const setupHook = (incident: IncidentData) => {
    let rerenderHook: (() => void) | null = null;

    const updateData: IncidentDataUpdater = (key, value) => {
      const resolveValue = (updater: typeof value) =>
        typeof updater === 'function' ? (updater as (prev: IncidentData) => IncidentData[typeof key])(incident) : updater;

      if (key === 'evidence') {
        const next = resolveValue(value) as IncidentData['evidence'];
        incident = { ...incident, evidence: next };
      } else if (key === 'narrative') {
        const next = resolveValue(value) as IncidentData['narrative'];
        incident = { ...incident, narrative: next };
      } else if (key === 'jurisdiction') {
        const next = resolveValue(value) as IncidentData['jurisdiction'];
        incident = { ...incident, jurisdiction: next };
      } else if (key === 'caseNumber') {
        const next = resolveValue(value) as IncidentData['caseNumber'];
        incident = { ...incident, caseNumber: next };
      }

      rerenderHook?.();
    };

    const renderer = createHookRenderer(useEvidenceManager, {
      narrative: incident.narrative,
      evidence: incident.evidence,
      updateData
    });

    rerenderHook = () => {
      renderer.rerender({
        narrative: incident.narrative,
        evidence: incident.evidence,
        updateData
      });
    };

    return { renderer, getIncident: () => incident };
  };

  test('handles file upload and completes successful analysis', async () => {
    saveEvidenceDataMock.mock.mockImplementation(async () => undefined);
    let resolveAnalysis: ((value: string) => void) | null = null;
    analyzeEvidenceMock.mock.mockImplementation((() => new Promise(resolve => {
      resolveAnalysis = resolve;
    })) as any);

    const incident = buildIncident();
    const { renderer, getIncident } = setupHook(incident);

    const file = new File(['content'], 'image.png', { type: 'image/png' });
    const event = { target: { files: [file], value: 'initial' } } as unknown as React.ChangeEvent<HTMLInputElement>;

    await renderer.result().handleFileChange(event);

    assert.equal(event.target.value, '');
    assert.equal(saveEvidenceDataMock.mock.calls.length, 1);
    assert.deepEqual(saveEvidenceDataMock.mock.calls[0].arguments, ['evidence-123', 'mock-base64']);

    const updatedIncident = getIncident();
    assert.equal(updatedIncident.evidence.length, 1);
    assert.equal(updatedIncident.evidence[0].base64, 'mock-base64');
    assert.equal(renderer.result().analysisState['evidence-123'], true);
    assert.equal(analyzeEvidenceMock.mock.calls.length, 1);

    resolveAnalysis?.('analysis complete');
    await flushMicrotasks();

    assert.equal(renderer.result().analysisState['evidence-123'], undefined);
    const finalIncident = getIncident();
    assert.equal(finalIncident.evidence[0].aiAnalysis, 'analysis complete');
    assert.equal(finalIncident.evidence[0].base64, undefined);
  });

  test('handles analysis failure and provides fallback message', async () => {
    saveEvidenceDataMock.mock.mockImplementation(async () => undefined);
    analyzeEvidenceMock.mock.mockImplementation((() => Promise.reject(new Error('failure'))) as any);

    const incident = buildIncident();
    const { renderer, getIncident } = setupHook(incident);

    const file = new File(['content'], 'image.png', { type: 'image/png' });
    const event = { target: { files: [file], value: 'initial' } } as unknown as React.ChangeEvent<HTMLInputElement>;

    await renderer.result().handleFileChange(event);
    await flushMicrotasks();

    assert.equal(renderer.result().analysisState['evidence-123'], undefined);
    const updatedIncident = getIncident();
    assert.equal(updatedIncident.evidence[0].aiAnalysis, 'Analysis failed due to a system error.');
    assert.equal(updatedIncident.evidence[0].base64, undefined);
  });

  test('removes evidence and clears tracking state', async () => {
    saveEvidenceDataMock.mock.mockImplementation(async () => undefined);
    let resolveAnalysis: (() => void) | null = null;
    analyzeEvidenceMock.mock.mockImplementation((() => new Promise(resolve => {
      resolveAnalysis = resolve as () => void;
    })) as any);

    const incident = buildIncident();
    const { renderer, getIncident } = setupHook(incident);

    const file = new File(['content'], 'image.png', { type: 'image/png' });
    const event = { target: { files: [file], value: 'initial' } } as unknown as React.ChangeEvent<HTMLInputElement>;

    await renderer.result().handleFileChange(event);
    assert.equal(renderer.result().analysisState['evidence-123'], true);

    await renderer.result().removeEvidenceItem('evidence-123');
    assert.equal(deleteEvidenceDataMock.mock.calls.length, 1);
    assert.equal(renderer.result().analysisState['evidence-123'], undefined);
    assert.equal(getIncident().evidence.length, 0);

    resolveAnalysis?.();
    await flushMicrotasks();
    assert.equal(renderer.result().analysisState['evidence-123'], undefined);
  });
});

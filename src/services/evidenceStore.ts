const DB_NAME = 'incident-report';
const STORE_NAME = 'evidence';
const DB_VERSION = 1;

type EvidenceRecord = {
  id: string;
  data: string;
  updatedAt: number;
};

const isIndexedDBAvailable =
  typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

const memoryStore = new Map<string, string>();

let dbPromise: Promise<IDBDatabase> | null = null;

const getDatabase = (): Promise<IDBDatabase> => {
  if (!isIndexedDBAvailable) {
    return Promise.reject(new Error('IndexedDB is not available in this environment.'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
    });
  }

  return dbPromise;
};

const runTransaction = <T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  if (!isIndexedDBAvailable) {
    return Promise.reject(new Error('IndexedDB is not available in this environment.'));
  }

  return getDatabase().then(
    db =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = callback(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
      })
  );
};

export const saveEvidenceData = async (id: string, data: string): Promise<void> => {
  if (!isIndexedDBAvailable) {
    memoryStore.set(id, data);
    return;
  }

  const record: EvidenceRecord = {
    id,
    data,
    updatedAt: Date.now()
  };

  await runTransaction('readwrite', store => store.put(record));
};

export const getEvidenceData = async (id: string): Promise<string | undefined> => {
  if (!isIndexedDBAvailable) {
    return memoryStore.get(id);
  }

  const record = await runTransaction<any>('readonly', store => store.get(id));
  if (record && typeof record.data === 'string') {
    return record.data;
  }
  return undefined;
};

export const deleteEvidenceData = async (id: string): Promise<void> => {
  if (!isIndexedDBAvailable) {
    memoryStore.delete(id);
    return;
  }

  await runTransaction('readwrite', store => store.delete(id));
};

export const deleteEvidenceBatch = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;

  if (!isIndexedDBAvailable) {
    ids.forEach(id => memoryStore.delete(id));
    return;
  }

  const db = await getDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const handleError = () =>
      reject(transaction.error ?? new Error('IndexedDB batch delete failed'));

    transaction.oncomplete = () => resolve();
    transaction.onerror = handleError;
    transaction.onabort = handleError;

    ids.forEach(id => {
      store.delete(id);
    });
  });
};

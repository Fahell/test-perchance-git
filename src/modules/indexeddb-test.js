const DB_NAME = 'TestPerchanceDB';
const DB_VERSION = 1;

const STORE_TEST_DATA = 'test_data';
const STORE_AI_RESULTS = 'ai_results';
const AI_LIMITS = { maxTexts: 3, maxImages: 3 };
const TEST_VALUES = {
  str_test: 'Hello, IndexedDB!',
  num_int: 42,
  num_float: 3.14159,
  bool_val: true,
  obj_player: { name: 'Hero', level: 5, inventory: ['sword', 'potion'], stats: { hp: 100, mp: 50 } },
  arr_items: ['espada', 'pocao', 'mapa', 'escudo'],
  null_val: null,
  date_val: new Date('2024-01-15T10:30:00Z'),
  u8_val: new Uint8Array([1, 2, 3, 4, 5]),
};

export const indexeddbTest = {
  available: typeof indexedDB !== 'undefined',
  db: null,

  // ─── Lifecycle ───
  async openDB() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_TEST_DATA)) {
          db.createObjectStore(STORE_TEST_DATA);
        }
        if (!db.objectStoreNames.contains(STORE_AI_RESULTS)) {
          const aiStore = db.createObjectStore(STORE_AI_RESULTS, { keyPath: 'key' });
          aiStore.createIndex('type', 'type', { unique: false });
          aiStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        console.log('✅ [IDB] Database opened');
        resolve(this.db);
      };
      request.onerror = (e) => {
        console.error('❌ [IDB] Open failed:', e.target.error);
        reject(e.target.error);
      };
    });
  },

  closeDB() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('🔒 [IDB] Database closed');
    }
  },

  async deleteDB() {
    this.closeDB();
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => { console.log('🗑️ [IDB] Database deleted'); resolve(true); };
      request.onerror = (e) => { console.error('❌ [IDB] Delete failed:', e.target.error); reject(e.target.error); };
    });
  },

  // ─── Generic Store Operations ───
  async _tx(storeName, mode) {
    const db = await this.openDB();
    return db.transaction(storeName, mode).objectStore(storeName);
  },

  async _request(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async put(storeName, key, value) {
    const store = await this._tx(storeName, 'readwrite');
    // For stores with keyPath, the key is inside the object - don't pass it separately
    if (store.keyPath) {
      return this._request(store.put(value));
    }
    return this._request(store.put(value, key));
  },

  async get(storeName, key) {
    const store = await this._tx(storeName, 'readonly');
    return this._request(store.get(key));
  },

  async getAllKeys(storeName) {
    const store = await this._tx(storeName, 'readonly');
    return this._request(store.getAllKeys());
  },

  async getAll(storeName) {
    const store = await this._tx(storeName, 'readonly');
    return this._request(store.getAll());
  },

  async deleteKey(storeName, key) {
    const store = await this._tx(storeName, 'readwrite');
    return this._request(store.delete(key));
  },

  async clearStore(storeName) {
    const store = await this._tx(storeName, 'readwrite');
    return this._request(store.clear());
  },

  async count(storeName) {
    const store = await this._tx(storeName, 'readonly');
    return this._request(store.count());
  },

  // ─── Test Data Store ───
  async saveAllTypes() {
    const results = [];
    for (const [key, value] of Object.entries(TEST_VALUES)) {
      try {
        await this.put(STORE_TEST_DATA, key, value);
        results.push({ key, type: typeof value, saved: true });
      } catch (e) {
        results.push({ key, type: typeof value, saved: false, error: e.message });
      }
    }
    console.log(`✅ [IDB] Saved ${results.filter(r => r.saved).length}/${results.length} types`);
    return results;
  },

  async roundTrip(key, value) {
    await this.put(STORE_TEST_DATA, key, value);
    const retrieved = await this.get(STORE_TEST_DATA, key);
    const match = JSON.stringify(value) === JSON.stringify(retrieved);
    return { key, saved: value, retrieved, match };
  },

  async runPrimitiveTestSuite() {
    console.log('🗃️ [IDB] Running primitive test suite...');
    await this.openDB();

    const saveResults = await this.saveAllTypes();
    const keys = await this.getAllKeys(STORE_TEST_DATA);

    const roundTrips = [];
    for (const [key, value] of Object.entries(TEST_VALUES)) {
      const retrieved = await this.get(STORE_TEST_DATA, key);
      const match = JSON.stringify(value) === JSON.stringify(retrieved);
      roundTrips.push({ key, expected: typeof value, saved: value, retrieved, match });
    }

    const deleteResult = await this.deleteKey(STORE_TEST_DATA, 'str_test');
    const keysAfterDelete = await this.getAllKeys(STORE_TEST_DATA);

    const estimate = await this.getStorageEstimate();

    return {
      saved: saveResults,
      totalKeys: keys.length,
      roundTrips,
      deleteSuccess: !!deleteResult,
      keysAfterDelete: keysAfterDelete.length,
      storageEstimate: estimate,
    };
  },

  // ─── AI Results Store ───
  async _enforceLimit(type) {
    const max = type === 'text' ? AI_LIMITS.maxTexts : AI_LIMITS.maxImages;
    const all = await this.loadAIResults();
    const ofType = all.filter(r => r.type === type).sort((a, b) => a.timestamp - b.timestamp);
    while (ofType.length >= max) {
      const oldest = ofType.shift();
      await this.deleteKey(STORE_AI_RESULTS, oldest.key);
    }
  },

  async saveAIText(text, metadata = {}) {
    await this._enforceLimit('text');
    const key = `ai_text_${Date.now()}`;
    const record = {
      key,
      type: 'text',
      content: text,
      timestamp: Date.now(),
      metadata: { chars: text.length, ...metadata },
    };
    await this.put(STORE_AI_RESULTS, key, record);
    console.log(`✅ [IDB] AI text saved: ${key}`);
    return record;
  },

  async saveAIImage(dataUrl, metadata = {}) {
    await this._enforceLimit('image');
    const key = `ai_image_${Date.now()}`;
    const record = {
      key,
      type: 'image',
      content: dataUrl,
      timestamp: Date.now(),
      metadata: { sizeKB: Math.round(dataUrl.length / 1024), ...metadata },
    };
    await this.put(STORE_AI_RESULTS, key, record);
    console.log(`✅ [IDB] AI image saved: ${key}`);
    return record;
  },

  async saveAIBatch(texts, images) {
    const results = { texts: [], images: [] };
    for (const t of (texts || []).slice(0, AI_LIMITS.maxTexts)) {
      results.texts.push(await this.saveAIText(t.text, t.metadata));
    }
    for (const img of (images || []).slice(0, AI_LIMITS.maxImages)) {
      results.images.push(await this.saveAIImage(img.dataUrl, img.metadata));
    }
    return results;
  },

  async loadAIResults() {
    const all = await this.getAll(STORE_AI_RESULTS);
    return all.sort((a, b) => b.timestamp - a.timestamp);
  },

  async loadAITexts() {
    const all = await this.loadAIResults();
    return all.filter(r => r.type === 'text');
  },

  async loadAIImages() {
    const all = await this.loadAIResults();
    return all.filter(r => r.type === 'image');
  },

  async clearAIResults() {
    await this.clearStore(STORE_AI_RESULTS);
    console.log('🗑️ [IDB] AI results cleared');
  },

  async getAIResultsCount() {
    const all = await this.loadAIResults();
    return {
      texts: all.filter(r => r.type === 'text').length,
      images: all.filter(r => r.type === 'image').length,
      total: all.length,
    };
  },

  // ─── Cross-store ───
  async clearAll() {
    await this.openDB();
    await this.clearStore(STORE_TEST_DATA);
    await this.clearStore(STORE_AI_RESULTS);
    console.log('🗑️ [IDB] All stores cleared');
  },

  // ─── Diagnostics ───
  async getStorageEstimate() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { available: false };
    }
    const est = await navigator.storage.estimate();
    return {
      available: true,
      quota: (est.quota / (1024 * 1024)).toFixed(2) + ' MB',
      usage: (est.usage / (1024 * 1024)).toFixed(4) + ' MB',
      percent: ((est.usage / est.quota) * 100).toFixed(4) + '%',
    };
  },

  checkSupport() {
    return {
      indexedDB: typeof indexedDB !== 'undefined',
      idbKeyRange: typeof IDBKeyRange !== 'undefined',
      storageEstimate: !!(navigator.storage && navigator.storage.estimate),
    };
  },
};

console.log('🗃️ [IDB] IndexedDB test module loaded');
if (indexeddbTest.available) {
  console.log('✅ [IDB] IndexedDB available');
} else {
  console.warn('⚠️ [IDB] IndexedDB NOT available');
}

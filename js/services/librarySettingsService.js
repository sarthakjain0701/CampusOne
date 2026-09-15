/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LIBRARY SETTINGS SERVICE
   Canonical configuration source of truth for Library operations
   Persisted in Firestore collection: librarySettings / doc: config
   ========================================================================== */

const DEFAULT_LIBRARY_SETTINGS = {
  issuePeriodDays: 15,
  overdueFinePerDay: 2,
  reissueEnabled: true,
  returnRemindersEnabled: true,
  reminderDays: [13, 14, 15],
  newBookNotificationsEnabled: true,
  maxBooksPerStudent: 3,
  updatedAt: new Date().toISOString()
};

const LibrarySettingsService = {
  db: null,
  cache: { ...DEFAULT_LIBRARY_SETTINGS },
  isLoaded: false,

  _getDb() {
    if (!this.db && window.FirebaseService && window.FirebaseService.db) {
      this.db = window.FirebaseService.db;
    }
    if (!this.db) {
      throw new Error("Firestore database is not initialized.");
    }
    return this.db;
  },

  /**
   * Fetch library configuration from Firestore (or return cached version).
   * @param {boolean} forceRefresh 
   * @returns {Promise<Object>}
   */
  async getSettings(forceRefresh = false) {
    if (this.isLoaded && !forceRefresh) {
      return this.cache;
    }

    try {
      const db = this._getDb();
      const doc = await db.collection('librarySettings').doc('config').get();

      if (doc.exists) {
        this.cache = { ...DEFAULT_LIBRARY_SETTINGS, ...doc.data() };
      } else {
        // Document missing, use validated defaults in memory
        this.cache = { ...DEFAULT_LIBRARY_SETTINGS };
      }
      this.isLoaded = true;
    } catch (err) {
      console.warn("LibrarySettingsService: Failed to fetch from Firestore, fallback to defaults.", err);
      if (!this.isLoaded) {
        this.cache = { ...DEFAULT_LIBRARY_SETTINGS };
      }
    }

    return this.cache;
  },

  /**
   * Synchronous accessor for in-memory settings cache.
   * @returns {Object}
   */
  getSettingsSync() {
    return this.cache || DEFAULT_LIBRARY_SETTINGS;
  },

  /**
   * Save settings to Firestore and update in-memory cache.
   * @param {Object} newSettings 
   * @returns {Promise<Object>}
   */
  async saveSettings(newSettings) {
    const validated = this.validateSettings(newSettings);
    const db = this._getDb();

    const payload = {
      ...validated,
      updatedAt: new Date().toISOString()
    };

    await db.collection('librarySettings').doc('config').set(payload, { merge: true });

    this.cache = { ...this.cache, ...payload };
    this.isLoaded = true;

    return this.cache;
  },

  /**
   * Validate library configuration object.
   * @param {Object} settings 
   * @returns {Object} validated settings
   */
  validateSettings(settings) {
    const issuePeriod = parseInt(settings.issuePeriodDays, 10);
    if (isNaN(issuePeriod) || issuePeriod < 1 || issuePeriod > 15) {
      throw new Error("Default Issue Period must be an integer between 1 and 15 days.");
    }

    const fine = parseFloat(settings.overdueFinePerDay);
    if (isNaN(fine) || fine < 0 || fine > 500) {
      throw new Error("Overdue Fine per day must be a non-negative numeric value.");
    }

    const maxBooks = parseInt(settings.maxBooksPerStudent, 10);
    if (isNaN(maxBooks) || maxBooks < 1 || maxBooks > 20) {
      throw new Error("Maximum Books Per Student must be an integer between 1 and 20.");
    }

    return {
      issuePeriodDays: issuePeriod,
      overdueFinePerDay: fine,
      reissueEnabled: Boolean(settings.reissueEnabled),
      returnRemindersEnabled: Boolean(settings.returnRemindersEnabled),
      reminderDays: Array.isArray(settings.reminderDays) && settings.reminderDays.length > 0
        ? settings.reminderDays.map(n => parseInt(n, 10))
        : [13, 14, 15],
      newBookNotificationsEnabled: Boolean(settings.newBookNotificationsEnabled),
      maxBooksPerStudent: maxBooks
    };
  },

  getDefaults() {
    return { ...DEFAULT_LIBRARY_SETTINGS };
  }
};

window.LibrarySettingsService = LibrarySettingsService;

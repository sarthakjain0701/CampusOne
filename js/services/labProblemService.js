/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - LAB PROBLEM REPORTING SERVICE
   Handles all Firestore operations for the Lab Problem Reporting module.
   ========================================================================== */

const LabProblemService = {
  _unsubscribe: null,

  async _ensureDb() {
    if (!window.FirebaseService) throw new Error("Firebase Service is not loaded.");
    await window.FirebaseService.init();
    if (!window.FirebaseService.db) throw new Error("Firestore is not available.");
    return window.FirebaseService.db;
  },

  _collection() {
    return 'labProblemReports';
  },

  // --------------------------------------------------------------------------
  // CONSTANTS
  // --------------------------------------------------------------------------
  CATEGORIES: [
    { id: 'ELECTRICAL', label: 'Electrical / Light' },
    { id: 'WIFI_INTERNET', label: 'Wi-Fi / Internet' },
    { id: 'COMPUTER_PC', label: 'Computer / PC' },
    { id: 'PRINTER', label: 'Printer' },
    { id: 'AC_FAN', label: 'AC / Fan' },
    { id: 'POWER_SOCKET', label: 'Power / Socket' },
    { id: 'FURNITURE', label: 'Furniture' },
    { id: 'LAB_EQUIPMENT', label: 'Lab Equipment' },
    { id: 'CLEANING_MAINT', label: 'Cleaning / Maintenance' },
    { id: 'SECURITY_LOCK', label: 'Security / Lock' },
    { id: 'MISSING_EQUIP', label: 'Missing Equipment' },
    { id: 'DAMAGED_EQUIP', label: 'Damaged Equipment' },
    { id: 'OTHER', label: 'Other' }
  ],

  STATUSES: [
    { id: 'SUBMITTED', label: 'Submitted', color: '#2563EB', bg: '#EFF6FF' },
    { id: 'ACKNOWLEDGED', label: 'Acknowledged', color: '#06B6D4', bg: '#ECFEFF' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: '#EA580C', bg: '#FFF7ED' },
    { id: 'RESOLVED', label: 'Resolved', color: '#16A34A', bg: '#F0FDF4' },
    { id: 'CLOSED', label: 'Closed', color: '#64748B', bg: '#F8FAFC' }
  ],

  PRIORITIES: [
    { id: 'LOW', label: 'Low', color: '#64748B' },
    { id: 'MEDIUM', label: 'Medium', color: '#2563EB' },
    { id: 'HIGH', label: 'High', color: '#EA580C' },
    { id: 'URGENT', label: 'Urgent', color: '#DC2626' }
  ],

  getCategoryLabel(id) {
    const cat = this.CATEGORIES.find(c => c.id === id);
    return cat ? cat.label : id;
  },

  getStatusDetails(id) {
    return this.STATUSES.find(s => s.id === id) || this.STATUSES[0];
  },

  getPriorityDetails(id) {
    return this.PRIORITIES.find(p => p.id === id) || this.PRIORITIES[0];
  },

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async createReport(reportData) {
    const user = typeof authService !== 'undefined' ? authService.getCurrentUser() : null;
    if (!user) throw new Error("Must be logged in to report a problem.");

    const db = await this._ensureDb();
    
    const payload = {
      reportedByUid: user.uid || user.id,
      reportedByEmail: user.email,
      reportedByName: user.name || user.displayName || user.email,
      laboratoryId: reportData.laboratoryId || 'GENERAL',
      laboratoryName: reportData.laboratoryName || 'General Laboratory',
      category: reportData.category,
      title: reportData.title.trim(),
      description: reportData.description.trim(),
      priority: reportData.priority || 'MEDIUM',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const docRef = await db.collection(this._collection()).add(payload);
      return { id: docRef.id, ...payload };
    } catch (err) {
      console.error("Failed to submit problem report", err);
      throw new Error("Could not submit problem report. Please try again.");
    }
  },

  // --------------------------------------------------------------------------
  // READ
  // --------------------------------------------------------------------------
  async getReportsByUser(uid) {
    const db = await this._ensureDb();
    try {
      const snapshot = await db.collection(this._collection())
        .where('reportedByUid', '==', uid)
        .orderBy('createdAt', 'desc')
        .get();
      
      const reports = [];
      snapshot.forEach(doc => reports.push({ id: doc.id, ...doc.data() }));
      return reports;
    } catch (err) {
      console.error("Failed to fetch user reports", err);
      throw new Error("Could not load your reports.");
    }
  },

  async getAllReports(limit = 100) {
    const db = await this._ensureDb();
    try {
      const snapshot = await db.collection(this._collection())
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      const reports = [];
      snapshot.forEach(doc => reports.push({ id: doc.id, ...doc.data() }));
      return reports;
    } catch (err) {
      console.error("Failed to fetch all reports", err);
      throw new Error("Could not load all reports.");
    }
  },

  async getReportById(id) {
    const db = await this._ensureDb();
    try {
      const doc = await db.collection(this._collection()).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (err) {
      console.error("Failed to get report details", err);
      throw new Error("Could not load report details.");
    }
  },

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async updateReportStatus(reportId, newStatus, currentUserId, currentUserRole) {
    if (currentUserRole !== 'ADMIN') {
      throw new Error("Only an Admin can update problem report status.");
    }

    const db = await this._ensureDb();
    try {
      await db.collection(this._collection()).doc(reportId).update({
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error("Failed to update report status", err);
      throw new Error("Could not update report status.");
    }
  },

  // --------------------------------------------------------------------------
  // LISTENERS
  // --------------------------------------------------------------------------
  listenToUserReports(uid, callback) {
    this.stopListening();
    this._ensureDb().then(db => {
      this._unsubscribe = db.collection(this._collection())
        .where('reportedByUid', '==', uid)
        .onSnapshot(snapshot => {
          const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort client-side if compound index missing, but standard orderBy usually fine if indexed
          reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          callback(reports);
        }, err => console.error("Snapshot error:", err));
    }).catch(err => console.error(err));
  },
  
  listenToAllReports(callback, limit = 100) {
    this.stopListening();
    this._ensureDb().then(db => {
      this._unsubscribe = db.collection(this._collection())
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .onSnapshot(snapshot => {
          const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(reports);
        }, err => console.error("Admin Snapshot error:", err));
    }).catch(err => console.error(err));
  },

  stopListening() {
    if (this._unsubscribe && typeof this._unsubscribe === 'function') {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }
};

window.LabProblemService = LabProblemService;

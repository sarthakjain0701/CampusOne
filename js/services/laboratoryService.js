class LaboratoryService {
  constructor() {
    this.db = null;
  }

  init() {
    if (typeof FirebaseService !== 'undefined') {
      this.db = FirebaseService.db;
    }
  }

  ensureDb() {
    if (!this.db) {
      this.init();
      if (!this.db) {
        throw new Error("LaboratoryService: Firestore database not initialized");
      }
    }
  }

  // A. My Laboratories - get labs assigned to this Lab Assistant
  async getMyLaboratories(userId) {
    this.ensureDb();
    try {
      const snapshot = await this.db.collection('laboratories')
        .where('assistantId', '==', userId)
        .get();
      
      const labs = [];
      snapshot.forEach(doc => {
        labs.push({ id: doc.id, ...doc.data() });
      });
      return labs;
    } catch (err) {
      console.error("Error fetching laboratories:", err);
      return [];
    }
  }

  // C. Equipment for a laboratory
  async getLabEquipment(labId) {
    this.ensureDb();
    try {
      const snapshot = await this.db.collection('laboratories').doc(labId).collection('equipment').get();
      const equipment = [];
      snapshot.forEach(doc => {
        equipment.push({ id: doc.id, ...doc.data() });
      });
      return equipment;
    } catch (err) {
      console.error("Error fetching equipment:", err);
      return [];
    }
  }

  // F. Lab Instructions
  async getLabInstructions(labId) {
    this.ensureDb();
    try {
      const snapshot = await this.db.collection('laboratories').doc(labId).collection('instructions').get();
      const instructions = [];
      snapshot.forEach(doc => {
        instructions.push({ id: doc.id, ...doc.data() });
      });
      return instructions;
    } catch (err) {
      console.error("Error fetching instructions:", err);
      return [];
    }
  }

  // Helper for Maintenance (My Reports)
  async getMaintenanceReports(labName) {
    this.ensureDb();
    try {
      const snapshot = await this.db.collection('labProblems')
        .where('laboratoryName', '==', labName)
        .get();
      const reports = [];
      snapshot.forEach(doc => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      return reports;
    } catch (err) {
      console.error("Error fetching maintenance reports:", err);
      return [];
    }
  }
}

window.LaboratoryService = new LaboratoryService();

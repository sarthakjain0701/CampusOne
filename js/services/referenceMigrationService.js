/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - REFERENCE MIGRATION SERVICE
   ========================================================================== */

const ReferenceMigrationService = {
  async runMigration() {
    console.log("Starting Reference Data Migration...");
    if (!window.FirebaseService || !window.FirebaseService.db) {
      console.error("Firebase not initialized.");
      return { status: 'ERROR', message: "Firebase not initialized." };
    }

    const db = window.FirebaseService.db;
    const { doc, getDoc, setDoc } = window.FirebaseService.firestore;
    
    if (!window.MOCK_DATA) {
      console.error("MOCK_DATA not found.");
      return { status: 'ERROR', message: "MOCK_DATA baseline not found." };
    }

    const report = {
      subjects: { total: MOCK_DATA.subjects.length, created: 0, existing: 0, errors: 0 },
      classes: { total: MOCK_DATA.classes.length, created: 0, existing: 0, errors: 0 },
      departments: { total: MOCK_DATA.departments.length, created: 0, existing: 0, errors: 0 },
      conflicts: []
    };

    const migrateCollection = async (collectionName, dataArray, reportKey) => {
      for (const item of dataArray) {
        if (!item.id) continue;
        try {
          const docRef = doc(db, collectionName, item.id);
          const snap = await getDoc(docRef);
          
          if (!snap.exists()) {
            // Write strictly the existing object
            const payload = { ...item };
            // Ensure ID is matched to document
            await setDoc(docRef, payload);
            report[reportKey].created++;
          } else {
            // Already exists, do not overwrite to prevent trashing production data
            report[reportKey].existing++;
          }
        } catch (e) {
          console.error(`Error migrating ${item.id} to ${collectionName}:`, e);
          report[reportKey].errors++;
          report.conflicts.push(`Error writing ${item.id} to ${collectionName}: ${e.message}`);
        }
      }
    };

    // Migrate Departments
    console.log("Migrating Departments...");
    await migrateCollection('departments', MOCK_DATA.departments || [], 'departments');

    // Migrate Classes
    console.log("Migrating Classes...");
    await migrateCollection('classes', MOCK_DATA.classes || [], 'classes');

    // Migrate Subjects
    console.log("Migrating Subjects...");
    await migrateCollection('subjects', MOCK_DATA.subjects || [], 'subjects');

    console.log("Migration Complete.", report);
    return { status: 'SUCCESS', report };
  }
};

window.ReferenceMigrationService = ReferenceMigrationService;

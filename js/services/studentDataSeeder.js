/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - STUDENT DATA SEEDER
   Safe demo data injection for testing the Student Module.
   All records will be marked with isTestData: true.
   ========================================================================== */

const StudentDataSeeder = {
  _getDb() {
    return window.firebase.firestore();
  },

  async seedLearningResources(student) {
    if (!student) return;
    const db = this._getDb();
    
    // Check if resources already exist
    const snapshot = await db.collection('learningResources')
      .where('department', '==', student.department)
      .where('semester', '==', Number(student.semester))
      .limit(1)
      .get();
      
    if (!snapshot.empty) {
      console.log("Learning resources already exist, skipping seed.");
      return;
    }

    console.log("Seeding test learning resources...");
    const batch = db.batch();
    
    const resources = [
      {
        title: "Introduction to Advanced Algorithms",
        description: "Comprehensive notes for Unit 1.",
        type: "document",
        url: "https://example.com/notes.pdf",
        department: student.department,
        semester: Number(student.semester),
        subjectId: "SUB001",
        uploadedBy: "FAC001",
        uploadedAt: new Date().toISOString(),
        isTestData: true
      },
      {
        title: "Database Normalization Video Lecture",
        description: "Recorded lecture covering 1NF to BCNF.",
        type: "video",
        url: "https://example.com/video.mp4",
        department: student.department,
        semester: Number(student.semester),
        subjectId: "SUB002",
        uploadedBy: "FAC002",
        uploadedAt: new Date().toISOString(),
        isTestData: true
      }
    ];

    resources.forEach(res => {
      const docRef = db.collection('learningResources').doc();
      batch.set(docRef, { ...res, id: docRef.id });
    });

    await batch.commit();
    console.log("Learning resources seeded successfully.");
  },

  async seedExamResults(student) {
    if (!student) return;
    const db = this._getDb();
    
    const snapshot = await db.collection('examResults')
      .where('studentId', '==', student.id)
      .limit(1)
      .get();
      
    if (!snapshot.empty) {
      console.log("Exam results already exist, skipping seed.");
      return;
    }

    console.log("Seeding test exam results...");
    const batch = db.batch();
    
    const results = [
      {
        studentId: student.id,
        subjectId: "SUB001",
        semester: String(student.semester),
        examType: "End Term",
        marks: 85,
        maxMarks: 100,
        grade: "A+",
        credits: 4,
        isTestData: true
      },
      {
        studentId: student.id,
        subjectId: "SUB002",
        semester: String(student.semester),
        examType: "End Term",
        marks: 78,
        maxMarks: 100,
        grade: "A",
        credits: 3,
        isTestData: true
      },
      {
        studentId: student.id,
        subjectId: "SUB003",
        semester: String(student.semester),
        examType: "End Term",
        marks: 92,
        maxMarks: 100,
        grade: "O",
        credits: 4,
        isTestData: true
      }
    ];

    results.forEach(res => {
      const docRef = db.collection('examResults').doc();
      batch.set(docRef, { ...res, id: docRef.id });
    });

    await batch.commit();
    console.log("Exam results seeded successfully.");
  },

  async seedTimetable(student, classId) {
    if (!student || !classId) return;
    const db = this._getDb();
    
    const snapshot = await db.collection('timetables')
      .where('classId', '==', classId)
      .limit(1)
      .get();
      
    if (!snapshot.empty) {
      console.log("Timetable already exists, skipping seed.");
      return;
    }

    console.log("Seeding test timetable...");
    const batch = db.batch();
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const slots = [
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '12:00' }
    ];

    days.forEach(day => {
      slots.forEach((slot, idx) => {
        const docRef = db.collection('timetables').doc();
        batch.set(docRef, {
          id: docRef.id,
          classId: classId,
          sectionId: classId, // Usually maps to classId in this schema
          day: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          subjectId: `SUB00${idx + 1}`,
          facultyId: `FAC00${idx + 1}`,
          room: `Room ${100 + idx}`,
          status: 'ACTIVE',
          isTestData: true
        });
      });
    });

    await batch.commit();
    console.log("Timetable seeded successfully.");
  },

  async seedAll(student, classId) {
    try {
      await this.seedLearningResources(student);
      await this.seedExamResults(student);
      await this.seedTimetable(student, classId);
      return true;
    } catch (err) {
      console.error("Failed to seed student data:", err);
      return false;
    }
  }
};

window.StudentDataSeeder = StudentDataSeeder;

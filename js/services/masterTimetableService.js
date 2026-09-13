/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - MASTER TIMETABLE SERVICE
   Handles recurring weekly section-wise timetables and date-specific resolution.
   ========================================================================== */

const MasterTimetableService = {
  get db() {
    return window.FirebaseService ? window.FirebaseService.db : null;
  },

  // --------------------------------------------------------------------------
  // MASTER TIMETABLE CRUD
  // --------------------------------------------------------------------------

  async getMasterTimetable(sectionId, academicYear) {
    if (!this.db) return null;
    try {
      const snapshot = await this.db.collection('masterTimetables')
        .where('sectionId', '==', sectionId)
        .where('academicYear', '==', academicYear)
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (e) {
      console.error("Error fetching master timetable:", e);
      return null;
    }
  },

  async getAllMasterTimetables(academicYear) {
    if (!this.db) return [];
    try {
      let query = this.db.collection('masterTimetables');
      if (academicYear) {
        query = query.where('academicYear', '==', academicYear);
      }
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Error fetching all master timetables:", e);
      return [];
    }
  },

  async saveMasterTimetable(data) {
    if (!this.db) throw new Error("Database not available.");
    
    // Check if exists
    const existing = await this.getMasterTimetable(data.sectionId, data.academicYear);
    
    const payload = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    if (existing) {
      await this.db.collection('masterTimetables').doc(existing.id).update(payload);
      return { id: existing.id, ...payload };
    } else {
      payload.createdAt = new Date().toISOString();
      const docRef = await this.db.collection('masterTimetables').add(payload);
      return { id: docRef.id, ...payload };
    }
  },

  async deleteMasterTimetable(id) {
    if (!this.db) return;
    await this.db.collection('masterTimetables').doc(id).delete();
  },

  // --------------------------------------------------------------------------
  // EXCEPTIONS (One-Day Overrides)
  // --------------------------------------------------------------------------

  async getExceptionsForDate(dateStr) {
    if (!this.db) return [];
    try {
      const snapshot = await this.db.collection('timetableExceptions')
        .where('date', '==', dateStr)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Error fetching exceptions:", e);
      return [];
    }
  },

  async saveException(data) {
    if (!this.db) throw new Error("Database not available.");
    data.createdAt = new Date().toISOString();
    const docRef = await this.db.collection('timetableExceptions').add(data);
    return { id: docRef.id, ...data };
  },

  async deleteException(id) {
    if (!this.db) return;
    await this.db.collection('timetableExceptions').doc(id).delete();
  },

  // --------------------------------------------------------------------------
  // RESOLVERS (Daily Schedule calculation)
  // --------------------------------------------------------------------------

  getDayOfWeekString(dateStr) {
    const d = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()]; // Note: getDay() uses local timezone
  },

  /**
   * Resolve today's classes for a specific section, including overrides.
   */
  async getScheduleForDate(sectionId, dateStr, academicYear = '2026-27') {
    const dayOfWeek = this.getDayOfWeekString(dateStr);
    
    // 1. Get Master Timetable for Section
    const master = await this.getMasterTimetable(sectionId, academicYear);
    if (!master || !master.slots) return [];

    // 2. Filter slots for this Day
    let daySlots = master.slots.filter(s => s.day === dayOfWeek && s.active !== false);

    // 3. Get Exceptions for this date
    const exceptions = await this.getExceptionsForDate(dateStr);
    const sectionExceptions = exceptions.filter(e => e.sectionId === sectionId);

    // 4. Apply Exceptions
    let finalSlots = [];
    
    // Add master slots, modifying or excluding based on exceptions
    for (const slot of daySlots) {
      const override = sectionExceptions.find(e => e.originalTimetableSlotId === slot.slotId);
      
      if (override) {
        if (override.type === 'CANCEL') {
          // Do not include
          continue;
        } else {
          // Modify slot based on override
          finalSlots.push({
            ...slot,
            subjectId: override.newSubjectId || slot.subjectId,
            facultyId: override.newFacultyId || slot.facultyId,
            room: override.newRoom || slot.room,
            startTime: override.newStartTime || slot.startTime,
            endTime: override.newEndTime || slot.endTime,
            isOverride: true
          });
        }
      } else {
        finalSlots.push(slot);
      }
    }

    // Sort by start time
    finalSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return finalSlots;
  },

  /**
   * Resolve today's classes for a specific FACULTY across all master timetables.
   */
  async getFacultyScheduleForDate(facultyId, dateStr, academicYear = '2026-27') {
    const dayOfWeek = this.getDayOfWeekString(dateStr);
    
    // 1. Get ALL Master Timetables (cached or fetched)
    const allMasters = await this.getAllMasterTimetables(academicYear);
    
    // 2. Get ALL Exceptions for this date
    const exceptions = await this.getExceptionsForDate(dateStr);

    let facultySlots = [];

    // 3. Iterate over all masters to find this faculty's slots
    for (const master of allMasters) {
      const daySlots = (master.slots || []).filter(s => s.day === dayOfWeek && s.active !== false);
      const sectionExceptions = exceptions.filter(e => e.sectionId === master.sectionId);

      for (const slot of daySlots) {
        const override = sectionExceptions.find(e => e.originalTimetableSlotId === slot.slotId);
        
        let activeFacultyId = slot.facultyId;
        let finalSlot = { ...slot, sectionId: master.sectionId, departmentId: master.departmentId, semesterId: master.semesterId, academicYear: master.academicYear, masterId: master.id };

        if (override) {
          if (override.type === 'CANCEL') continue;
          if (override.newFacultyId) activeFacultyId = override.newFacultyId;
          finalSlot.subjectId = override.newSubjectId || finalSlot.subjectId;
          finalSlot.room = override.newRoom || finalSlot.room;
          finalSlot.startTime = override.newStartTime || finalSlot.startTime;
          finalSlot.endTime = override.newEndTime || finalSlot.endTime;
          finalSlot.isOverride = true;
        }

        if (activeFacultyId === facultyId) {
          facultySlots.push(finalSlot);
        }
      }
    }

    // Sort by start time
    facultySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return facultySlots;
  },

  /**
   * Conflict Detection
   */
  detectConflicts(slots) {
    const conflicts = [];
    // Basic detection: same faculty at same time on same day
    const facultyMap = {};
    const roomMap = {};

    for (const s of slots) {
      if (!s.day || !s.startTime || !s.endTime) continue;
      
      // Faculty Conflict
      if (s.facultyId) {
        const key = `${s.day}_${s.facultyId}`;
        if (!facultyMap[key]) facultyMap[key] = [];
        for (const existing of facultyMap[key]) {
          if ((s.startTime >= existing.startTime && s.startTime < existing.endTime) ||
              (s.endTime > existing.startTime && s.endTime <= existing.endTime) ||
              (s.startTime <= existing.startTime && s.endTime >= existing.endTime)) {
            conflicts.push(`Faculty conflict: ${s.facultyId} on ${s.day} at ${s.startTime}`);
          }
        }
        facultyMap[key].push(s);
      }

      // Room Conflict
      if (s.room && s.room.trim() !== '' && s.room !== '-') {
        const key = `${s.day}_${s.room}`;
        if (!roomMap[key]) roomMap[key] = [];
        for (const existing of roomMap[key]) {
          if ((s.startTime >= existing.startTime && s.startTime < existing.endTime) ||
              (s.endTime > existing.startTime && s.endTime <= existing.endTime) ||
              (s.startTime <= existing.startTime && s.endTime >= existing.endTime)) {
            conflicts.push(`Room conflict: ${s.room} on ${s.day} at ${s.startTime}`);
          }
        }
        roomMap[key].push(s);
      }
    }
    return conflicts;
  }
};

window.MasterTimetableService = MasterTimetableService;

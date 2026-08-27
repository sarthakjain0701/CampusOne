/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - HOLIDAY CALENDAR SERVICE
   ========================================================================== */

const HolidayService = {
  getAllHolidays() {
    const localHolidays = DataStore.get('HOLIDAYS') || [];
    
    // Attempt to merge in Google Calendar events if the service exists
    if (typeof GoogleCalendarService !== 'undefined') {
      const googleEvents = GoogleCalendarService.getEvents();
      const merged = [...localHolidays];
      
      googleEvents.forEach(ge => {
        // Prevent duplicates based on externalEventId or exact date+name match
        const isDuplicate = merged.some(lh => 
          (lh.externalEventId && lh.externalEventId === ge.externalEventId) ||
          (lh.date === ge.date && lh.name.toLowerCase() === ge.name.toLowerCase())
        );
        if (!isDuplicate) {
          merged.push(ge);
        }
      });
      return merged;
    }
    
    return localHolidays;
  },

  getHolidayById(id) {
    return this.getAllHolidays().find(h => h.id === id) || null;
  },

  getHolidays(year = null) {
    // Only return ACTIVE or GOOGLE_EVENT
    const list = this.getAllHolidays().filter(h => h.status === 'ACTIVE' || h.status === 'GOOGLE_EVENT');
    if (year && year !== 'ALL') {
      return list.filter(h => h.date.startsWith(String(year)));
    }
    return list;
  },

  getUpcomingHolidays(limit = 5) {
    const today = new Date().toISOString().split('T')[0];
    const active = this.getAllHolidays().filter(h => h.status === 'ACTIVE' && h.date >= today);
    active.sort((a, b) => a.date.localeCompare(b.date));
    return active.slice(0, limit);
  },

  createHoliday(data) {
    if (!Validation.isRequired(data.name)) throw new Error("Holiday Name is required.");
    if (!Validation.isRequired(data.date)) throw new Error("Holiday Date is required.");
    if (!Validation.isRequired(data.type)) throw new Error("Holiday Type is required.");

    const validTypes = ['NATIONAL', 'COLLEGE', 'FESTIVAL', 'ACADEMIC', 'OTHER'];
    if (!validTypes.includes(data.type)) {
      throw new Error(`Invalid type. Allowed types: ${validTypes.join(', ')}`);
    }

    const newHoliday = {
      id: "HOL" + String(Date.now()).slice(-6),
      name: data.name.trim(),
      date: data.date,
      type: data.type,
      description: data.description ? data.description.trim() : "",
      academicYear: data.academicYear || "2026-27",
      status: data.status || "ACTIVE",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    DataStore.addItem('HOLIDAYS', newHoliday);
    return newHoliday;
  },

  updateHoliday(id, data) {
    return DataStore.updateItem('HOLIDAYS', id, data);
  },

  deleteHoliday(id) {
    DataStore.deleteItem('HOLIDAYS', id);
  },

  searchHolidays({ month, year, type, query }) {
    let list = this.getAllHolidays();

    if (year && year !== 'ALL') {
      list = list.filter(h => h.date.startsWith(String(year)));
    }

    if (month && month !== 'ALL') {
      const monthStr = String(month).padStart(2, '0');
      list = list.filter(h => h.date.split('-')[1] === monthStr);
    }

    if (type && type !== 'ALL') {
      list = list.filter(h => h.type === type);
    }

    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(h => h.name.toLowerCase().includes(q) || h.description.toLowerCase().includes(q));
    }

    return list;
  }
};

window.HolidayService = HolidayService;

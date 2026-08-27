/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - GOOGLE CALENDAR SERVICE
   ========================================================================== */

const GoogleCalendarService = {
  events: [],
  hasSynced: false,
  isSyncing: false,

  /**
   * Fetches events from Google Calendar API
   * Uses configuration from window.ENV
   */
  async syncEventsToMemory(timeMin, timeMax) {
    if (this.isSyncing) return;
    
    // Check if configuration exists
    if (!window.ENV || !window.ENV.GOOGLE_CALENDAR_API_KEY || !window.ENV.GOOGLE_CALENDAR_ID) {
      console.warn("Google Calendar API is not configured. Missing ENV variables.");
      this.hasSynced = true; // Mark as synced so we don't keep retrying
      return;
    }

    this.isSyncing = true;
    
    try {
      const apiKey = window.ENV.GOOGLE_CALENDAR_API_KEY;
      const calendarId = encodeURIComponent(window.ENV.GOOGLE_CALENDAR_ID);
      
      let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&singleEvents=true&orderBy=startTime`;
      
      // Load specific date range to avoid pulling years of data
      if (timeMin) url += `&timeMin=${timeMin.toISOString()}`;
      if (timeMax) url += `&timeMax=${timeMax.toISOString()}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Calendar API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.events = this.normalizeEvents(data.items || []);
      this.hasSynced = true;
      
    } catch (error) {
      console.error("Failed to sync Google Calendar events:", error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  },

  /**
   * Converts Google Calendar event structure to PAMS Holiday/Event structure
   */
  normalizeEvents(googleEvents) {
    return googleEvents.map(event => {
      // Determine date (start.date for all-day, start.dateTime for timed events)
      let dateStr = '';
      if (event.start) {
        if (event.start.date) {
          dateStr = event.start.date;
        } else if (event.start.dateTime) {
          // Extract just the YYYY-MM-DD in the local timezone configured
          dateStr = event.start.dateTime.split('T')[0];
        }
      }

      if (!dateStr) return null;

      return {
        id: "GCAL_" + event.id,
        name: event.summary ? event.summary.trim() : "Untitled Event",
        date: dateStr,
        type: 'OTHER', // Default category for external events
        description: event.description ? event.description.trim() : "",
        academicYear: "2026-27",
        status: "GOOGLE_EVENT", // Distinct status so it doesn't overwrite WEEKLY_OFF
        source: "GOOGLE_CALENDAR",
        externalEventId: event.id
      };
    }).filter(e => e !== null);
  },

  /**
   * Returns normalized events held in memory
   */
  getEvents() {
    return this.events;
  }
};

window.GoogleCalendarService = GoogleCalendarService;

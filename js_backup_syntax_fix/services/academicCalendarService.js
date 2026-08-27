/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAMS) - ACADEMIC CALENDAR SERVICE
   Centralized Calendar & Date Rule Engine
   ========================================================================== */

const AcademicCalendarService = {
  // Days of Week Map
  DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  MONTHS_SHORT: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  MONTHS_FULL: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

  /**
   * Derive Day Name from Date String (YYYY-MM-DD)
   * Prevents invalid Date-Day combinations.
   */
  getDayName(dateStr) {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr + 'T00:00:00');
    if (isNaN(dateObj.getTime())) return '';
    return this.DAYS[dateObj.getDay()];
  },

  /**
   * Format Date String (YYYY-MM-DD) to User-Friendly Format (18 Aug 2026)
   */
  formatDate(dateStr, format = 'short') {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;

    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (monthIdx < 0 || monthIdx > 11) return dateStr;

    if (format === 'full') {
      return `${day} ${this.MONTHS_FULL[monthIdx]} ${year}`;
    }
    return `${day} ${this.MONTHS_SHORT[monthIdx]} ${year}`;
  },

  /**
   * Evaluate Date Status against Academic Calendar Rules
   * Possible Statuses: WORKING_DAY, WEEKLY_OFF, COLLEGE_HOLIDAY, SPECIAL_WORKING_DAY, EXAM_DAY
   */
  getDateStatus(dateStr, role = 'STUDENT') {
    if (!dateStr) {
      return {
        status: 'WORKING_DAY',
        label: 'Working Day',
        badgeClass: 'status-working-day',
        icon: 'check-circle',
        color: '#10B981',
        isWorkingDay: true,
        dayName: ''
      };
    }

    const dayName = this.getDayName(dateStr);
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat

    // 1. Check Official College / National Holidays
    const holidays = typeof HolidayService !== 'undefined' && HolidayService.getAllHolidays 
      ? HolidayService.getAllHolidays() 
      : (typeof DataStore !== 'undefined' ? DataStore.get('HOLIDAYS') || [] : []);

    const holidayMatch = holidays.find(h => h.date === dateStr && h.status === 'ACTIVE');

    if (holidayMatch) {
      return {
        status: 'COLLEGE_HOLIDAY',
        label: `College Holiday (${holidayMatch.name})`,
        badgeClass: 'status-holiday',
        icon: 'alert-triangle',
        color: '#F59E0B',
        isHoliday: true,
        holidayName: holidayMatch.name,
        holidayType: holidayMatch.type,
        dayName
      };
    }

    // 2. Check Special Working Days Config (if any override)
    const specialWorkingDays = typeof DataStore !== 'undefined' ? DataStore.get('SPECIAL_WORKING_DAYS') || [] : [];
    const isSpecialWorkingDay = specialWorkingDays.some(s => s.date === dateStr);

    if (isSpecialWorkingDay) {
      return {
        status: 'SPECIAL_WORKING_DAY',
        label: 'Special Working Day',
        badgeClass: 'status-special-working',
        icon: 'sparkles',
        color: '#8B5CF6',
        isSpecialWorkingDay: true,
        dayName
      };
    }

    // 3. Check Exam Periods
    const examPeriods = typeof DataStore !== 'undefined' ? DataStore.get('EXAM_PERIODS') || [] : [];
    const isExamDay = examPeriods.some(e => e.status === 'OPEN' && dateStr >= e.startDate && dateStr <= e.endDate);

    if (isExamDay) {
      return {
        status: 'EXAM_DAY',
        label: 'Exam Day',
        badgeClass: 'status-exam-day',
        icon: 'book-open',
        color: '#3B82F6',
        isExamDay: true,
        dayName
      };
    }

    // 4. Role-Based Weekly Off Rules
    // STUDENT: Saturday & Sunday are Weekly Off
    // FACULTY: Sunday is Weekly Off (Saturday is Working Day)
    let isWeeklyOff = false;
    let applicableTo = 'All Roles';

    if (role === 'STUDENT') {
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        isWeeklyOff = true;
        applicableTo = dayOfWeek === 6 ? 'Students' : 'All Roles';
      }
    } else {
      // Faculty & Admin
      if (dayOfWeek === 0) { // Sunday
        isWeeklyOff = true;
        applicableTo = 'All Roles';
      }
    }

    if (isWeeklyOff) {
      return {
        status: 'WEEKLY_OFF',
        label: `Weekly Off (${applicableTo})`,
        badgeClass: 'status-weekly-off',
        icon: 'calendar-off',
        color: '#EF4444',
        isWeeklyOff: true,
        applicableTo,
        dayName
      };
    }

    // 5. Default Working Day
    return {
      status: 'WORKING_DAY',
      label: 'Working Day',
      badgeClass: 'status-working-day',
      icon: 'check-circle',
      color: '#10B981',
      isWorkingDay: true,
      dayName
    };
  }
};

window.AcademicCalendarService = AcademicCalendarService;

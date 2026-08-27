/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - ATTENDANCE CALCULATOR UTILITY
   Formula: Attendance Percentage = (Present / Total) * 100
   Classification: >= 75% -> GOOD, < 75% -> WARNING
   ========================================================================== */

const AttendanceCalculator = {
  calculateAttendance(presentCount, totalCount) {
    const present = Number(presentCount) || 0;
    const total = Number(totalCount) || 0;

    if (total <= 0) {
      return {
        total: 0,
        present: 0,
        absent: 0,
        percentage: 100,
        status: 'GOOD'
      };
    }

    const absent = total - present;
    const percentage = Math.round((present / total) * 100);
    const status = percentage >= 75 ? 'GOOD' : 'WARNING';

    return {
      total,
      present,
      absent,
      percentage,
      status
    };
  }
};

window.AttendanceCalculator = AttendanceCalculator;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - DEPRECATED
   ========================================================================== */

const AttendanceAssignmentsView = {
  render() {
    return `
      <div class="page-header" style="text-align: center; margin-top: 4rem;">
        <i data-lucide="info" style="width: 48px; height: 48px; color: var(--color-primary); margin-bottom: 1rem;"></i>
        <h1 style="font-size: 2rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.5rem;">Feature Deprecated</h1>
        <p style="color: var(--color-text-muted); font-size: 1.1rem; max-width: 600px; margin: 0 auto 2rem auto;">
          Manual attendance assignments have been deprecated in favor of the new <strong>Permanent Section-wise Timetable System</strong>. Faculty are now automatically assigned to attendance based on the Master Timetable.
        </p>
        <button class="btn-primary" style="margin: 0 auto;" onclick="App.navigateTo('timetable')">
          <i data-lucide="calendar"></i> Go to Master Timetable
        </button>
      </div>
    `;
  },
  afterRender() {
    if (window.lucide) window.lucide.createIcons();
  }
};

window.AttendanceAssignmentsView = AttendanceAssignmentsView;

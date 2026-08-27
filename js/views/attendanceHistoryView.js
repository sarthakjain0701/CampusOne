/* ==========================================================================
   POORNIMA ATTENDANCE MANAGEMENT SYSTEM (PAMS) - ATTENDANCE HISTORY VIEW
   With Faculty Subject Privacy Enforcement
   ========================================================================== */

const AttendanceHistoryView = {
  render() {
    const user = authService.getCurrentUser();
    if (!user) return `<div>Please log in.</div>`;

    const attendance = attendanceService.getAttendance(user);
    let classes = DataStore.get('CLASSES') || MOCK_DATA.classes || [];
    let subjects = DataStore.get('SUBJECTS') || MOCK_DATA.subjects || [];

    if (AuthorizationService.isAcademicStaff(user)) {
      const authorizedClassIds = AuthorizationService.getAuthorizedClassIds(user);
      const authorizedSubjectIds = AuthorizationService.getAuthorizedSubjectIds(user);

      classes = classes.filter(c => authorizedClassIds.includes(c.id));
      subjects = subjects.filter(s => authorizedSubjectIds.includes(s.id));
    }

    // Group raw attendance records by session (Class + Subject + Date)
    const sessionsMap = {};
    attendance.forEach(rec => {
      const key = `${rec.classId}_${rec.subjectId}_${rec.date}`;
      if (!sessionsMap[key]) {
        sessionsMap[key] = {
          classId: rec.classId,
          subjectId: rec.subjectId,
          date: rec.date,
          present: 0,
          absent: 0,
          total: 0
        };
      }
      sessionsMap[key].total++;
      if (rec.status === 'PRESENT') sessionsMap[key].present++;
      else sessionsMap[key].absent++;
    });

    const sessions = Object.values(sessionsMap);

    return `
      <div class="page-header">
        <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">Attendance History & Logs</h1>
        <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">
          Review submitted attendance sessions and filter records. ${AuthorizationService.isAcademicStaff(user) ? '<strong style="color:var(--color-primary);">(Faculty Scope: Assigned Subjects Only)</strong>' : ''}
        </p>
      </div>

      <div class="toolbar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
        <div class="filter-group" style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <input type="text" class="search-input" style="width:240px; background:white; font-size:0.85rem;" placeholder="Filter by date or class..." onkeyup="AttendanceHistoryView.filterTable(this.value)">
          <select class="form-select" style="font-size:0.85rem; font-weight:600;">
            <option value="">All Assigned Classes</option>
            ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
          <select class="form-select" style="font-size:0.85rem; font-weight:600;">
            <option value="">All Assigned Subjects</option>
            ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        </div>

        <div>
          ${user.role !== 'STUDENT' ? `
          <button class="btn-primary" onclick="App.navigateTo('mark-attendance')" style="font-weight:700;">
            <i data-lucide="plus" style="width:16px; height:16px; display:inline;"></i> Mark New Attendance
          </button>
          ` : ''}
        </div>
      </div>

      <div class="table-container">
        <table class="custom-table" id="history-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
              <th>Date</th>
              <th>Class</th>
              <th>Subject</th>
              <th style="text-align:center;">Present</th>
              <th style="text-align:center;">Absent</th>
              <th style="text-align:center;">Total Students</th>
              <th style="text-align:center;">Attendance %</th>
              <th style="text-align:center;">Status</th>
              <th style="text-align:center;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align:center; padding:3rem;">
                  <i data-lucide="calendar-x" style="font-size:2rem; color:var(--color-text-light);"></i>
                  <p style="margin-top:0.5rem; color:var(--color-text-muted);">No attendance sessions recorded for your assigned subjects.</p>
                </td>
              </tr>
            ` : sessions.map(s => {
              const cls = classes.find(c => c.id === s.classId);
              const sub = subjects.find(sub => sub.id === s.subjectId);
              const pct = Math.round((s.present / s.total) * 100);
              const formattedDate = new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
              return `
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td><strong>${formattedDate}</strong></td>
                  <td><span class="status-badge active">${cls ? cls.name : s.classId}</span></td>
                  <td style="font-weight:600; color:#334155;">${sub ? sub.name : s.subjectId}</td>
                  <td style="text-align:center; color:var(--color-success); font-weight:700;">${s.present}</td>
                  <td style="text-align:center; color:var(--color-danger); font-weight:700;">${s.absent}</td>
                  <td style="text-align:center;">${s.total}</td>
                  <td style="text-align:center;"><strong>${pct}%</strong></td>
                  <td style="text-align:center;">
                    <span class="status-badge ${pct >= 75 ? 'present' : pct >= 65 ? 'warning' : 'absent'}">
                      ${pct >= 75 ? 'Good' : pct >= 65 ? 'Warning' : 'Low'}
                    </span>
                  </td>
                  <td style="text-align:center;">
                    <div style="display:flex; gap:0.5rem; justify-content:center;">
                      <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="App.navigateTo('mark-attendance', { classId: '${s.classId}', subjectId: '${s.subjectId}', date: '${s.date}', mode: 'VIEW' })">
                        VIEW
                      </button>
                      ${user.role !== 'STUDENT' ? `
                      <button class="btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="App.navigateTo('mark-attendance', { classId: '${s.classId}', subjectId: '${s.subjectId}', date: '${s.date}', mode: 'EDIT' })">
                        EDIT
                      </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  filterTable(query) {
    const rows = document.querySelectorAll('#history-table tbody tr');
    const q = query.toLowerCase();
    rows.forEach(r => {
      r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
    });
  }
};

window.AttendanceHistoryView = AttendanceHistoryView;


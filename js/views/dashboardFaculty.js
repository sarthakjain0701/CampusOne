/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - FACULTY DASHBOARD (SERVICE CONNECTED)
   ========================================================================== */

const DashboardFaculty = {
  render() {
    const user = authService.getCurrentUser();
    const facultyList = facultyService.getFaculty();
    const myFaculty = facultyList.find(f => f.email === user.email) || facultyList[0];
    const assignments = assignmentService.getAssignments().filter(a => a.facultyId === myFaculty.id);

    return `
      <div class="page-header">
        <h1>Welcome, ${myFaculty.name}! 👋</h1>
        <p>Manage your assigned classes, lectures, and student attendance.</p>
      </div>

      <!-- STATS (DYNAMIC) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-info">
            <h3>My Classes</h3>
            <div class="value">${assignments.length}</div>
            <span class="stat-trend positive">Assigned batches</span>
          </div>
          <div class="stat-icon blue"><i data-lucide="layers"></i></div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('digital-learning')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>My Subjects</h3>
            <div class="value">${assignments.length}</div>
            <span class="stat-trend positive"><i data-lucide="book-open"></i> Digital Learning Resources</span>
          </div>
          <div class="stat-icon purple"><i data-lucide="book-open"></i></div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('timetable')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>My Timetable</h3>
            <div class="value">Next: 10:00 AM</div>
            <span class="stat-trend warning"><i data-lucide="calendar"></i> View Schedule</span>
          </div>
          <div class="stat-icon amber"><i data-lucide="calendar"></i></div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <h3>Overall Class Attendance</h3>
            <div class="value">85%</div>
            <span class="stat-trend positive"><i data-lucide="trending-up"></i> Good</span>
          </div>
          <div class="stat-icon green"><i data-lucide="check-circle"></i></div>
        </div>
      </div>

      <!-- TODAY'S CLASSES SCHEDULE GRID -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="calendar-check"></i> Today's Schedule & Attendance Marking</h3>
          <span class="card-subtitle">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>

        <div class="quick-actions-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
          ${(() => {
            if (typeof AttendanceAssignmentService === 'undefined' || typeof TimetableService === 'undefined') {
              return '<div style="padding:1rem; color:var(--color-text-muted);">Attendance Assignment Services not loaded.</div>';
            }
            
            const todayAssignments = [];
            const todayStr = new Date().toISOString().split('T')[0];
            const todayName = typeof AcademicCalendarService !== 'undefined' ? AcademicCalendarService.getDayName(todayStr) : new Date().toLocaleDateString('en-US', { weekday: 'long' });
            
            const allMyAssignments = AttendanceAssignmentService.getFacultyAssignments(myFaculty.id);
            const classes = typeof classService !== 'undefined' ? classService.getClasses() : [];
            const subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : [];
            const students = typeof studentService !== 'undefined' ? studentService.getStudents() : [];
            
            for (const assign of allMyAssignments) {
              const tt = TimetableService.getTimetableById(assign.timetableId);
              if (tt && tt.day === todayName) {
                todayAssignments.push({ assign, tt });
              }
            }

            if (todayAssignments.length === 0) {
              return `
                <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--color-text-muted); background: #F8FAFC; border-radius: 8px; border: 1px dashed #CBD5E1;">
                  <i data-lucide="coffee" style="width: 32px; height: 32px; color: #94A3B8; margin-bottom: 0.5rem;"></i>
                  <div style="font-weight: 600; font-size: 1.05rem; color: var(--color-navy-dark);">No attendance sessions assigned for today.</div>
                  <p style="font-size: 0.85rem; margin-top: 0.25rem;">Please contact the administrator if you believe this is incorrect.</p>
                </div>
              `;
            }

            return todayAssignments.map(data => {
              const cls = classes.find(c => c.id === data.assign.classId);
              const sub = subjects.find(s => s.id === data.assign.subjectId);
              const clsName = cls ? cls.name : data.assign.classId;
              const subName = sub ? sub.name : data.assign.subjectId;
              const subCode = sub ? sub.code : '';
              const numStudents = students.filter(s => s.classId === data.assign.classId).length;
              
              return `
                <div class="card" style="margin-bottom:0; background:#FAFAFA; border: 1.5px solid var(--color-border);">
                  <div class="card-header" style="margin-bottom:0.75rem;">
                    <span class="status-badge active">${clsName}</span>
                    <span style="font-size:0.75rem; color:var(--color-text-muted);">${data.tt.startTime} – ${data.tt.endTime}</span>
                  </div>
                  <h4 style="font-size:1.05rem; font-weight:700; color:var(--color-navy-dark); margin-bottom:0.4rem;">${subName} (${subCode})</h4>
                  <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:1rem;">${numStudents} Students Enrolled</p>
                  <button class="btn-primary" onclick="App.navigateTo('mark-attendance', { classId: '${data.assign.classId}', subjectId: '${data.assign.subjectId}', date: '${todayStr}', timetableId: '${data.assign.timetableId}' })">
                    <i data-lucide="check-square"></i> Take Attendance
                  </button>
                </div>
              `;
            }).join('');
          })()}
        </div>
      </div>

      <!-- ATTENDANCE SUMMARY CHART -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="bar-chart-2"></i> Attendance Summary by Subject</h3>
        </div>
        <div style="height: 260px; position: relative;">
          <canvas id="facultyAttendanceChart"></canvas>
        </div>
      </div>
    `;
  },

  initCharts() {
    const ctx = document.getElementById('facultyAttendanceChart');
    if (!ctx) return;

    if (window.Chart) {
      new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Data Structures', 'Java Programming', 'Computer Networks'],
          datasets: [{
            label: 'Average Attendance (%)',
            data: [85, 90, 78],
            backgroundColor: ['#2563EB', '#4F46E5', '#8B5CF6'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 50, max: 100, grid: { color: '#F1F5F9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  }
};

window.DashboardFaculty = DashboardFaculty;

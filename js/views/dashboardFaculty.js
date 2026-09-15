/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - FACULTY DASHBOARD (SERVICE CONNECTED)
   ========================================================================== */

const DashboardFaculty = {
  assignments: [],
  loading: true,
  classes: [],
  subjects: [],
  students: [],

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    try {
      const user = authService.getCurrentUser();
      let facultyList = [];
      if (typeof facultyService !== 'undefined' && facultyService.getFacultyFromFirestore) {
        facultyList = await facultyService.getFacultyFromFirestore();
      } else {
        facultyList = typeof facultyService !== 'undefined' ? facultyService.getFaculty() : [];
      }
      this.myFaculty = facultyList.find(f => f.email === user.email || f.userId === user.uid) || { id: user.uid || user.id, name: user.name || user.displayName || 'Faculty', email: user.email };
      
      this.assignments = typeof assignmentService !== 'undefined' ? await assignmentService.getAssignments() : [];
      
      const todayStr = new Date().toISOString().split('T')[0];
      if (typeof window.MasterTimetableService !== 'undefined' && this.myFaculty) {
        this.todaySchedule = await window.MasterTimetableService.getFacultyScheduleForDate(this.myFaculty.id, todayStr);
      } else {
        this.todaySchedule = [];
      }


            if (typeof classService !== 'undefined' && classService.getClassesFromFirestore) {
        this.classes = await classService.getClassesFromFirestore();
      } else {
        this.classes = typeof classService !== 'undefined' ? classService.getClasses() : [];
      }
      
      if (typeof subjectService !== 'undefined' && subjectService.getSubjectsFromFirestore) {
        this.subjects = await subjectService.getSubjectsFromFirestore();
      } else {
        this.subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : [];
      }

      if (typeof studentService !== 'undefined' && studentService.getStudentsFromFirestore) {
        this.students = await studentService.getStudentsFromFirestore();
      } else {
        this.students = typeof studentService !== 'undefined' ? studentService.getStudents() : [];
      }
      
      this.timetablesMap = {};
      if (typeof TimetableService !== 'undefined') {
        const allTts = await TimetableService.getAllTimetables();
        for (const tt of allTts) {
          this.timetablesMap[tt.id] = tt;
        }
      }

      this.loading = false;
      App.renderCurrentView();
    } catch (err) {
      this.loading = false;
      console.error("Failed to load assignments for dashboard:", err);
      App.renderCurrentView();
    }
  },

  render() {
    const user = authService.getCurrentUser();
    const facultyList = typeof facultyService !== 'undefined' ? facultyService.getFaculty() : [];
    const myFaculty = facultyList.find(f => f.email === user.email || f.userId === user.uid) || { id: user.uid || user.id, name: user.name || user.displayName || 'Faculty', email: user.email };
    const roleTitle = user.role === 'LAB_ASSISTANT' ? 'Lab Assistant' : 'Faculty';

    if (this.loading) {
      return `
        <div class="page-header" style="margin-bottom: 2rem;">
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">Welcome, ${myFaculty.name}! 👋</h1>
          <p style="color: var(--color-text-muted); font-size: 1rem;">${roleTitle} Portal — Loading your assigned classes...</p>
        </div>
        <div class="glass-panel" style="padding: 4rem; text-align: center;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1.5rem; color: var(--color-text-muted); font-weight: 600;">Loading dashboard data...</p>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
      `;
    }

    const assignments = this.assignments.filter(a => myFaculty && a.facultyId === myFaculty.id);

    return `
      <div class="page-header" style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">
          Welcome, ${myFaculty.name}! 👋
        </h1>
        <p style="color: var(--color-text-muted); font-size: 1rem;">
          ${roleTitle} Portal — Manage your assigned classes, lectures, and student attendance.
        </p>
      </div>

      <!-- QUICK ACTIONS ROW -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
        <button class="glass-card" onclick="App.navigateTo('mark-attendance')" style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; border: none; cursor: pointer; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #FFF;">
          <i data-lucide="check-square" style="width: 24px; height: 24px;"></i>
          <span style="font-size: 1.05rem; font-weight: 700;">Mark Attendance</span>
        </button>

        <button class="glass-card" onclick="App.navigateTo('attendance-history')" style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; border: none; cursor: pointer;">
          <i data-lucide="history" style="width: 24px; height: 24px; color: var(--color-accent);"></i>
          <span style="font-size: 1.05rem; font-weight: 700; color: var(--color-navy-dark);">Attendance History</span>
        </button>

        <button class="glass-card" onclick="App.navigateTo('timetable')" style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; border: none; cursor: pointer;">
          <i data-lucide="calendar" style="width: 24px; height: 24px; color: var(--color-warning);"></i>
          <span style="font-size: 1.05rem; font-weight: 700; color: var(--color-navy-dark);">My Timetable</span>
        </button>

        <button class="glass-card" onclick="App.navigateTo('digital-learning')" style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; border: none; cursor: pointer;">
          <i data-lucide="book-open" style="width: 24px; height: 24px; color: var(--color-success);"></i>
          <span style="font-size: 1.05rem; font-weight: 700; color: var(--color-navy-dark);">Assignments & Learning</span>
        </button>
      </div>

      <!-- MAIN GRID -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
        
        <!-- LEFT: TODAY'S SCHEDULE -->
        <div class="glass-panel" style="padding: 2rem; background: rgba(255,255,255,0.6);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--color-navy-dark); display: flex; align-items: center; gap: 8px;">
                <i data-lucide="calendar-check" style="color: var(--color-primary);"></i> Today's Schedule
              </h3>
              <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 4px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
            <span class="status-badge present">${assignments.length} Assigned Classes</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${(() => {
              if (typeof window.MasterTimetableService === 'undefined') {
                return '<div style="padding:1rem; color:var(--color-text-muted);">MasterTimetableService not fully loaded.</div>';
              }
              
              const todayStr = new Date().toISOString().split('T')[0];
              const todayAssignments = this.todaySchedule || [];
              const classes = this.classes;
              const subjects = this.subjects;
              const students = this.students;


              if (todayAssignments.length === 0) {
                return `
                  <div style="padding: 3rem; text-align: center; color: var(--color-text-muted); background: rgba(255,255,255,0.4); border-radius: var(--radius-lg); border: 1px dashed var(--glass-border);">
                    <div style="width: 56px; height: 56px; border-radius: 50%; background: #FFF; display: inline-flex; align-items: center; justify-content: center; box-shadow: var(--glass-shadow); margin-bottom: 1rem;">
                      <i data-lucide="coffee" style="width: 28px; height: 28px; color: var(--color-text-light);"></i>
                    </div>
                    <div style="font-weight: 700; font-size: 1.15rem; color: var(--color-navy-dark);">No classes scheduled for today.</div>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Enjoy your day or catch up on academic work.</p>
                  </div>
                `;
              }

              return todayAssignments.map(data => {
                const classId = data.sectionId || data.classId;
                const subjectId = data.subjectId;
                const cls = classes.find(c => c.id === classId);
                const sub = subjects.find(s => s.id === subjectId);
                const clsName = cls ? cls.name : classId;
                const subName = sub ? sub.name : subjectId;
                const numStudents = students.filter(s => s.classId === classId).length;
                
                return `
                  <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; background: #FFF; padding: 1.25rem;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                        <span class="status-badge pending" style="background: rgba(99, 102, 241, 0.15); color: var(--color-secondary); border: none;">${data.startTime} – ${data.endTime}</span>
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-muted);">${clsName}</span>
                      </div>
                      <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">${subName}</h4>
                      <p style="font-size: 0.85rem; color: var(--color-text-muted); display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="users" style="width: 14px;"></i> ${numStudents} Students Enrolled
                      </p>
                    </div>
                    <div>
                      <button class="btn-primary" onclick="App.navigateTo('mark-attendance', { classId: '${classId}', subjectId: '${subjectId}', date: '${todayStr}' })" >
                        <i data-lucide="check-square" style="width: 18px;"></i> Mark Attendance
                      </button>
                    </div>
                  </div>
                `;
              }).join('');
            })()}
          </div>
        </div>

        <!-- RIGHT: ALERTS & CHART -->
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          
          <div class="glass-panel" style="padding: 1.5rem; background: rgba(255,255,255,0.8);">
            <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="bell" style="color: var(--color-warning);"></i> Recent Notifications
            </h3>
            <div style="font-size: 0.9rem; color: var(--color-text-muted); padding: 1rem; background: #FFF; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
              No urgent alerts for you at this time.
            </div>
          </div>

          <div class="glass-panel" style="padding: 1.5rem; background: rgba(255,255,255,0.8); flex: 1;">
            <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="bar-chart-2" style="color: var(--color-accent);"></i> Subject Attendance
            </h3>
            <div style="height: 220px; position: relative;">
              <canvas id="facultyAttendanceChart"></canvas>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  initCharts() {
    if (this.loading) return; 
    const ctx = document.getElementById('facultyAttendanceChart');
    if (!ctx) return;

    if (window.Chart) {
      new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Subject A', 'Subject B', 'Subject C'],
          datasets: [{
            label: 'Avg. Attendance (%)',
            data: [88, 76, 92],
            backgroundColor: ['#3B82F6', '#1E3A8A', '#60A5FA'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 50, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  }
};

window.DashboardFaculty = DashboardFaculty;

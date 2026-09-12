/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - STUDENT DASHBOARD
   ========================================================================== */

const DashboardStudent = {
  loading: true,
  hasError: false,
  students: [],
  subjects: [],
  libraryStats: { issued: 0, overdue: 0, fine: 0 },
  attendanceStats: { percentage: 0, total: 0, present: 0, absent: 0, status: 'Unknown' },
  subjectStats: [],
  myStudent: null,
  _hasFetchedLibrary: false,

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
  },

  async fetchData() {
    if (this._isFetching) return;
    this._isFetching = true;
    this.loading = true;
    this.hasError = false;
    App.renderCurrentView();

    try {
      if (typeof studentService !== 'undefined' && studentService.getStudentsFromFirestore) {
        this.students = await studentService.getStudentsFromFirestore();
      } else {
        this.students = typeof studentService !== 'undefined' ? studentService.getStudents() : [];
      }
      
      if (typeof subjectService !== 'undefined' && subjectService.getSubjectsFromFirestore) {
        this.subjects = await subjectService.getSubjectsFromFirestore();
      } else {
        this.subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : [];
      }

      const user = typeof authService !== 'undefined' ? authService.getCurrentUser() : null;
      if (!user) throw new Error("No authenticated user");

      let studentList = this.students || [];
      let student = studentList.find(s => (s.email === user.email || s.userId === user.uid || s.id === user.uid));
      
      if (!student) {
        student = { id: user.uid, name: user.name, department: 'N/A', semester: 1, section: 'A' };
      }
      this.myStudent = student;

      if (typeof attendanceService !== 'undefined') {
        const db = attendanceService._getDb();
        const snapshot = await db.collection('attendance').where('studentId', '==', this.myStudent.id).get();
        const records = snapshot.docs.map(doc => doc.data());
        
        const totalClasses = records.length;
        const totalPresent = records.filter(a => a.status === 'PRESENT').length;
        const totalPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
        
        this.attendanceStats = { total: totalClasses, present: totalPresent, percentage: totalPercentage, absent: totalClasses - totalPresent, status: totalPercentage >= 75 ? 'Good' : 'Low' };

        const subStats = [];
        const relevantSubjects = this.subjects.filter(s => s.department === this.myStudent.department && Number(s.semester) === Number(this.myStudent.semester));
        let subjectsToDisplay = relevantSubjects.length > 0 ? relevantSubjects : this.subjects.filter(s => records.some(r => r.subjectId === s.id));
        
        for (const sub of subjectsToDisplay) {
           const subRecords = records.filter(r => r.subjectId === sub.id);
           const sTotal = subRecords.length;
           const sPresent = subRecords.filter(r => r.status === 'PRESENT').length;
           subStats.push({
             id: sub.id,
             name: sub.name,
             code: sub.code,
             percentage: sTotal > 0 ? Math.round((sPresent / sTotal) * 100) : 0,
             status: (sTotal > 0 && Math.round((sPresent / sTotal) * 100) >= 75) ? 'Good' : 'Low',
             hasData: sTotal > 0
           });
        }
        this.subjectStats = subStats;
      } else {
        this.attendanceStats = { percentage: 85, total: 40, present: 34, absent: 6, status: 'Good' };
        this.subjectStats = this.subjects.map(sub => ({ id: sub.id, name: sub.name, code: sub.code, percentage: 80, status: 'Good', hasData: true }));
      }

      this.loading = false;
      this._isFetching = false;
      App.renderCurrentView();
    } catch (err) {
      console.error(err);
      this.hasError = true;
      this.loading = false;
      this._isFetching = false;
      App.renderCurrentView();
    }
  },

  async fetchLibraryStats(user) {
    if (!user || this._hasFetchedLibrary) return;
    this._hasFetchedLibrary = true;

    try {
      if (window.LibraryService) {
        const db = LibraryService._getDb();
        const userEmail = (user.email || '').toLowerCase().trim();
        
        const [transSnapshot, fineSnapshot] = await Promise.all([
          db.collection('libraryTransactions').where('memberEmail', '==', userEmail).get().catch(e => ({ docs: [] })),
          db.collection('libraryFines').where('memberEmail', '==', userEmail).where('status', '==', 'PENDING').get().catch(e => ({ docs: [] }))
        ]);

        const transactions = transSnapshot.docs.map(d => d.data());
        const fines = fineSnapshot.docs.map(d => d.data());

        const issued = transactions.filter(r => r.status !== 'RETURNED').length;
        const overdue = transactions.filter(r => r.status === 'OVERDUE' || (r.status === 'ISSUED' && new Date(r.dueDate) < new Date())).length;
        const fineTotal = fines.reduce((sum, r) => sum + (r.amount || 0), 0);

        this.libraryStats = { issued, overdue, fine: fineTotal };
        
        const issuedEl = document.getElementById('stu-dash-lib-issued');
        if (issuedEl) issuedEl.innerText = `${issued} Books`;
        const overdueEl = document.getElementById('stu-dash-lib-overdue');
        if (overdueEl) overdueEl.innerText = `${overdue} Overdue`;
        const finesEl = document.getElementById('stu-dash-lib-fines');
        if (finesEl) finesEl.innerText = `₹${fineTotal}`;
      }
    } catch (err) {
      console.warn("Failed to fetch library stats for student dashboard:", err);
    }
  },

  render() {
    const user = authService.getCurrentUser() || { name: 'Student', email: '', uid: 'STU001', role: 'STUDENT' };

    if (this.hasError) {
      return `
        <div class="page-header" style="margin-bottom: 2rem;">
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">
            Welcome, ${user.name || 'Student'}! 👋
          </h1>
        </div>
        <div class="glass-panel" style="padding: 4rem; text-align: center;">
          <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: var(--color-danger); margin-bottom: 1rem;"></i>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 0.5rem;">Unable to load dashboard data</h2>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">There was an error connecting to the server. Please try again.</p>
          <button class="btn btn-primary" onclick="DashboardStudent.fetchData()">
            <i data-lucide="refresh-cw" style="width: 18px; height: 18px; margin-right: 8px;"></i> Try Again
          </button>
        </div>
      `;
    }

    if (this.loading) {
      return `
        <div class="page-header" style="margin-bottom: 2rem;">
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">
            Welcome, ${user.name || 'Student'}! 👋
          </h1>
          <p style="color: var(--color-text-muted); font-size: 0.95rem;">
            Loading dashboard data...
          </p>
        </div>
        <div class="glass-panel" style="padding: 4rem; text-align: center;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1.5rem; color: var(--color-text-muted); font-weight: 600;">Fetching analytics...</p>
        </div>
      `;
    }

    const myStudent = this.myStudent || { id: user.uid, name: user.name, semester: 1, section: 'A' };
    const studentRoll = myStudent.rollNo || myStudent.rollNumber || '—';
    
    setTimeout(() => this.fetchLibraryStats(user), 0);
    
    const stats = this.attendanceStats || { percentage: 85, total: 40, present: 34, absent: 6, status: 'Good' };
    const strokeOffset = 364 - (364 * (stats.percentage / 100));

    const subjectStats = this.subjectStats || [];

    const learningResources = window.MOCK_DATA && MOCK_DATA.learningResources ? MOCK_DATA.learningResources.length : 0;
    const holidays = window.MOCK_DATA && MOCK_DATA.holidays ? MOCK_DATA.holidays : [];
    const today = new Date().toISOString().split('T')[0];
    const nextHoliday = holidays.filter(h => h.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];

    return `
      <div class="page-header" style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">
          Welcome, ${user.name || myStudent.name}! 👋
        </h1>
        <p style="color: var(--color-text-muted); font-size: 0.95rem;">
          Roll Number: <strong>${studentRoll}</strong> | Class: <strong>${myStudent.department || 'CSE'}-${myStudent.section || 'A'}</strong> (Semester ${myStudent.semester || '1'})
        </p>
      </div>

      <!-- MAIN LAYOUT GRID -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 2rem;">
        
        <!-- LEFT COLUMN: GAUGE & SUBJECTS -->
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          
          <!-- OVERALL ATTENDANCE -->
          <div class="glass-panel" style="padding: 2rem; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="award" style="color: var(--color-primary);"></i> Overall Attendance
              </h3>
              <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">University Minimum Requirement: 75%</p>
              
              <div style="display: flex; gap: 2rem;">
                <div>
                  <div style="font-size: 2rem; font-weight: 800; color: var(--color-navy-dark);">${stats.total}</div>
                  <div style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase;">Total Classes</div>
                </div>
                <div>
                  <div style="font-size: 2rem; font-weight: 800; color: var(--color-success);">${stats.present}</div>
                  <div style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase;">Classes Attended</div>
                </div>
                <div>
                  <div style="font-size: 2rem; font-weight: 800; color: var(--color-danger);">${stats.absent}</div>
                  <div style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase;">Classes Missed</div>
                </div>
              </div>
            </div>

            <!-- CIRCULAR GAUGE -->
            <div style="position: relative; width: 140px; height: 140px;">
              <svg viewBox="0 0 140 140" style="width: 140px; height: 140px; transform: rotate(-90deg);">
                <circle cx="70" cy="70" r="58" style="fill: none; stroke: rgba(0,0,0,0.05); stroke-width: 12;"></circle>
                <circle cx="70" cy="70" r="58" style="fill: none; stroke: ${stats.percentage >= 75 ? 'var(--color-success)' : 'var(--color-warning)'}; stroke-width: 12; stroke-dasharray: 364; stroke-dashoffset: ${strokeOffset}; stroke-linecap: round; transition: stroke-dashoffset 1s ease-out;"></circle>
              </svg>
              <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 1.5rem; font-weight: 800; color: var(--color-navy-dark);">${stats.percentage}%</span>
                <span style="font-size: 0.6rem; font-weight: 700; color: var(--color-text-muted); letter-spacing: 1px;">ATTENDANCE</span>
              </div>
            </div>
          </div>

          <!-- SUBJECT PROGRESS -->
          <div class="glass-panel" style="padding: 2rem; background: rgba(255,255,255,0.7);">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="book-open" style="color: var(--color-accent);"></i> Subject Breakdown
            </h3>
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
              ${subjectStats.length === 0 ? `
                <div style="text-align:center; padding:2rem 0; color:var(--color-text-muted);">
                  <i data-lucide="bar-chart-2" style="width:40px; height:40px; margin-bottom:1rem; opacity:0.5;"></i>
                  <p style="font-size:0.9rem;">Analytics will appear once academic activity is available.</p>
                </div>
              ` : subjectStats.map(s => `
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="font-size: 0.95rem; font-weight: 600; color: var(--color-navy-dark);">${s.name} <span style="color: var(--color-text-muted); font-size: 0.8rem; font-weight: 500;">(${s.code})</span></div>
                    <div style="font-size: 0.95rem; font-weight: 800; color: ${s.percentage >= 75 ? 'var(--color-success)' : 'var(--color-warning)'};">${s.percentage}%</div>
                  </div>
                  <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; border-radius: 4px; background: ${s.percentage >= 75 ? 'var(--color-success)' : 'var(--color-warning)'}; width: ${s.percentage}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: NOTIFICATIONS & QUICK WIDGETS -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- QUICK ACADEMICS -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="glass-card" onclick="App.navigateTo('digital-learning')" style="padding: 1rem; text-align: center; cursor: pointer;">
              <div style="width: 36px; height: 36px; background: rgba(59, 130, 246, 0.15); color: var(--color-primary); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;"><i data-lucide="book" style="width: 18px;"></i></div>
              <div style="font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase;">Notes & Tutes</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-navy-dark);">${learningResources}</div>
            </div>
            <div class="glass-card" onclick="App.navigateTo('timetable')" style="padding: 1rem; text-align: center; cursor: pointer;">
              <div style="width: 36px; height: 36px; background: rgba(139, 92, 246, 0.15); color: var(--color-accent); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;"><i data-lucide="calendar" style="width: 18px;"></i></div>
              <div style="font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase;">Timetable</div>
              <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-navy-dark);">View Today</div>
            </div>
          </div>

          <!-- RECENT NOTIFICATIONS -->
          <div class="glass-panel" style="padding: 1.5rem; background: rgba(255,255,255,0.7); flex: 1;">
            <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="bell" style="color: var(--color-primary);"></i> Alerts & Updates
            </h3>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; gap: 0.75rem; padding: 1rem; background: #FFF; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                <div style="color: var(--color-warning); margin-top: 2px;"><i data-lucide="alert-triangle" style="width: 18px;"></i></div>
                <div>
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main);">Next Holiday: ${nextHoliday ? nextHoliday.name : 'None'}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${nextHoliday ? new Date(nextHoliday.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</div>
                </div>
              </div>

              <div style="display: flex; gap: 0.75rem; padding: 1rem; background: #FFF; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                <div style="color: var(--color-success); margin-top: 2px;"><i data-lucide="check-circle" style="width: 18px;"></i></div>
                <div>
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main);">Library Dues</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);"><span id="stu-dash-lib-fines">₹0</span> Pending | <span id="stu-dash-lib-overdue">0 Overdue</span></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }
};

window.DashboardStudent = DashboardStudent;

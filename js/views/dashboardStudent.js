/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - STUDENT DASHBOARD
   ========================================================================== */

const DashboardStudent = {
  initialized: false,
  _isFetching: false,
  
  loading: {
    student: true,
    attendance: true,
    library: true
  },
  
  errors: {
    student: false,
    attendance: false,
    library: false
  },

  myStudent: null,
  attendanceStats: null,
  subjectStats: null,
  libraryStats: null,

  afterRender() {
    if (!this.initialized) {
      this.fetchData();
    }
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  async fetchData() {
    if (this._isFetching) return;
    this._isFetching = true;
    
    this.initialized = true;
    this.loading = { student: true, attendance: true, library: true };
    this.errors = { student: false, attendance: false, library: false };
    
    // Render the skeleton shell immediately
    App.renderCurrentView();

    const user = typeof authService !== 'undefined' ? authService.getCurrentUser() : null;
    if (!user) {
      this._isFetching = false;
      return;
    }

    try {
      // 1. Fetch Student Details First (Required for attendance)
      await this.fetchStudentData(user);
    } catch(err) {
      console.error('Fatal error loading student:', err);
      this.errors.student = true;
      this.loading.student = false;
      App.renderCurrentView();
    }

    // 2. Fetch parallel modules that depend on student or user
    Promise.allSettled([
      this.fetchAttendance(this.myStudent),
      this.fetchLibrary(user)
    ]).finally(() => {
      this._isFetching = false;
    });
  },

  async fetchStudentData(user) {
    let student = { 
      id: user.uid || user.id || 'STU001', 
      name: user.name || user.displayName || 'Student', 
      email: user.email, 
      department: 'N/A', 
      semester: 1, 
      section: 'A' 
    };

    try {
      const fetchPromise = (async () => {
        const db = window.FirebaseService ? window.FirebaseService.db : null;
        if (db && user.email) {
          // Only query the current student! Do not download the whole collection.
          let snap = await db.collection('students').where('email', '==', user.email).limit(1).get();
          if (snap.empty && user.uid) {
            snap = await db.collection('students').where('userId', '==', user.uid).limit(1).get();
          }
          if (!snap.empty) {
            student = { id: snap.docs[0].id, ...snap.docs[0].data() };
          }
        }
      })();
      
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 10000));
      await Promise.race([fetchPromise, timeoutPromise]);
      
      this.myStudent = student;
      this.loading.student = false;
      App.renderCurrentView();
    } catch(err) {
      console.error("Student fetch error", err);
      this.myStudent = student; // Fallback to basic auth info
      this.errors.student = true;
      this.loading.student = false;
      App.renderCurrentView();
    }
  },

  async fetchAttendance(student) {
    if (!student) return;
    try {
      const fetchPromise = (async () => {
        const db = window.FirebaseService ? window.FirebaseService.db : null;
        if (!db) throw new Error("No Firestore instance");

        // Fetch subjects ONLY for this student's department & semester
        let subjects = [];
        if (student.department && student.semester) {
          const subSnap = await db.collection('subjects')
            .where('department', '==', student.department)
            .where('semester', '==', Number(student.semester))
            .get();
          subjects = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
          // Fallback fetch all
          const subSnap = await db.collection('subjects').get();
          subjects = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        // Fetch attendance ONLY for this student
        const attSnap = await db.collection('attendance').where('studentId', '==', student.id).get();
        const records = attSnap.docs.map(d => d.data());

        const totalClasses = records.length;
        const totalPresent = records.filter(a => a.status === 'PRESENT').length;
        const totalPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
        
        this.attendanceStats = { 
          total: totalClasses, 
          present: totalPresent, 
          absent: totalClasses - totalPresent,
          percentage: totalPercentage, 
          status: totalPercentage >= 75 ? 'Good' : 'Low' 
        };

        const subStats = [];
        let subjectsToDisplay = subjects;
        if (!student.department) {
          subjectsToDisplay = subjects.filter(s => records.some(r => r.subjectId === s.id));
        }

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
      })();
      
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 10000));
      await Promise.race([fetchPromise, timeoutPromise]);
      
      this.loading.attendance = false;
      App.renderCurrentView();
    } catch(err) {
      console.error("Attendance fetch error", err);
      this.errors.attendance = true;
      this.loading.attendance = false;
      App.renderCurrentView();
    }
  },

  async fetchLibrary(user) {
    try {
      const fetchPromise = (async () => {
        const db = window.FirebaseService ? window.FirebaseService.db : null;
        if (!db) throw new Error("No Firestore instance");
        
        const userEmail = (user.email || '').toLowerCase().trim();
        
        const [transSnapshot, fineSnapshot] = await Promise.all([
          db.collection('libraryTransactions').where('memberEmail', '==', userEmail).get().catch(() => ({ docs: [] })),
          db.collection('libraryFines').where('memberEmail', '==', userEmail).where('status', '==', 'PENDING').get().catch(() => ({ docs: [] }))
        ]);

        const transactions = transSnapshot.docs.map(d => d.data());
        const fines = fineSnapshot.docs.map(d => d.data());

        const issued = transactions.filter(r => r.status !== 'RETURNED').length;
        const overdue = transactions.filter(r => r.status === 'OVERDUE' || (r.status === 'ISSUED' && new Date(r.dueDate) < new Date())).length;
        const fineTotal = fines.reduce((sum, r) => sum + (r.amount || 0), 0);

        this.libraryStats = { issued, overdue, fine: fineTotal };
      })();
      
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 10000));
      await Promise.race([fetchPromise, timeoutPromise]);
      
      this.loading.library = false;
      App.renderCurrentView();
    } catch(err) {
      console.error("Library fetch error", err);
      this.errors.library = true;
      this.loading.library = false;
      App.renderCurrentView();
    }
  },

  render() {
    const user = typeof authService !== 'undefined' ? authService.getCurrentUser() : null;
    if (!user) {
      return `<div class="card" style="padding:2rem; text-align:center;">Please log in to view the dashboard.</div>`;
    }

    // Skeletons
    const renderAttendanceSkeleton = () => `
      <div class="glass-panel" style="padding: 2rem; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: space-between; min-height: 200px;">
         <div style="display:flex; flex-direction:column; gap:10px; width:100%;">
            <div style="height:28px; width:200px; background:rgba(0,0,0,0.05); border-radius:4px; animation: pulse 1.5s infinite;"></div>
            <div style="height:14px; width:250px; background:rgba(0,0,0,0.05); border-radius:4px; animation: pulse 1.5s infinite;"></div>
            <div style="display:flex; gap:2rem; margin-top:20px;">
               <div style="height:48px; width:80px; background:rgba(0,0,0,0.05); border-radius:4px; animation: pulse 1.5s infinite;"></div>
               <div style="height:48px; width:80px; background:rgba(0,0,0,0.05); border-radius:4px; animation: pulse 1.5s infinite;"></div>
               <div style="height:48px; width:80px; background:rgba(0,0,0,0.05); border-radius:4px; animation: pulse 1.5s infinite;"></div>
            </div>
         </div>
      </div>
    `;

    const renderSubjectSkeleton = () => `
      <div class="glass-panel" style="padding: 2rem; background: rgba(255,255,255,0.7); min-height: 250px;">
        <div style="height:24px; width:180px; background:rgba(0,0,0,0.05); border-radius:4px; margin-bottom:2rem; animation: pulse 1.5s infinite;"></div>
        <div style="display:flex; flex-direction:column; gap:1.5rem;">
           <div style="height:16px; width:100%; background:rgba(0,0,0,0.05); border-radius:4px; animation: pulse 1.5s infinite;"></div>
           <div style="height:16px; width:100%; background:rgba(0,0,0,0.05); border-radius:4px; animation: pulse 1.5s infinite;"></div>
           <div style="height:16px; width:100%; background:rgba(0,0,0,0.05); border-radius:4px; animation: pulse 1.5s infinite;"></div>
        </div>
      </div>
    `;

    const renderError = (module) => `
      <div style="text-align:center; padding:3rem 0;">
        <i data-lucide="alert-triangle" style="width:32px; height:32px; color:var(--color-danger); margin-bottom:0.75rem;"></i>
        <h4 style="color:var(--color-navy-dark); font-weight:700; margin-bottom:0.25rem;">Unable to load data</h4>
        <p style="color:var(--color-text-muted); font-size:0.9rem; margin-bottom:1rem;">Failed to fetch ${module} data.</p>
        <button class="btn btn-secondary btn-sm" onclick="DashboardStudent.fetchData()">
           <i data-lucide="refresh-cw" style="width:14px; height:14px; margin-right:6px;"></i> Retry
        </button>
      </div>
    `;

    // 1. HEADER
    let headerName = (user.name || user.displayName || 'Student').split(' ')[0];
    let headerDetails = `<span style="opacity:0.6;"><i data-lucide="loader" style="width:14px; height:14px; animation:spin 1s linear infinite; margin-right:4px;"></i> Loading student profile...</span>`;
    
    if (!this.loading.student && !this.errors.student && this.myStudent) {
       headerName = (this.myStudent.name || headerName).split(' ')[0];
       const studentRoll = this.myStudent.rollNo || this.myStudent.rollNumber || '—';
       const dept = this.myStudent.department || '—';
       const sec = this.myStudent.section || '—';
       const sem = this.myStudent.semester || '—';
       headerDetails = `Roll Number: <strong>${studentRoll}</strong> | Class: <strong>${dept}-${sec}</strong> (Semester ${sem})`;
    } else if (this.errors.student) {
       headerDetails = `<span style="color:var(--color-danger);"><i data-lucide="alert-circle" style="width:14px; height:14px;"></i> Unable to load profile details.</span>`;
    }

    // 2. ATTENDANCE & SUBJECTS
    let attendanceHtml = '';
    let subjectHtml = '';
    
    if (this.loading.attendance) {
       attendanceHtml = renderAttendanceSkeleton();
       subjectHtml = renderSubjectSkeleton();
    } else if (this.errors.attendance) {
       attendanceHtml = `<div class="glass-panel" style="padding: 2rem; background: rgba(255,255,255,0.7);">${renderError('attendance')}</div>`;
       subjectHtml = `<div class="glass-panel" style="padding: 2rem; background: rgba(255,255,255,0.7);">${renderError('subjects')}</div>`;
    } else {
       const stats = this.attendanceStats || { percentage: 0, total: 0, present: 0, absent: 0, status: 'Unknown' };
       const strokeOffset = 364 - (364 * (stats.percentage / 100));
       
       attendanceHtml = `
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
       `;

       const subjectStats = this.subjectStats || [];
       subjectHtml = `
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
                    <div style="font-size: 0.95rem; font-weight: 600; color: var(--color-navy-dark);">${s.name || '—'} <span style="color: var(--color-text-muted); font-size: 0.8rem; font-weight: 500;">(${s.code || '—'})</span></div>
                    <div style="font-size: 0.95rem; font-weight: 800; color: ${s.percentage >= 75 ? 'var(--color-success)' : 'var(--color-warning)'};">${s.percentage}%</div>
                  </div>
                  <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; border-radius: 4px; background: ${s.percentage >= 75 ? 'var(--color-success)' : 'var(--color-warning)'}; width: ${s.percentage}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
       `;
    }

    // 3. LIBRARY & STATIC INFO
    const learningResources = window.MOCK_DATA && MOCK_DATA.learningResources ? MOCK_DATA.learningResources.length : 0;
    const holidays = window.MOCK_DATA && MOCK_DATA.holidays ? MOCK_DATA.holidays : [];
    const today = new Date().toISOString().split('T')[0];
    const nextHoliday = holidays.filter(h => h.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];

    let libraryHtml = '';
    if (this.loading.library) {
       libraryHtml = `<div style="height:14px; width:150px; background:rgba(0,0,0,0.05); border-radius:4px; animation: pulse 1.5s infinite;"></div>`;
    } else if (this.errors.library) {
       libraryHtml = `<span style="color:var(--color-danger); font-size:0.8rem;">Unable to load library dues</span>`;
    } else {
       const l = this.libraryStats || { issued: 0, overdue: 0, fine: 0 };
       libraryHtml = `<span id="stu-dash-lib-fines" style="font-weight:600; color:var(--color-danger);">₹${l.fine}</span> Pending | <span id="stu-dash-lib-overdue" style="font-weight:600;">${l.overdue} Overdue</span>`;
    }

    return `
      <style>
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      </style>
      <div class="page-header" style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">
          Welcome, ${headerName}! 👋
        </h1>
        <p style="color: var(--color-text-muted); font-size: 0.95rem;">
          ${headerDetails}
        </p>
      </div>

      <!-- MAIN LAYOUT GRID -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 2rem;">
        
        <!-- LEFT COLUMN: GAUGE & SUBJECTS -->
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          ${attendanceHtml}
          ${subjectHtml}
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
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main);">Next Holiday: ${nextHoliday ? nextHoliday.name : '—'}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${nextHoliday ? new Date(nextHoliday.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</div>
                </div>
              </div>

              <div style="display: flex; gap: 0.75rem; padding: 1rem; background: #FFF; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                <div style="color: var(--color-success); margin-top: 2px;"><i data-lucide="check-circle" style="width: 18px;"></i></div>
                <div>
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main);">Library Dues</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${libraryHtml}</div>
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

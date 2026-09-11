/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - STUDENT DASHBOARD (DYNAMIC SERVICE CALCULATED)
   Instant Shell Rendering & Non-blocking Background Stats
   ========================================================================== */

const DashboardStudent = {
  loading: false,
  libraryStats: { issued: 0, overdue: 0, fine: 0 },
  _hasFetchedLibrary: false,

  async fetchLibraryStats(user) {
    if (!user || this._hasFetchedLibrary) return;
    this._hasFetchedLibrary = true;

    try {
      if (window.LibraryService) {
        const db = LibraryService._getDb();
        const userEmail = (user.email || '').toLowerCase().trim();
        
        // Fetch user's transactions and fines in parallel aligning with firestore.rules
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
        
        // Update DOM element values smoothly without full page re-render
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
    const studentList = studentService.getStudents();
    const myStudent = studentList.find(s => s.email === user.email) || studentList.find(s => s.id === "STU001") || studentList[0] || { id: user.uid, semester: 1, section: 'A' };
    const studentRoll = myStudent.rollNo || myStudent.rollNumber || 'N/A';
    
    // Trigger background fetch if not already done
    setTimeout(() => this.fetchLibraryStats(user), 0);
    
    // Dynamic attendance calculation from mock service
    const stats = attendanceService.getStudentAttendance(myStudent.id);
    const strokeOffset = 364 - (364 * (stats.percentage / 100));

    // Dynamic subject-wise attendance calculation
    const subjects = subjectService.getSubjects();
    const subjectStats = subjects.map(sub => {
      const subCalc = attendanceService.getStudentSubjectAttendance(myStudent.id, sub.id);
      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        percentage: subCalc.total > 0 ? subCalc.percentage : 80,
        status: subCalc.status
      };
    });

    // Dynamic stats from services
    const learningResources = window.MOCK_DATA && MOCK_DATA.learningResources ? MOCK_DATA.learningResources.length : 0;
    const holidays = window.MOCK_DATA && MOCK_DATA.holidays ? MOCK_DATA.holidays : [];
    const today = new Date().toISOString().split('T')[0];
    const nextHoliday = holidays.filter(h => h.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];

    return `
      <div class="page-header">
        <h1>Welcome, ${user.name || myStudent.name}! 👋</h1>
        <p>Roll Number: <strong>${studentRoll}</strong> | Registration Number: <strong>${myStudent.registrationNumber || 'N/A'}</strong> | Class: <strong>${myStudent.section ? 'CSE-' + myStudent.section : 'CSE-A'}</strong> (Semester ${myStudent.semester || '1'})</p>
      </div>

      <!-- ACADEMIC SERVICES SUMMARY WIDGETS -->
      <div class="stats-grid" style="margin-bottom: 1.5rem;">
        <div class="stat-card" onclick="App.navigateTo('digital-learning')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Digital Learning</h3>
            <div class="value" style="font-size:1.4rem;">${learningResources} Resources</div>
            <span class="stat-trend positive"><i data-lucide="book-open"></i> Notes, Tutes & Books</span>
          </div>
          <div class="stat-icon blue"><i data-lucide="book-open"></i></div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('timetable')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Timetable</h3>
            <div class="value" style="font-size:1.15rem; color:#2563EB;">View Schedule</div>
            <span class="stat-trend positive"><i data-lucide="clock"></i> Semester ${myStudent.semester}</span>
          </div>
          <div class="stat-icon purple"><i data-lucide="calendar"></i></div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('holiday-calendar')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Upcoming Holiday</h3>
            <div class="value" style="font-size:1.1rem; color:#D97706;">${nextHoliday ? new Date(nextHoliday.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'None'}</div>
            <span class="stat-trend warning"><i data-lucide="flag"></i> ${nextHoliday ? nextHoliday.name : 'No upcoming holidays'}</span>
          </div>
          <div class="stat-icon amber"><i data-lucide="calendar-days"></i></div>
        </div>

      </div>

      <!-- MAIN ATTENDANCE CIRCULAR GAUGE CARD (DYNAMICALLY CALCULATED) -->
      <div class="card" style="background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="award"></i> Overall Attendance Status</h3>
          <span class="status-badge ${stats.percentage >= 75 ? 'present' : 'warning'}">
            ${stats.status}
          </span>
        </div>

        <div class="attendance-gauge-container">
          <div class="circular-gauge">
            <svg viewBox="0 0 140 140">
              <circle class="circular-bg" cx="70" cy="70" r="58"></circle>
              <circle class="circular-fill" cx="70" cy="70" r="58" style="stroke-dashoffset: ${strokeOffset}; stroke: ${stats.percentage >= 75 ? '#10B981' : '#F59E0B'};"></circle>
            </svg>
            <div class="gauge-center-text">
              <div class="percent">${stats.percentage}%</div>
              <div class="label">ATTENDANCE</div>
            </div>
          </div>

          <div class="gauge-stats-details">
            <div class="gauge-stat-box">
              <div class="num">${stats.total}</div>
              <div class="lbl">Total Classes</div>
            </div>
            <div class="gauge-stat-box">
              <div class="num" style="color: var(--color-success);">${stats.present}</div>
              <div class="lbl">Classes Attended</div>
            </div>
            <div class="gauge-stat-box">
              <div class="num" style="color: var(--color-danger);">${stats.absent}</div>
              <div class="lbl">Classes Missed</div>
            </div>
          </div>
        </div>
      </div>

      <!-- BATCH 3 LIBRARY & EXAM FORM WIDGETS -->
      <div class="dashboard-grid" style="margin-bottom: 1.5rem; grid-template-columns: 1fr 1fr !important;">
        <!-- LIBRARY QUICK STATUS -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i data-lucide="book"></i> Library Status</h3>
          </div>
          <div style="padding-top:0.75rem; display:grid; grid-template-columns: repeat(3, 1fr); gap:0.5rem; text-align:center; margin-bottom:1rem;">
            <div style="background:#F8FAFC; padding:0.5rem; border-radius:6px;">
              <span style="font-size:0.75rem; color:var(--color-text-muted);">Issued</span>
              <div id="stu-dash-lib-issued" style="font-size:1.15rem; font-weight:700; color:var(--color-navy-dark);">${this.libraryStats.issued}</div>
            </div>
            <div style="background:#FFF1F2; padding:0.5rem; border-radius:6px;">
              <span style="font-size:0.75rem; color:var(--color-danger);">Overdue</span>
              <div id="stu-dash-lib-overdue" style="font-size:1.15rem; font-weight:700; color:var(--color-danger);">${this.libraryStats.overdue}</div>
            </div>
            <div style="background:#FFFBEB; padding:0.5rem; border-radius:6px;">
              <span style="font-size:0.75rem; color:var(--color-warning);">Fine</span>
              <div id="stu-dash-lib-fines" style="font-size:1.15rem; font-weight:700; color:var(--color-warning);">₹${this.libraryStats.fine}</div>
            </div>
          </div>
          <button class="btn-secondary" style="width:100%; justify-content:center; padding:0.45rem;" onclick="App.navigateTo('library')">
            <i data-lucide="book-open"></i> View Library
          </button>
        </div>

        <!-- EXAM FORM QUICK STATUS -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i data-lucide="file-signature"></i> Examination Form</h3>
          </div>
          <div style="padding-top:0.5rem; margin-bottom:1rem; line-height:1.6;">
            ${(() => {
              const activeExam = window.ExamFormService ? ExamFormService.getExamPeriods().find(p => p.status === 'OPEN') : null;
              if (!activeExam) {
                return `<p style="font-size:0.9rem; color:var(--color-text-muted); margin:0;">No active exam forms open for application.</p>`;
              }
              const submission = ExamFormService.getStudentExamForms(myStudent.id).find(s => s.examId === activeExam.id);
              let statusLabel = submission ? submission.status : 'NOT SUBMITTED';
              let badgeColor = submission ? (submission.status === 'APPROVED' ? 'present' : submission.status === 'REJECTED' ? 'danger' : 'active') : 'warning';
              
              return `
                <div style="font-size:0.9rem; color:var(--color-navy-dark);">Exam: <strong>${activeExam.name}</strong></div>
                <div style="font-size:0.9rem;">Status: <span class="status-badge ${badgeColor}" style="font-size:0.7rem; font-weight:700;">${statusLabel}</span></div>
                <div style="font-size:0.8rem; color:var(--color-text-muted); margin-top:0.25rem;">Deadline: ${activeExam.endDate}</div>
              `;
            })()}
          </div>
          <button class="btn-primary" style="width:100%; justify-content:center; padding:0.45rem;" onclick="App.navigateTo('exam-form')">
            <i data-lucide="arrow-right-circle"></i> Go to Exam Form Portal
          </button>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- LEFT: SUBJECT-WISE ATTENDANCE PROGRESS BARS -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i data-lucide="book-open"></i> Subject-Wise Attendance Breakdown</h3>
            <span class="card-subtitle">Min. Requirement: 75%</span>
          </div>

          <div class="subject-progress-list">
            ${subjectStats.map(s => `
              <div class="subject-progress-item">
                <div class="subject-progress-header">
                  <span>${s.name} (${s.code})</span>
                  <span>${s.percentage}%</span>
                </div>
                <div class="progress-track">
                  <div class="progress-bar-fill ${s.percentage >= 75 ? 'good' : 'warning'}" style="width: ${s.percentage}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- RIGHT: STUDENT NOTIFICATIONS FEED -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i data-lucide="bell"></i> Recent Notifications</h3>
          </div>

          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon" style="background: var(--color-warning-bg); color: var(--color-warning);">
                <i data-lucide="alert-triangle"></i>
              </div>
              <div class="activity-content">
                <p>Low attendance warning in Computer Networks (71%)</p>
                <span>11 Aug, 04:15 PM</span>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon" style="background: var(--color-success-bg); color: var(--color-success);">
                <i data-lucide="check-circle"></i>
              </div>
              <div class="activity-content">
                <p>Attendance marked PRESENT for Data Structures</p>
                <span>10 Aug, 10:30 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

window.DashboardStudent = DashboardStudent;


/* ==========================================================================
   POORNIMA GROUP OF COLLEGE — HALL TICKET VIEW
   Professional A4 Examination Hall Ticket with Print/PDF Support
   ========================================================================== */

const HallTicketView = {
  loading: true,
  hasError: false,
  ticket: null,
  studentInfo: null,
  examForm: null,
  examPeriod: null,
  allSubjects: [],
  departments: [],

  afterRender() {
    if (this.loading) {
      this.fetchData();
    }
    // Re-initialize Lucide icons injected by no-print header
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  async fetchData() {
    if (this._isFetching) return;
    this._isFetching = true;
    this.loading = true;
    this.hasError = false;
    App.renderCurrentView();

    try {
      const user = authService.getCurrentUser();
      if (!user || user.role !== 'STUDENT') {
        this.loading = false;
        this._isFetching = false;
        App.renderCurrentView();
        return;
      }

      // Fetch all needed data in parallel
      const [students, departments, allSubjects] = await Promise.all([
        (typeof studentService !== 'undefined' && studentService.getStudentsFromFirestore)
          ? studentService.getStudentsFromFirestore()
          : (typeof studentService !== 'undefined' ? studentService.getStudents() : []),
        (typeof departmentService !== 'undefined' && departmentService.getDepartmentsFromFirestore)
          ? departmentService.getDepartmentsFromFirestore()
          : (typeof departmentService !== 'undefined' ? departmentService.getDepartments() : []),
        (typeof subjectService !== 'undefined' && subjectService.getSubjectsFromFirestore)
          ? subjectService.getSubjectsFromFirestore()
          : (typeof subjectService !== 'undefined' ? subjectService.getSubjects() : [])
      ]);

      // Map student by auth uid/email fallback chain
      this.studentInfo = students.find(s =>
        s.id === user.id ||
        s.id === user.uid ||
        s.email === user.email ||
        s.userId === user.uid
      ) || null;

      this.departments = departments;
      this.allSubjects = allSubjects;

      // Fetch hall ticket
      this.ticket = (typeof hallTicketService !== 'undefined')
        ? await hallTicketService.getHallTicket(this.studentInfo?.id || user.id)
        : null;

      // Fetch exam form & period if ticket exists
      if (this.ticket && typeof ExamFormService !== 'undefined') {
        try {
          if (this.ticket.examFormId) {
            this.examForm = await ExamFormService.getExamFormById(this.ticket.examFormId);
          }
          if (this.ticket.examId) {
            const periods = await ExamFormService.getExamPeriods();
            this.examPeriod = periods.find(p => p.id === this.ticket.examId) || null;
          }
        } catch (e) {
          console.warn('Could not fetch exam form/period:', e);
        }
      }

      this.loading = false;
      this._isFetching = false;
      App.renderCurrentView();
    } catch (e) {
      console.error('Hall Ticket fetchData error:', e);
      this.hasError = true;
      this.loading = false;
      this._isFetching = false;
      App.renderCurrentView();
    }
  },

  render() {
    const user = authService.getCurrentUser();
    if (!user) return `<div class="card" style="padding:2rem; text-align:center;">Please log in to view your hall ticket.</div>`;

    // Non-student roles get redirected message
    if (user.role !== 'STUDENT') {
      return `
        <div class="page-header">
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark);">Hall Ticket Management</h1>
          <p style="color:var(--color-text-muted);">Admin features for publishing hall tickets are located in Exam Form Management.</p>
        </div>
      `;
    }

    if (this.loading) {
      return `
        <div class="page-header no-print" style="margin-bottom:2rem;">
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">Hall Ticket</h1>
          <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">Download and print your examination hall ticket.</p>
        </div>
        <div class="card" style="padding:4rem; text-align:center;">
          <div style="display:inline-block; width:40px; height:40px; border:4px solid var(--glass-border); border-top-color:var(--color-primary); border-radius:50%; animation:spin 1s infinite linear;"></div>
          <p style="margin-top:1.5rem; color:var(--color-text-muted); font-weight:600;">Loading Hall Ticket...</p>
        </div>
      `;
    }

    if (this.hasError) {
      return `
        <div class="page-header no-print" style="margin-bottom:2rem;">
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0;">Hall Ticket</h1>
        </div>
        <div class="card" style="padding:4rem; text-align:center;">
          <i data-lucide="alert-triangle" style="width:48px; height:48px; color:var(--color-danger); margin-bottom:1rem;"></i>
          <h2 style="color:var(--color-navy-dark); margin-bottom:0.5rem;">Unable to load hall ticket.</h2>
          <p style="color:var(--color-text-muted); margin-bottom:1.5rem;">There was a problem connecting to the server.</p>
          <button class="btn btn-primary" onclick="HallTicketView.fetchData()">
            <i data-lucide="refresh-cw" style="width:16px; height:16px; margin-right:8px;"></i> Try Again
          </button>
        </div>
      `;
    }

    if (!this.ticket || this.ticket.status === 'NOT_AVAILABLE') {
      return `
        <div class="page-header no-print" style="margin-bottom:2rem;">
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">Hall Ticket</h1>
          <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">Download and print your examination hall ticket.</p>
        </div>
        <div class="card" style="text-align:center; padding:4rem 2rem;">
          <div style="font-size:3rem; margin-bottom:1rem;">📄</div>
          <h2 style="font-size:1.4rem; font-weight:700; color:var(--color-navy-dark); margin-bottom:0.5rem;">Hall ticket is not available yet.</h2>
          <p style="color:var(--color-text-muted); max-width:420px; margin:0 auto;">Please check back later or wait for a notification from the administration.</p>
        </div>
      `;
    }

    return this.renderHallTicket(user);
  },

  renderHallTicket(user) {
    const si = this.studentInfo || {};
    const examForm = this.examForm;
    const examPeriod = this.examPeriod;
    const allSubjects = this.allSubjects || [];

    // --- Resolve all display values safely ---
    const candidateName = (si.name || user.name || user.displayName || '—').toUpperCase();
    const rollNumber    = si.rollNumber || si.rollNo || '—';
    const regNumber     = si.registrationNumber || '—';
    const course        = si.course || 'B.Tech';
    const section       = si.section || '—';
    const semester      = examPeriod?.semester || examForm?.semester || si.semester || '—';
    const academicYear  = examPeriod?.academicYear || si.academicYear || si.academicSession || '2026-27';
    const examName      = examPeriod?.name || 'End Semester Examination';
    const hallTicketNo  = this.ticket?.hallTicketNo || `HT-${new Date().getFullYear()}-${regNumber !== '—' ? regNumber : 'N/A'}`;

    // Department resolution
    let deptName = si.department || '—';
    if (si.departmentId && this.departments.length > 0) {
      const d = this.departments.find(d => d.id === si.departmentId);
      if (d) deptName = d.name;
    }

    // --- Build subjects list & classify into Theory / Practical ---
    let subjectList = [];
    if (examForm?.selectedSubjectIds && examForm.selectedSubjectIds.length > 0) {
      subjectList = allSubjects.filter(s => examForm.selectedSubjectIds.includes(s.id));
    }

    const examStartDate = examPeriod?.startDate
      ? new Date(examPeriod.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'TBA';

    // Classify: practical if type contains 'practical' / 'lab' (case-insensitive) or isLab flag
    const isLabSubject = s => {
      const t = (s.type || '').toLowerCase();
      return t.includes('practical') || t.includes('lab') || s.isLab === true;
    };

    const theorySubjects    = subjectList.filter(s => !isLabSubject(s));
    const practicalSubjects = subjectList.filter(s =>  isLabSubject(s));

    // Row builder — compact, alternating stripe
    const buildRows = (list, emptyMsg) => {
      if (list.length === 0) {
        return `<tr><td colspan="5" style="border:1px solid #ccc; padding:8px; text-align:center; font-size:10.5px; color:#888; font-style:italic;">${emptyMsg}</td></tr>`;
      }
      return list.map((s, i) => `
        <tr style="background:${i % 2 === 0 ? '#fff' : '#f4f6ff'};">
          <td style="border:1px solid #ccc; padding:4px 5px; text-align:center; font-size:10px;">${i + 1}</td>
          <td style="border:1px solid #ccc; padding:4px 6px; font-size:10px; font-weight:700; font-family:monospace; white-space:nowrap;">${s.code || '—'}</td>
          <td style="border:1px solid #ccc; padding:4px 6px; font-size:10px;">${s.name || '—'}</td>
          <td style="border:1px solid #ccc; padding:4px 5px; text-align:center; font-size:10px; white-space:nowrap;">${examStartDate}</td>
          <td style="border:1px solid #ccc; padding:4px 5px; text-align:center; font-size:10px; white-space:nowrap;">10:00 AM</td>
        </tr>`).join('');
    };

    const theoryRows    = buildRows(theorySubjects,    'No Theory Subjects');
    const practicalRows = buildRows(practicalSubjects, 'No Practical Subjects');

    const photoSrc = si.photoUrl || si.photo || null;
    const photoHtml = photoSrc
      ? `<img src="${photoSrc}" alt="Student Photo" style="width:100%; height:100%; object-fit:cover;">`
      : `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#aaa; gap:4px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span style="font-size:10px; letter-spacing:0.5px;">PHOTO</span></div>`;

    return `
      <style>
        /* =========================================================
           HALL TICKET — SCREEN + PRINT STYLES
           ========================================================= */
        .ht-wrap {
          max-width: 720px;
          margin: 0 auto 2rem auto;
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
          font-family: 'Times New Roman', Times, serif;
          color: #111;
          line-height: 1.4;
        }

        .ht-inner {
          padding: 20px 24px;
        }

        /* ---- header ---- */
        .ht-header {
          display: flex;
          align-items: center;
          border-bottom: 3px double #1a237e;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }
        .ht-logo {
          width: 62px;
          height: 62px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .ht-title-block {
          flex: 1;
          text-align: center;
          padding: 0 10px;
        }
        .ht-college-name {
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #1a237e;
          margin: 0 0 2px 0;
          font-family: Arial, sans-serif;
        }
        .ht-doc-title {
          font-size: 13px;
          font-weight: bold;
          text-decoration: underline;
          letter-spacing: 1px;
          margin: 0 0 3px 0;
        }
        .ht-exam-title {
          font-size: 11.5px;
          font-weight: bold;
          margin: 0;
        }
        .ht-ticket-no {
          font-size: 10px;
          color: #555;
          margin-top: 3px;
        }

        /* ---- student section ---- */
        .ht-student-section {
          display: flex;
          gap: 12px;
          border: 1.5px solid #1a237e;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 10px;
          background: #fafbff;
        }
        .ht-info-table {
          flex: 1;
          border-collapse: collapse;
          font-size: 11.5px;
        }
        .ht-info-table td {
          padding: 3px 6px 3px 0;
          vertical-align: top;
        }
        .ht-info-table td:first-child {
          font-weight: bold;
          width: 135px;
          white-space: nowrap;
        }
        .ht-photo-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .ht-photo-box {
          width: 88px;
          height: 108px;
          border: 2px solid #1a237e;
          overflow: hidden;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ht-sig-box {
          width: 88px;
          border-top: 1.5px solid #333;
          padding-top: 4px;
          text-align: center;
          font-size: 10px;
          font-weight: bold;
          color: #333;
        }

        /* ---- schedule ---- */
        .ht-section-label {
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #1a237e;
          border-bottom: 1.5px solid #1a237e;
          padding-bottom: 3px;
          margin: 10px 0 6px 0;
        }

        /* Side-by-side schedule wrapper */
        .ht-schedule-row {
          display: flex;
          gap: 8px;
          margin-bottom: 0;
        }
        .ht-schedule-panel {
          flex: 1;
          min-width: 0;
        }
        .ht-panel-header {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 7px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-radius: 3px 3px 0 0;
          margin-bottom: 0;
        }
        .ht-panel-theory   { background: #1a237e; color: #fff; border: 1px solid #1a237e; }
        .ht-panel-practical { background: #1b5e20; color: #fff; border: 1px solid #1b5e20; }

        .ht-schedule-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
        }
        .ht-schedule-table th {
          color: #fff;
          border: 1px solid #555;
          padding: 4px 6px;
          text-align: left;
          font-weight: 700;
          font-size: 10px;
        }
        .ht-theory-th    { background: #283593 !important; border-color: #1a237e !important; }
        .ht-practical-th { background: #2e7d32 !important; border-color: #1b5e20 !important; }
        .ht-schedule-table th:nth-child(1),
        .ht-schedule-table th:nth-child(4),
        .ht-schedule-table th:nth-child(5) { text-align: center; }

        /* ---- instructions ---- */
        .ht-instructions {
          border: 1px solid #aaa;
          border-radius: 3px;
          padding: 7px 10px;
          margin-top: 8px;
          font-size: 10.5px;
          background: #fffef5;
        }
        .ht-instructions h4 {
          font-size: 10.5px;
          font-weight: 900;
          text-transform: uppercase;
          text-decoration: underline;
          margin: 0 0 4px 0;
        }
        .ht-instructions ol {
          margin: 0;
          padding-left: 18px;
          line-height: 1.55;
        }

        /* ---- footer ---- */
        .ht-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed #bbb;
        }
        .ht-sig-line {
          text-align: center;
          font-size: 10.5px;
          font-weight: bold;
        }
        .ht-sig-line div {
          width: 140px;
          border-top: 1.5px solid #333;
          padding-top: 4px;
          margin: 0 auto;
        }
        .ht-seal {
          text-align: center;
          font-size: 10px;
          color: #777;
        }
        .ht-seal-circle {
          width: 60px;
          height: 60px;
          border: 2px dashed #bbb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 4px auto;
          font-size: 9px;
          color: #999;
        }

        /* =========================================================
           PRINT CSS
           ========================================================= */
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          html, body {
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Hide everything except the hall ticket */
          body > *,
          .sidebar,
          .navbar,
          .sidebar-overlay,
          .no-print {
            display: none !important;
          }

          /* Ensure main container shows */
          #app,
          #view-container,
          .main-layout,
          .main-wrapper,
          .main-content {
            all: unset !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            background: #fff !important;
          }

          /* The ticket wrapper fills the page */
          .ht-wrap {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }

          .ht-inner {
            padding: 0 !important;
          }

          /* Kill any page breaks inside sections */
          .ht-header,
          .ht-student-section,
          .ht-schedule-row,
          .ht-instructions,
          .ht-footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Force background colors */
          .ht-theory-th {
            background: #283593 !important;
            color: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .ht-practical-th {
            background: #2e7d32 !important;
            color: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .ht-panel-theory {
            background: #1a237e !important;
            color: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .ht-panel-practical {
            background: #1b5e20 !important;
            color: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>

      <!-- ============================================================
           PAGE HEADER  (screen only — hidden on print)
           ============================================================ -->
      <div class="no-print" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
        <div>
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">Hall Ticket</h1>
          <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">Download and print your examination hall ticket.</p>
        </div>
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button class="btn btn-secondary" onclick="window.print()" style="display:flex; align-items:center; gap:0.5rem;">
            <i data-lucide="download" style="width:16px; height:16px;"></i> Save as PDF
          </button>
          <button class="btn btn-primary" onclick="window.print()" style="display:flex; align-items:center; gap:0.5rem;">
            <i data-lucide="printer" style="width:16px; height:16px;"></i> Print Hall Ticket
          </button>
        </div>
      </div>

      <!-- ============================================================
           A4 HALL TICKET DOCUMENT
           ============================================================ -->
      <div class="ht-wrap">
        <div class="ht-inner">

          <!-- HEADER -->
          <div class="ht-header">
            <img class="ht-logo"
              src="https://images.shiksha.com/mediadata/images/1684410058phpjSEJOU.jpeg"
              alt="Poornima Logo"
              onerror="this.style.display='none'">
            <div class="ht-title-block">
              <p class="ht-college-name">Poornima Group of College</p>
              <p class="ht-doc-title">Examination Hall Ticket</p>
              <p class="ht-exam-title">${examName} &nbsp;|&nbsp; Academic Year: ${academicYear}</p>
            </div>
            <div style="text-align:right; font-size:10px; flex-shrink:0;">
              <div style="font-weight:bold; color:#555;">Hall Ticket No.</div>
              <div style="font-family:monospace; font-weight:900; font-size:11px; color:#1a237e;">${hallTicketNo}</div>
            </div>
          </div>

          <!-- STUDENT INFORMATION + PHOTO -->
          <div class="ht-student-section">
            <!-- Left: info table -->
            <div style="flex:1;">
              <div style="font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:#1a237e; margin-bottom:6px;">Student Information</div>
              <table class="ht-info-table">
                <tr>
                  <td>Candidate Name:</td>
                  <td><strong>${candidateName}</strong></td>
                  <td style="padding-left:16px;">Course:</td>
                  <td>${course}</td>
                </tr>
                <tr>
                  <td>Roll Number:</td>
                  <td>${rollNumber}</td>
                  <td style="padding-left:16px;">Section:</td>
                  <td>${section}</td>
                </tr>
                <tr>
                  <td>Registration No.:</td>
                  <td><strong>${regNumber}</strong></td>
                  <td style="padding-left:16px;">Semester:</td>
                  <td>${semester}</td>
                </tr>
                <tr>
                  <td>Department:</td>
                  <td colspan="3">${deptName}</td>
                </tr>
              </table>
            </div>

            <!-- Right: photo + student signature -->
            <div class="ht-photo-col">
              <div class="ht-photo-box">${photoHtml}</div>
              <div class="ht-sig-box">Student Signature</div>
            </div>
          </div>

          <!-- EXAMINATION SCHEDULE -->
          <div class="ht-section-label">Examination Schedule</div>

          <div class="ht-schedule-row">

            <!-- THEORY PANEL -->
            <div class="ht-schedule-panel">
              <div class="ht-panel-header ht-panel-theory">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                Theory Subjects
              </div>
              <table class="ht-schedule-table">
                <thead>
                  <tr>
                    <th class="ht-theory-th" style="width:28px;">#</th>
                    <th class="ht-theory-th" style="width:72px;">Code</th>
                    <th class="ht-theory-th">Subject Name</th>
                    <th class="ht-theory-th" style="width:68px;">Date</th>
                    <th class="ht-theory-th" style="width:60px;">Time</th>
                  </tr>
                </thead>
                <tbody>${theoryRows}</tbody>
              </table>
            </div>

            <!-- PRACTICAL PANEL -->
            <div class="ht-schedule-panel">
              <div class="ht-panel-header ht-panel-practical">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 1 2-2v-4a2 2 0 0 0-2-2h-4m-4 0V9"/></svg>
                Practical Subjects
              </div>
              <table class="ht-schedule-table">
                <thead>
                  <tr>
                    <th class="ht-practical-th" style="width:28px;">#</th>
                    <th class="ht-practical-th" style="width:72px;">Code</th>
                    <th class="ht-practical-th">Subject Name</th>
                    <th class="ht-practical-th" style="width:68px;">Date</th>
                    <th class="ht-practical-th" style="width:60px;">Time</th>
                  </tr>
                </thead>
                <tbody>${practicalRows}</tbody>
              </table>
            </div>

          </div><!-- /ht-schedule-row -->

          <!-- IMPORTANT INSTRUCTIONS -->
          <div class="ht-instructions">
            <h4>Important Instructions to Candidates</h4>
            <ol>
              <li>Candidates must carry this Hall Ticket and a valid College ID Card to every examination.</li>
              <li>Report to the examination hall at least <strong>30 minutes</strong> before commencement.</li>
              <li>No candidate will be admitted to the hall after 30 minutes from the scheduled start time.</li>
              <li>Mobile phones, smartwatches, and electronic devices are strictly prohibited inside the hall.</li>
              <li>Malpractice of any form will result in immediate cancellation and disciplinary action per university rules.</li>
            </ol>
          </div>

          <!-- FOOTER / SIGNATURES -->
          <div class="ht-footer">
            <div class="ht-sig-line">
              <div>&nbsp;</div>
              Candidate Signature
            </div>
            <div class="ht-seal">
              <div class="ht-seal-circle">SEAL</div>
              College Seal
            </div>
            <div class="ht-sig-line">
              <div>&nbsp;</div>
              Controller of Examination
            </div>
          </div>

        </div><!-- /ht-inner -->
      </div><!-- /ht-wrap -->
    `;
  }
};

window.HallTicketView = HallTicketView;

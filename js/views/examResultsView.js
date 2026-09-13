/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - EXAMINATION RESULTS VIEW CONTROLLER
   With Faculty Privacy Guard & Least-Privilege Scoping
   ========================================================================== */

const ExamResultsView = {
  selectedSemester: '2',
  selectedFacultySubjectId: 'ALL',

  // Admin Result Filters
  adminFilterYear: '2026',
  adminFilterDept: '',
  adminFilterSem: '',
  adminFilterClass: '',
  adminFilterStudent: '',
  adminSearchRegNo: '',

  loading: true,
  hasError: false,
  profileMissing: false,
  myStudent: null,
  students: [],
  subjects: [],
  classes: [],
  departments: [],
  results: [],
  summary: null,
  facultyResults: [],
  authorizedSubjectIds: [],
  
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
    this.profileMissing = false;
    App.renderCurrentView();

    try {
      const fetchPromise = (async () => {
        this.students = typeof studentService !== 'undefined' && studentService.getStudentsFromFirestore ? await studentService.getStudentsFromFirestore() : (typeof studentService !== 'undefined' ? studentService.getStudents() : []);
        this.subjects = typeof subjectService !== 'undefined' && subjectService.getSubjectsFromFirestore ? await subjectService.getSubjectsFromFirestore() : (typeof subjectService !== 'undefined' ? subjectService.getSubjects() : []);
        this.departments = typeof departmentService !== 'undefined' && departmentService.getDepartmentsFromFirestore ? await departmentService.getDepartmentsFromFirestore() : (typeof departmentService !== 'undefined' ? departmentService.getDepartments() : []);
        this.classes = typeof classService !== 'undefined' && classService.getClassesFromFirestore ? await classService.getClassesFromFirestore() : (typeof classService !== 'undefined' ? classService.getClasses() : []);

        const user = authService.getCurrentUser();
        
        if (user.role === 'STUDENT') {
          let resolvedStudent = null;
          if (typeof studentService !== 'undefined' && studentService.resolveStudentProfile) {
            resolvedStudent = await studentService.resolveStudentProfile(user);
          } else {
            resolvedStudent = this.students.find(s => s.email === user.email || s.userId === user.uid || s.id === user.id);
          }
          
          if (!resolvedStudent && !user.name) {
            this.profileMissing = true;
          } else {
            this.myStudent = resolvedStudent || { id: user.uid || user.id, name: user.name || user.displayName || 'Student', email: user.email, rollNumber: 'N/A' };
            this.results = await ExamResultService.getPublishedResults(this.myStudent.id, this.selectedSemester, user);
            this.summary = await ExamResultService.calculateStudentSummary(this.myStudent.id, this.selectedSemester, user);
          }
        } else if (AuthorizationService.isAcademicStaff(user)) {
          this.authorizedSubjectIds = await AuthorizationService.getAuthorizedSubjectIds(user);
          const allResults = await ExamResultService.getAllResults();
          this.facultyResults = await AuthorizationService.filterStudentResultForRole(user, allResults);
        } else {
          if (this.adminFilterStudent) {
            this.results = await ExamResultService.getStudentResults(this.adminFilterStudent, null, user);
          } else {
            this.results = [];
          }
        }
      })();

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 10000));
      await Promise.race([fetchPromise, timeoutPromise]);
      
      this.loading = false;
      this._isFetching = false;
      App.renderCurrentView();
    } catch(e) {
      console.error("ExamResultsView fetchData Error:", e);
      this.hasError = true;
      this.loading = false;
      this._isFetching = false;
      App.renderCurrentView();
    }
  },

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div>Please log in.</div>`;

    if (this.hasError) {
      return `
        <div class="page-header" style="margin-bottom: 2rem;">
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">
            EXAMINATION RESULTS
          </h1>
        </div>
        <div class="glass-panel" style="padding: 4rem; text-align: center;">
          <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: var(--color-danger); margin-bottom: 1rem;"></i>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 0.5rem;">Unable to load examination results.</h2>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">There was an error connecting to the server. Please try again.</p>
          <button class="btn btn-primary" onclick="ExamResultsView.fetchData()">
            <i data-lucide="refresh-cw" style="width: 18px; height: 18px; margin-right: 8px;"></i> Try Again
          </button>
        </div>
      `;
    }

    if (this.profileMissing) {
      return `
        <div class="page-header" style="margin-bottom: 2rem;">
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">
            EXAMINATION RESULTS
          </h1>
        </div>
        <div class="glass-panel" style="padding: 4rem; text-align: center;">
          <i data-lucide="user-x" style="width: 48px; height: 48px; color: var(--color-warning); margin-bottom: 1rem;"></i>
          <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 0.5rem;">Student profile could not be found.</h2>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Your account is not linked to a valid student profile.</p>
          <button class="btn btn-primary" onclick="ExamResultsView.fetchData()">
            <i data-lucide="refresh-cw" style="width: 18px; height: 18px; margin-right: 8px;"></i> Try Again
          </button>
        </div>
      `;
    }

    if (this.loading) {
      return `
        <div class="page-header" style="margin-bottom: 2rem;">
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--color-navy-dark); margin-bottom: 0.25rem;">
            EXAMINATION RESULTS
          </h1>
        </div>
        <div class="glass-panel" style="padding: 4rem; text-align: center;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--glass-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1.5rem; color: var(--color-text-muted); font-weight: 600;">Loading examination results...</p>
        </div>
      `;
    }

    if (user.role === 'STUDENT') {
      return this.renderStudentView(user);
    } else if (AuthorizationService.isAcademicStaff(user)) {
      return this.renderFacultyView(user);
    } else {
      return this.renderAdminView(user);
    }
  },

  // =========================================================================
  // STUDENT VIEW (OWN RESULTS ONLY)
  // =========================================================================
  renderStudentView(user) {
    const student = this.myStudent;
    if (!student) return ''; 
    const results = this.results || [];
    const summary = this.summary || { totalMarks: 0, maxMarks: 0, percentage: 0, sgpa: 0, status: 'N/A' };
    const subjects = this.subjects || [];
    
    // Resolve Department
    let deptName = student?.department || '—';
    if (student?.departmentId && this.departments) {
      const d = this.departments.find(d => d.id === student.departmentId);
      if (d && d.name) deptName = d.name;
    }

    const hasResults = results.length > 0;
    
    // Determine overall result status badge
    let statusBadgeColor = 'var(--color-text-muted)';
    if (hasResults) {
      if (summary.status === 'PASS') statusBadgeColor = 'var(--color-success)';
      else if (summary.status === 'FAIL') statusBadgeColor = 'var(--color-danger)';
      else if (summary.status === 'ABSENT') statusBadgeColor = 'var(--color-warning)';
      else if (summary.status === 'WITHHELD') statusBadgeColor = 'var(--color-primary)';
    }

    return `
      <style>
        .result-print-area { display: block; }
        
        .result-summary-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .result-summary-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .result-summary-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-muted);
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .result-summary-val {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-navy-dark);
          margin-bottom: 0.25rem;
        }
        
        .result-summary-sub {
          font-size: 0.8rem;
          color: var(--color-text-light);
        }
        
        .result-table th, .result-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
        }
        
        @media (max-width: 992px) {
          .result-summary-cards { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (max-width: 600px) {
          .result-summary-cards { grid-template-columns: 1fr; }
        }

        /* PRINT CSS FOR RESULT */
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            background: #fff !important;
          }
          * { box-sizing: border-box; }
          body > :not(#view-container),
          .sidebar, .navbar, .sidebar-overlay, .page-header, .no-print { 
            display: none !important; 
          }
          
          #app, #view-container, .main-layout, .main-wrapper, .main-content {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: visible !important;
            background: #fff !important;
          }

          .result-print-area {
            display: block !important;
            width: 100% !important;
            max-width: 190mm !important;
            margin: 0 auto;
            padding: 0;
            background: #fff !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          .result-summary-cards { gap: 10px; margin-bottom: 15px; }
          .result-summary-card { padding: 10px; border: 1px solid #ccc; box-shadow: none; border-radius: 4px; }
          .result-summary-val { font-size: 1.25rem; }
          
          table.result-table { width: 100% !important; table-layout: auto; border-collapse: collapse; }
          .result-table th, .result-table td { border: 1px solid #ccc !important; padding: 8px !important; }
          
          .glass-panel, .card {
            box-shadow: none !important;
            border: 1px solid #000 !important;
            border-radius: 4px !important;
            background: transparent !important;
          }
          
          /* Force page breaks properly */
          .result-print-area { page-break-inside: avoid; }
        }
      </style>

      <div class="page-header no-print" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.5rem;">
        <div>
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">EXAMINATION RESULTS</h1>
          <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">
            Student: <strong>${student.name}</strong> | Registration No: <strong>${student.registrationNumber || student.rollNumber || '—'}</strong>
          </p>
        </div>

        <div>
          <select class="form-control" style="font-weight:700; min-width:160px; padding:0.6rem 1rem;" onchange="ExamResultsView.selectSemester(this.value)">
            <option value="1" ${this.selectedSemester === '1' ? 'selected' : ''}>Semester 1</option>
            <option value="2" ${this.selectedSemester === '2' ? 'selected' : ''}>Semester 2</option>
            <option value="3" ${this.selectedSemester === '3' ? 'selected' : ''}>Semester 3</option>
            <option value="4" ${this.selectedSemester === '4' ? 'selected' : ''}>Semester 4</option>
            <option value="5" ${this.selectedSemester === '5' ? 'selected' : ''}>Semester 5</option>
            <option value="6" ${this.selectedSemester === '6' ? 'selected' : ''}>Semester 6</option>
            <option value="7" ${this.selectedSemester === '7' ? 'selected' : ''}>Semester 7</option>
            <option value="8" ${this.selectedSemester === '8' ? 'selected' : ''}>Semester 8</option>
          </select>
        </div>
      </div>

      <div class="result-print-area">
        <!-- OFFICIAL HEADER -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 1.25rem 1.5rem; background: var(--color-navy-dark); color: white; border-radius: 8px 8px 0 0;">
          <h2 style="font-size: 1.1rem; font-weight: 800; margin: 0; letter-spacing: 1px;">SEMESTER ${this.selectedSemester} — EXAMINATION RESULT</h2>
          ${hasResults ? `<span style="background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px;"><i data-lucide="check-circle" style="width:12px; height:12px; display:inline-block; margin-right:4px;"></i> OFFICIALLY PUBLISHED</span>` : ''}
        </div>

        <!-- STUDENT INFO BLOCK -->
        <div style="background: white; border: 1px solid var(--color-border); border-top: none; padding: 1.5rem; margin-bottom: 1.5rem; border-radius: 0 0 8px 8px;">
          <h3 style="font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 800; margin: 0 0 1rem 0; letter-spacing: 1px;">STUDENT INFORMATION</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div>
              <div style="font-size: 0.75rem; color: var(--color-text-light);">Student Name</div>
              <div style="font-weight: 700; color: var(--color-navy-dark); text-transform: uppercase;">${student.name}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--color-text-light);">Roll Number</div>
              <div style="font-weight: 700; color: var(--color-navy-dark);">${student.rollNumber || student.rollNo || '—'}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--color-text-light);">Registration No.</div>
              <div style="font-weight: 700; color: var(--color-navy-dark);">${student.registrationNumber || '—'}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--color-text-light);">Department</div>
              <div style="font-weight: 700; color: var(--color-navy-dark);">${deptName}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--color-text-light);">Semester</div>
              <div style="font-weight: 700; color: var(--color-navy-dark);">Semester ${this.selectedSemester}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--color-text-light);">Academic Year</div>
              <div style="font-weight: 700; color: var(--color-navy-dark);">${results[0]?.academicYear || '—'}</div>
            </div>
          </div>
        </div>

        ${!hasResults ? `
          <!-- EMPTY STATE -->
          <div class="glass-panel" style="padding: 4rem; text-align: center; border: 1px solid var(--color-border); border-radius: 8px;">
            <i data-lucide="file-x" style="width: 48px; height: 48px; color: var(--color-text-light); margin-bottom: 1rem;"></i>
            <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--color-navy-dark); margin-bottom: 0.5rem;">No Result Published Yet</h2>
            <p style="color: var(--color-text-muted); margin: 0;">Examination results for Semester ${this.selectedSemester} have not been published yet.</p>
          </div>
        ` : `
          <!-- RESULT SUMMARY CARDS -->
          <div class="result-summary-cards">
            <div class="result-summary-card">
              <div class="result-summary-title">Total Subjects</div>
              <div class="result-summary-val">${results.length}</div>
              <div class="result-summary-sub">Subjects in Semester ${this.selectedSemester}</div>
            </div>
            <div class="result-summary-card">
              <div class="result-summary-title">Marks Obtained</div>
              <div class="result-summary-val" style="color: var(--color-primary);">${summary.totalMarks} <span style="font-size:1rem; color:var(--color-text-light);">/ ${summary.maxMarks}</span></div>
              <div class="result-summary-sub">Total Marks</div>
            </div>
            <div class="result-summary-card">
              <div class="result-summary-title">Percentage</div>
              <div class="result-summary-val">${summary.percentage}%</div>
              <div class="result-summary-sub">Semester Percentage</div>
            </div>
            <div class="result-summary-card">
              <div class="result-summary-title">SGPA</div>
              <div class="result-summary-val" style="color: var(--color-navy-dark);">${summary.sgpa.toFixed(2)}</div>
              <div class="result-summary-sub">Semester Grade Point Average</div>
            </div>
          </div>

          <!-- SUBJECT RESULT TABLE -->
          <div style="background: white; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 1.5rem; overflow: hidden;">
            <div style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-border); background: #F8FAFC;">
              <h3 style="font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 800; margin: 0; letter-spacing: 1px;">SUBJECT-WISE RESULT</h3>
            </div>
            <div class="table-responsive">
              <table class="result-table" style="width: 100%; text-align: left; border-collapse: collapse;">
                <thead style="background: #F1F5F9; font-size: 0.8rem; text-transform: uppercase; color: var(--color-navy-dark);">
                  <tr>
                    <th style="width: 50px; text-align: center;">#</th>
                    <th>Code</th>
                    <th>Subject</th>
                    <th style="text-align: center;">Max Marks</th>
                    <th style="text-align: center;">Marks Obtained</th>
                    <th style="text-align: center;">Grade</th>
                    <th style="text-align: center;">Point</th>
                    <th style="text-align: center;">Result</th>
                  </tr>
                </thead>
                <tbody>
                  ${results.map((r, i) => {
                    const sub = subjects.find(s => s.id === (r?.subjectId || r?.id));
                    const code = sub?.code || r?.subjectCode || 'N/A';
                    const name = sub?.name || r?.subjectName || r?.subjectId || 'Subject information unavailable';
                    
                    // Derive Pass/Fail at subject level based on 40% mapping
                    const isPass = (r?.marks || 0) >= ((r?.maxMarks || 0) * 0.4);
                    const gradePointMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0 };
                    const point = gradePointMap[r?.grade] !== undefined ? gradePointMap[r?.grade] : 7;
                    
                    return `
                      <tr style="font-size: 0.9rem;">
                        <td style="text-align: center; color: var(--color-text-light);">${i + 1}</td>
                        <td style="font-weight: 600; font-family: monospace; color: var(--color-navy-dark);">${code}</td>
                        <td style="font-weight: 600;">${name}</td>
                        <td style="text-align: center; color: var(--color-text-light);">${r?.maxMarks || 0}</td>
                        <td style="text-align: center; font-weight: 700; color: var(--color-navy-dark);">${r?.marks || 0}</td>
                        <td style="text-align: center;"><span style="font-weight: 800; color: ${r?.grade === 'F' ? 'var(--color-danger)' : 'var(--color-success)'}">${r?.grade || '—'}</span></td>
                        <td style="text-align: center; font-weight: 700;">${point}</td>
                        <td style="text-align: center;"><span style="font-weight: 700; font-size: 0.8rem; color: ${isPass ? 'var(--color-success)' : 'var(--color-danger)'}">${isPass ? 'PASS' : 'FAIL'}</span></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- SEMESTER SUMMARY AGGREGATE -->
          <div style="background: white; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 2rem; overflow: hidden;">
            <div style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-border); background: #F8FAFC;">
              <h3 style="font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 800; margin: 0; letter-spacing: 1px;">SEMESTER SUMMARY</h3>
            </div>
            <div style="padding: 1.5rem;">
              <table style="width: 100%; max-width: 400px; font-size: 0.95rem;">
                <tr>
                  <td style="padding: 0.5rem 0; color: var(--color-text-muted);">Total Marks</td>
                  <td style="padding: 0.5rem 0; font-weight: 700; color: var(--color-navy-dark);">${summary.totalMarks} / ${summary.maxMarks}</td>
                </tr>
                <tr>
                  <td style="padding: 0.5rem 0; color: var(--color-text-muted);">Percentage</td>
                  <td style="padding: 0.5rem 0; font-weight: 700; color: var(--color-navy-dark);">${summary.percentage}%</td>
                </tr>
                <tr>
                  <td style="padding: 0.5rem 0; color: var(--color-text-muted);">SGPA</td>
                  <td style="padding: 0.5rem 0; font-weight: 700; color: var(--color-navy-dark);">${summary.sgpa.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 0.5rem 0; color: var(--color-text-muted);">Overall Grade</td>
                  <td style="padding: 0.5rem 0; font-weight: 800; color: ${summary.status === 'PASS' ? 'var(--color-success)' : 'var(--color-danger)'};">${summary.status === 'PASS' ? (summary.sgpa >= 8.5 ? 'O' : (summary.sgpa >= 7.5 ? 'A+' : (summary.sgpa >= 6.5 ? 'A' : 'B+'))) : 'F'}</td>
                </tr>
                <tr>
                  <td style="padding: 0.5rem 0; color: var(--color-text-muted);">Result</td>
                  <td style="padding: 0.5rem 0; font-weight: 800; color: ${statusBadgeColor};">${summary.status}</td>
                </tr>
              </table>
            </div>
          </div>
          
          <div class="no-print" style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem;">
            <button class="btn btn-secondary" onclick="window.print()">
              <i data-lucide="download" style="width:18px; height:18px; margin-right:8px;"></i> Download Result
            </button>
            <button class="btn btn-primary" onclick="window.print()">
              <i data-lucide="printer" style="width:18px; height:18px; margin-right:8px;"></i> Print Result
            </button>
          </div>
        `}
      </div>
    `;
  },
  // =========================================================================
  // FACULTY VIEW (STRICT SUBJECT PRIVACY & ASSIGNED DATA ONLY)
  // =========================================================================
  renderFacultyView(user) {
    const authorizedSubjectIds = this.authorizedSubjectIds || [];
    const subjects = this.subjects.filter(s => authorizedSubjectIds.includes(s.id));
    
    const facultyResults = this.facultyResults || [];
    const students = this.students;

    return `
      <div class="page-header" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.5rem;">
        <div>
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">EXAMINATION MARKS (ASSIGNED SUBJECTS)</h1>
          <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">
            Faculty Scope: <strong>Academic privacy protection active</strong>. Access limited to assigned subjects only.
          </p>
        </div>
        <button class="btn-primary" onclick="ExamResultsView.openAddModal()" >
          <i data-lucide="plus-circle" style="width:16px; height:16px; display:inline;"></i> Add Subject Result
        </button>
      </div>

      <!-- PRIVACY INFORMATIONAL BANNER -->
      <div style="padding:0.85rem 1.25rem; background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; color:#1E40AF; font-size:0.85rem; font-weight:600; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem;">
        <i data-lucide="shield" style="width:18px; height:18px; color:#2563EB;"></i>
        <span>Academic Privacy Enforcement: You are only authorized to view and manage marks for subjects assigned to you (${subjects.map(s => s.code || s.name).join(', ') || 'Assigned Subjects'}). Complete student CGPA and other subject results are hidden.</span>
      </div>

      <div class="card" style="padding:1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:1rem;">
          <h3 style="font-size:1.1rem; font-weight:800; color:var(--color-navy-dark); margin:0;">
            Assigned Subject Records (${facultyResults.length})
          </h3>

          <div>
            <select class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="ExamResultsView.filterFacultySubject(this.value)">
              <option value="ALL">All Assigned Subjects</option>
              ${subjects.map(s => `<option value="${s.id}" ${this.selectedFacultySubjectId === s.id ? 'selected' : ''}>${s.name} (${s.code})</option>`).join('')}
            </select>
          </div>
        </div>

        ${facultyResults.length === 0 ? `
          <div style="padding:3rem; text-align:center; color:var(--color-text-muted);">
            <i data-lucide="file-x" style="width:48px; height:48px; stroke-width:1.5; margin-bottom:1rem; color:#94A3B8;"></i>
            <h3>No Marks Found</h3>
            <p style="font-size:0.9rem;">No examination results have been entered for your assigned subject(s) yet.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr >
                  <th style="text-align:left;">Student</th>
                  <th style="text-align:left;">Subject</th>
                  <th style="text-align:center;">Semester</th>
                  <th style="text-align:center;">Marks Obtained</th>
                  <th style="text-align:center;">Grade</th>
                  <th style="text-align:center;">Status</th>
                  <th style="text-align:center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${facultyResults
                  .filter(r => this.selectedFacultySubjectId === 'ALL' || r.subjectId === this.selectedFacultySubjectId)
                  .map(r => {
                    const stu = students.find(s => s.id === r.studentId);
                    const sub = subjects.find(s => s.id === r.subjectId);
                    return `
                      <tr >
                        <td >
                          <strong style="color:var(--color-navy-dark);">${stu ? stu.name : r.studentId}</strong>
                          <div style="font-size:0.75rem; color:var(--color-text-muted); font-family:monospace;">${stu ? stu.registrationNumber || stu.rollNumber : ''}</div>
                        </td>
                        <td >${sub ? sub.name : (r.subjectId || 'Subject information unavailable')}</td>
                        <td style="text-align:center;">Sem ${r.semester}</td>
                        <td style="text-align:center;">
                          <strong style="color:#2563EB;">${r.marks}</strong> / ${r.maxMarks}
                        </td>
                        <td style="text-align:center;">
                          <span class="status-badge active" style="font-weight:700;">${r.grade}</span>
                        </td>
                        <td style="text-align:center;">
                          <span class="status-badge ${r.status === 'PUBLISHED' ? 'active' : 'warning'}">${r.status}</span>
                        </td>
                        <td style="text-align:center;">
                          <button class="btn-icon" style="color:var(--color-danger);" title="Delete Record" onclick="ExamResultsView.deleteResult('${r.id}')">
                            <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  // =========================================================================
  // ADMIN VIEW (FULL ADMINISTRATIVE ACCESS)
  // =========================================================================
  renderAdminView(user) {
    const depts = this.departments;
    const classes = this.classes;
    const allStudents = this.students;
    const subjects = this.subjects;

    // Filter Students for dropdown based on upstream selections
    let filteredStudents = [];
    if (this.adminSearchRegNo) {
      filteredStudents = allStudents.filter(s => 
        (s.registrationNumber && s.registrationNumber.toLowerCase().includes(this.adminSearchRegNo.toLowerCase())) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(this.adminSearchRegNo.toLowerCase()))
      );
    } else {
      filteredStudents = allStudents.filter(s => 
        (!this.adminFilterYear || s.enrollmentYear == this.adminFilterYear) &&
        (!this.adminFilterDept || s.departmentId === this.adminFilterDept || s.department === this.adminFilterDept) &&
        (!this.adminFilterSem || s.semester == this.adminFilterSem) &&
        (!this.adminFilterClass || s.sectionId === this.adminFilterClass || s.section === this.adminFilterClass)
      );
    }

    const filteredClasses = classes.filter(c => 
      (!this.adminFilterDept || c.departmentId === this.adminFilterDept || c.department === this.adminFilterDept) &&
      (!this.adminFilterSem || c.semester == this.adminFilterSem)
    );

    let results = [];
    if (this.adminFilterStudent) {
      results = ExamResultService.getStudentResults(this.adminFilterStudent, null, user);
    }

    return `
      <div class="page-header" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.5rem;">
        <div>
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">EXAMINATION RESULTS MANAGEMENT</h1>
          <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">
            Admin Portal: Input marks, grade calculations, and publish official semester results.
          </p>
        </div>
        <button class="btn-primary" onclick="ExamResultsView.openAddModal()" >
          <i data-lucide="plus-circle" style="width:16px; height:16px; display:inline;"></i> Add Student Result
        </button>
      </div>

      <!-- FILTERS -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="filter"></i> Target Student Result</h3>
        </div>
        
        <div class="card-body" style="padding:1.5rem;">
          <!-- Registration Search -->
          <div style="display:flex; gap:1rem; margin-bottom:1.5rem; align-items:flex-end;">
            <div style="flex:1;">
              <label class="form-label" style="font-size:0.8rem;">Search by Registration No. / Roll No.</label>
              <input type="text" id="admin-reg-search" class="form-control" placeholder="e.g. PIET25CS..." value="${this.adminSearchRegNo}">
            </div>
            <button class="btn-primary" onclick="ExamResultsView.searchByRegNo()">
              <i data-lucide="search"></i> Search
            </button>
            <button class="btn-secondary" onclick="ExamResultsView.clearFilters()">
              <i data-lucide="refresh-cw"></i> Clear All
            </button>
          </div>

          <hr style="border:0; border-top:1px solid #E2E8F0; margin-bottom:1.5rem;">

          <!-- Academic Dropdowns -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
            <div>
              <label class="form-label" style="font-size:0.8rem;">Enrollment Year</label>
              <select class="form-control" onchange="ExamResultsView.updateAdminFilter('year', this.value)">
                <option value="">Any Year</option>
                <option value="2026" ${this.adminFilterYear === '2026' ? 'selected' : ''}>2026</option>
                <option value="2025" ${this.adminFilterYear === '2025' ? 'selected' : ''}>2025</option>
              </select>
            </div>
            <div>
              <label class="form-label" style="font-size:0.8rem;">Department</label>
              <select class="form-control" onchange="ExamResultsView.updateAdminFilter('dept', this.value)">
                <option value="">Select Dept...</option>
                ${depts.map(d => `<option value="${d.id}" ${this.adminFilterDept === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label" style="font-size:0.8rem;">Semester</label>
              <select class="form-control" onchange="ExamResultsView.updateAdminFilter('sem', this.value)" ${!this.adminFilterDept ? 'disabled' : ''}>
                <option value="">Select Sem...</option>
                ${[1,2,3,4,5,6,7,8].map(s => `<option value="${s}" ${this.adminFilterSem == s ? 'selected' : ''}>Semester ${s}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label" style="font-size:0.8rem;">Section</label>
              <select class="form-control" onchange="ExamResultsView.updateAdminFilter('class', this.value)" ${!this.adminFilterSem ? 'disabled' : ''}>
                <option value="">Select Section...</option>
                ${filteredClasses.map(c => `<option value="${c.id}" ${this.adminFilterClass === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div style="margin-top:1.5rem;">
            <label class="form-label" style="font-size:0.8rem;">Student <span style="color:red;">*</span></label>
            <select class="form-control" style="font-weight:700;" onchange="ExamResultsView.updateAdminFilter('student', this.value)" ${!this.adminSearchRegNo && (!this.adminFilterDept || !this.adminFilterSem) ? 'disabled' : ''}>
              ${filteredStudents.length === 0 ? '<option value="">No students matched</option>' : '<option value="">Select Student ▼</option>'}
              ${filteredStudents.map(s => `<option value="${s.id}" ${this.adminFilterStudent === s.id ? 'selected' : ''}>${s.name} (${s.registrationNumber || s.rollNumber})</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      ${!this.adminFilterStudent ? `
        <div class="card" style="padding:3rem; text-align:center; color:var(--color-text-muted);">
          <i data-lucide="user-search" style="width:48px; height:48px; stroke-width:1.5; margin-bottom:1rem; color:#94A3B8;"></i>
          <h3>No Student Selected</h3>
          <p style="font-size:0.9rem;">Please select a student from the dropdown above to load their examination results.</p>
        </div>
      ` : (results.length === 0 ? `
        <div class="card" style="padding:3rem; text-align:center; color:var(--color-text-muted);">
          <i data-lucide="file-x" style="width:48px; height:48px; stroke-width:1.5; margin-bottom:1rem; color:#94A3B8;"></i>
          <h3>No Records Found</h3>
          <p style="font-size:0.9rem;">No results exist for this student yet.</p>
        </div>
      ` : `
        <div class="card" style="padding:1.5rem;">
          <div class="card-header" style="margin-bottom:1rem;">
            <h3 class="card-title" style="margin:0; font-weight:800;"><i data-lucide="award"></i> Examination Records (${results.length})</h3>
          </div>

          <div class="table-responsive">
            <table class="data-table" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr >
                  <th style="text-align:left;">Student</th>
                  <th style="text-align:center;">Semester</th>
                  <th style="text-align:left;">Subject</th>
                  <th style="text-align:center;">Marks</th>
                  <th style="text-align:center;">Grade</th>
                  <th style="text-align:center;">Publish Status / Action</th>
                  <th style="text-align:center;">Published Date</th>
                  <th style="text-align:center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${results.map(r => {
                  const stu = allStudents.find(s => s.id === r.studentId);
                  const sub = subjects.find(s => s.id === r.subjectId);
                  return `
                    <tr >
                      <td >
                        <strong style="color:var(--color-navy-dark);">${stu ? stu.name : r.studentId}</strong>
                        <div style="font-size:0.75rem; color:var(--color-text-muted); font-family:monospace;">${stu ? stu.registrationNumber || stu.rollNumber : ''}</div>
                      </td>
                      <td style="text-align:center;">Sem ${r.semester}</td>
                      <td >${sub ? sub.name : (r.subjectId || 'Subject information unavailable')}</td>
                      <td style="text-align:center;"><strong>${r.marks}</strong> / ${r.maxMarks}</td>
                      <td style="text-align:center;"><span class="status-badge active" style="font-weight:700;">${r.grade}</span></td>
                      <td style="text-align:center;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem;">
                          <span class="status-badge ${r.status === 'PUBLISHED' ? 'active' : 'warning'}" style="font-weight:700;">${r.status}</span>
                          ${r.status === 'UNPUBLISHED' ? `
                            <button class="btn-secondary btn-sm" style="color:var(--color-success); border-color:#BBF7D0; width:100%;" title="Publish Result" onclick="ExamResultsView.publishResult('${r.id}')">
                              <i data-lucide="check-circle" style="width:12px; height:12px; display:inline;"></i> PUBLISH
                            </button>
                          ` : `
                            <button class="btn-secondary btn-sm" style="color:var(--color-warning); border-color:#FED7AA; width:100%;" title="Unpublish Result" onclick="ExamResultsView.unpublishResult('${r.id}')">
                              <i data-lucide="x-circle" style="width:12px; height:12px; display:inline;"></i> UNPUBLISH
                            </button>
                          `}
                        </div>
                      </td>
                      <td style="text-align:center;">${r.publishedAt || '—'}</td>
                      <td style="text-align:center;">
                        <button class="btn-icon" style="color:var(--color-danger);" title="Delete" onclick="ExamResultsView.deleteResult('${r.id}')"><i data-lucide="trash-2" style="width:16px; height:16px;"></i></button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `)}
    `;
  },
  
  updateAdminFilter(key, value) {
    if (key === 'year') {
      this.adminFilterYear = value;
    } else if (key === 'dept') {
      this.adminFilterDept = value;
      this.adminFilterClass = '';
      this.adminFilterStudent = '';
    } else if (key === 'sem') {
      this.adminFilterSem = value;
      this.adminFilterClass = '';
      this.adminFilterStudent = '';
    } else if (key === 'class') {
      this.adminFilterClass = value;
      this.adminFilterStudent = '';
    } else if (key === 'student') {
      this.adminFilterStudent = value;
    }
    
    // Changing an academic dropdown naturally invalidates the strict RegNo search
    if (key !== 'student') {
      this.adminSearchRegNo = ''; 
    }
    
    App.renderCurrentView();
  },

  searchByRegNo() {
    const input = document.getElementById('admin-reg-search');
    if (input) {
      this.adminSearchRegNo = input.value.trim();
      this.adminFilterStudent = ''; // Reset selected student
      App.renderCurrentView();
    }
  },

  clearFilters() {
    this.adminFilterYear = '';
    this.adminFilterDept = '';
    this.adminFilterSem = '';
    this.adminFilterClass = '';
    this.adminFilterStudent = '';
    this.adminSearchRegNo = '';
    App.renderCurrentView();
  },

  selectSemester(sem) {
    this.selectedSemester = sem;
    App.renderCurrentView();
  },

  filterFacultySubject(subjectId) {
    this.selectedFacultySubjectId = subjectId;
    App.renderCurrentView();
  },

  async openAddModal() {
    const user = authService.getCurrentUser();
    let students = DataStore.get('STUDENTS') || [];
    let subjects = subjectService.getSubjects();

    if (user && AuthorizationService.isAcademicStaff(user)) {
      const authorizedSubjectIds = this.authorizedSubjectIds || [];
      subjects = subjects.filter(s => authorizedSubjectIds.includes(s.id));
      const authorizedStudentIds = await AuthorizationService.getAuthorizedStudentIds(user);
      students = students.filter(s => authorizedStudentIds.includes(s.id));
    }

    if (subjects.length === 0) {
      UIService.showToast("No authorized subjects available for result entry.", "warning");
      return;
    }

    const modalHtml = `
      <form id="add-result-form" onsubmit="return false;">
        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Student *</label>
          <select id="res-student" class="form-select" style="width:100%; padding:0.5rem; border:1px solid var(--color-border); border-radius:4px; font-family:inherit;" required>
            <option value="" disabled selected>Select Student ▼</option>
            ${students.map(s => `<option value="${s.id}">${s.name} (${s.registrationNumber || s.rollNumber})</option>`).join('')}
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Semester *</label>
            <select id="res-sem" class="form-select" style="width:100%; padding:0.5rem; border:1px solid var(--color-border); border-radius:4px; font-family:inherit;" required>
              <option value="" disabled selected>Select Semester ▼</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Subject *</label>
            <select id="res-subject" class="form-select" style="width:100%; padding:0.5rem; border:1px solid var(--color-border); border-radius:4px; font-family:inherit;" required>
              <option value="" disabled selected>Select Subject ▼</option>
              ${subjects.map(s => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Marks Obtained *</label>
            <input type="number" id="res-marks" class="form-input" placeholder="e.g. 85" min="0" max="100" required style="padding-left:1rem; width:100%;">
          </div>
          <div class="form-group">
            <label class="form-label">Max Marks *</label>
            <input type="number" id="res-max-marks" class="form-input" value="100" required style="padding-left:1rem; width:100%;">
          </div>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Publishing Status *</label>
          <select id="res-status" class="form-select" style="width:100%; padding:0.5rem; border:1px solid var(--color-border); border-radius:4px; font-family:inherit;" required>
            <option value="PUBLISHED" selected>PUBLISHED</option>
            <option value="UNPUBLISHED">UNPUBLISHED (Hidden from student)</option>
          </select>
        </div>
      </form>
    `;

    UIService.openModal(
      "Add Examination Result",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Add Result',
          className: 'btn-primary',
          onClick: () => {
            const studentId = document.getElementById('res-student').value;
            const semester = document.getElementById('res-sem').value;
            const subjectId = document.getElementById('res-subject').value;
            const marks = document.getElementById('res-marks').value;
            const maxMarks = document.getElementById('res-max-marks').value;
            const status = document.getElementById('res-status').value;

            try {
              ExamResultService.createResult({
                studentId, semester, subjectId, marks, maxMarks, status
              }, user);
              UIService.showToast("Result record saved successfully!", "success");
              UIService.closeModal();
              App.renderCurrentView();
            } catch (err) {
              UIService.showToast(err.message, "danger");
            }
          }
        }
      ]
    );
  },

  publishResult(id) {
    const user = authService.getCurrentUser();
    try {
      ExamResultService.publishResult(id, user);
      UIService.showToast("Result published to student portal.", "success");
      App.renderCurrentView();
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  },

  unpublishResult(id) {
    const user = authService.getCurrentUser();
    UIService.showConfirm("Unpublish Exam Result?", "This result will no longer be visible to students. Are you sure you want to unpublish it?", () => {
      try {
        ExamResultService.unpublishResult(id, user);
        UIService.showToast("Exam result unpublished successfully.", "success");
        App.renderCurrentView();
      } catch (err) {
        UIService.showToast(err.message, "danger");
      }
    });
  },

  deleteResult(id) {
    const user = authService.getCurrentUser();
    UIService.showConfirm("Delete Result", "Are you sure you want to delete this result entry?", () => {
      try {
        ExamResultService.deleteResult(id, user);
        UIService.showToast("Result entry deleted.", "info");
        App.renderCurrentView();
      } catch (err) {
        UIService.showToast(err.message, "danger");
      }
    });
  }
};

window.ExamResultsView = ExamResultsView;


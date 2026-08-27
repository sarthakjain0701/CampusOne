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

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div>Please log in.</div>`;

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
    const students = DataStore.get('STUDENTS') || [];
    const student = students.find(s => s.email === user.email || s.userId === user.uid || s.id === user.id) || students[0];
    const results = ExamResultService.getPublishedResults(student.id, this.selectedSemester, user);
    const summary = ExamResultService.calculateStudentSummary(student.id, this.selectedSemester, user);
    const subjects = subjectService.getSubjects();

    return `
      <div class="page-header" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem;">
        <div>
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">EXAMINATION RESULTS</h1>
          <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">
            Student: <strong>${student.name}</strong> | Registration No: <strong>${student.registrationNumber || student.rollNumber}</strong>
          </p>
        </div>

        <div>
          <select class="form-control" style="font-weight:700; min-width:160px;" onchange="ExamResultsView.selectSemester(this.value)">
            <option value="1" ${this.selectedSemester === '1' ? 'selected' : ''}>Semester 1</option>
            <option value="2" ${this.selectedSemester === '2' ? 'selected' : ''}>Semester 2</option>
          </select>
        </div>
      </div>

      <!-- PERFORMANCE SUMMARY CARDS (STUDENT ONLY) -->
      <div class="stats-grid" style="margin-bottom:1.5rem;">
        <div class="stat-card">
          <div class="stat-info">
            <h3>Cumulative Percentage</h3>
            <div class="value" style="color:var(--color-primary);">${summary.percentage}%</div>
            <span class="stat-trend positive">Total Marks: ${summary.totalMarks} / ${summary.maxMarks}</span>
          </div>
          <div class="stat-icon blue"><i data-lucide="percent"></i></div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <h3>SGPA Score</h3>
            <div class="value" style="color:var(--color-indigo);">${summary.sgpa}</div>
            <span class="stat-trend positive">Semester ${this.selectedSemester}</span>
          </div>
          <div class="stat-icon purple"><i data-lucide="award"></i></div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <h3>Final Status</h3>
            <div class="value" style="color:${summary.status === 'PASS' ? 'var(--color-success)' : 'var(--color-danger)'};">${summary.status}</div>
            <span class="stat-trend ${summary.status === 'PASS' ? 'positive' : 'negative'}">${summary.status === 'PASS' ? 'Promoted' : 'Needs Improvement'}</span>
          </div>
          <div class="stat-icon ${summary.status === 'PASS' ? 'green' : 'red'}"><i data-lucide="${summary.status === 'PASS' ? 'check-circle' : 'alert-circle'}"></i></div>
        </div>
      </div>

      <!-- SUBJECT RESULTS TABLE -->
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title" style="margin:0; font-weight:800;"><i data-lucide="file-text"></i> Grade Card — Semester ${this.selectedSemester}</h3>
          <span class="status-badge active"><i data-lucide="shield-check" style="width:12px; height:12px;"></i> Official Published</span>
        </div>

        ${results.length === 0 ? `
          <div style="padding:3rem; text-align:center; color:var(--color-text-muted);">
            <i data-lucide="file-x" style="width:48px; height:48px; stroke-width:1.5; margin-bottom:1rem; color:#94A3B8;"></i>
            <h3>No Published Results Available</h3>
            <p style="font-size:0.9rem;">Results for Semester ${this.selectedSemester} have not been published yet.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
                  <th style="text-align:left;">Subject</th>
                  <th style="text-align:left;">Code</th>
                  <th style="text-align:center;">Credits</th>
                  <th style="text-align:center;">Marks Obtained</th>
                  <th style="text-align:center;">Grade</th>
                  <th style="text-align:center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${results.map(r => {
                  const sub = subjects.find(s => s.id === r.subjectId);
                  const isPass = r.marks >= (r.maxMarks * 0.4);
                  return `
                    <tr style="border-bottom:1px solid #F1F5F9;">
                      <td style="font-weight:700; color:var(--color-navy-dark);">${sub ? sub.name : r.subjectId}</td>
                      <td><code>${sub ? sub.code : 'CS'}</code></td>
                      <td style="text-align:center;">${r.credits || 4}</td>
                      <td style="text-align:center;"><strong>${r.marks}</strong> / ${r.maxMarks}</td>
                      <td style="text-align:center;"><span class="status-badge ${r.grade === 'O' || r.grade.startsWith('A') ? 'active' : 'warning'}" style="font-weight:700;">${r.grade}</span></td>
                      <td style="text-align:center;"><span class="status-badge ${isPass ? 'present' : 'danger'}">${isPass ? 'PASS' : 'FAIL'}</span></td>
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
  // FACULTY VIEW (STRICT SUBJECT PRIVACY & ASSIGNED DATA ONLY)
  // =========================================================================
  renderFacultyView(user) {
    const authorizedSubjectIds = AuthorizationService.getAuthorizedSubjectIds(user);
    const subjects = subjectService.getSubjects().filter(s => authorizedSubjectIds.includes(s.id));
    const allResults = ExamResultService.getAllResults();
    const facultyResults = AuthorizationService.filterStudentResultForRole(user, allResults);
    const students = DataStore.get('STUDENTS') || [];

    return `
      <div class="page-header" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.5rem;">
        <div>
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">EXAMINATION MARKS (ASSIGNED SUBJECTS)</h1>
          <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">
            Faculty Scope: <strong>Academic privacy protection active</strong>. Access limited to assigned subjects only.
          </p>
        </div>
        <button class="btn-primary" onclick="ExamResultsView.openAddModal()" style="font-weight:700;">
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
                <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
                  <th style="text-align:left; padding:0.85rem 1rem;">Student</th>
                  <th style="text-align:left; padding:0.85rem 1rem;">Subject</th>
                  <th style="text-align:center; padding:0.85rem 1rem;">Semester</th>
                  <th style="text-align:center; padding:0.85rem 1rem;">Marks Obtained</th>
                  <th style="text-align:center; padding:0.85rem 1rem;">Grade</th>
                  <th style="text-align:center; padding:0.85rem 1rem;">Status</th>
                  <th style="text-align:center; padding:0.85rem 1rem;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${facultyResults
                  .filter(r => this.selectedFacultySubjectId === 'ALL' || r.subjectId === this.selectedFacultySubjectId)
                  .map(r => {
                    const stu = students.find(s => s.id === r.studentId);
                    const sub = subjects.find(s => s.id === r.subjectId);
                    return `
                      <tr style="border-bottom:1px solid #F1F5F9;">
                        <td style="padding:0.85rem 1rem;">
                          <strong style="color:var(--color-navy-dark);">${stu ? stu.name : r.studentId}</strong>
                          <div style="font-size:0.75rem; color:var(--color-text-muted); font-family:monospace;">${stu ? stu.registrationNumber || stu.rollNumber : ''}</div>
                        </td>
                        <td style="padding:0.85rem 1rem; font-weight:600; color:#334155;">${sub ? sub.name : r.subjectId}</td>
                        <td style="text-align:center; padding:0.85rem 1rem;">Sem ${r.semester}</td>
                        <td style="text-align:center; padding:0.85rem 1rem;">
                          <strong style="color:#2563EB;">${r.marks}</strong> / ${r.maxMarks}
                        </td>
                        <td style="text-align:center; padding:0.85rem 1rem;">
                          <span class="status-badge active" style="font-weight:700;">${r.grade}</span>
                        </td>
                        <td style="text-align:center; padding:0.85rem 1rem;">
                          <span class="status-badge ${r.status === 'PUBLISHED' ? 'active' : 'warning'}">${r.status}</span>
                        </td>
                        <td style="text-align:center; padding:0.85rem 1rem;">
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
    const depts = typeof departmentService !== 'undefined' ? departmentService.getDepartments() : [];
    const classes = typeof classService !== 'undefined' ? classService.getClasses() : [];
    const allStudents = typeof studentService !== 'undefined' ? studentService.getStudents() : (DataStore.get('STUDENTS') || []);
    const subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : [];

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
        <button class="btn-primary" onclick="ExamResultsView.openAddModal()" style="font-weight:700;">
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
                <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
                  <th style="text-align:left; padding:0.85rem 1rem;">Student</th>
                  <th style="text-align:center; padding:0.85rem 1rem;">Semester</th>
                  <th style="text-align:left; padding:0.85rem 1rem;">Subject</th>
                  <th style="text-align:center; padding:0.85rem 1rem;">Marks</th>
                  <th style="text-align:center; padding:0.85rem 1rem;">Grade</th>
                  <th style="text-align:center; padding:0.85rem 1rem;">Publish Status / Action</th>
                  <th style="text-align:center; padding:0.85rem 1rem;">Published Date</th>
                  <th style="text-align:center; padding:0.85rem 1rem;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${results.map(r => {
                  const stu = allStudents.find(s => s.id === r.studentId);
                  const sub = subjects.find(s => s.id === r.subjectId);
                  return `
                    <tr style="border-bottom:1px solid #F1F5F9;">
                      <td style="padding:0.85rem 1rem;">
                        <strong style="color:var(--color-navy-dark);">${stu ? stu.name : r.studentId}</strong>
                        <div style="font-size:0.75rem; color:var(--color-text-muted); font-family:monospace;">${stu ? stu.registrationNumber || stu.rollNumber : ''}</div>
                      </td>
                      <td style="text-align:center; padding:0.85rem 1rem;">Sem ${r.semester}</td>
                      <td style="padding:0.85rem 1rem; font-weight:600; color:#334155;">${sub ? sub.name : r.subjectId}</td>
                      <td style="text-align:center; padding:0.85rem 1rem;"><strong>${r.marks}</strong> / ${r.maxMarks}</td>
                      <td style="text-align:center; padding:0.85rem 1rem;"><span class="status-badge active" style="font-weight:700;">${r.grade}</span></td>
                      <td style="text-align:center; padding:0.85rem 1rem;">
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
                      <td style="text-align:center; padding:0.85rem 1rem; font-size:0.85rem; color:var(--color-text-muted);">${r.publishedAt || '—'}</td>
                      <td style="text-align:center; padding:0.85rem 1rem;">
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

  openAddModal() {
    const user = authService.getCurrentUser();
    let students = DataStore.get('STUDENTS') || [];
    let subjects = subjectService.getSubjects();

    if (user && AuthorizationService.isAcademicStaff(user)) {
      const authorizedSubjectIds = AuthorizationService.getAuthorizedSubjectIds(user);
      subjects = subjects.filter(s => authorizedSubjectIds.includes(s.id));
      const authorizedStudentIds = AuthorizationService.getAuthorizedStudentIds(user);
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


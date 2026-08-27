/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAMS) - HYBRID MID-TERM MARKS VIEW
   "SEARCH FIRST, LOAD SECOND" - Low Latency & Responsive Marks Management
   ========================================================================== */

const MidTermMarksView = {
  // View State (Zero heavy initial data load!)
  searchRegistrationNo: '',
  searchedStudent: null,
  searchPerformed: false,

  // Class Filter State
  selectedYear: 'ALL',
  selectedDepartment: 'ALL',
  selectedSemester: 'ALL',
  selectedSection: 'ALL',
  selectedAssessment: '',
  selectedSubject: 'ALL',
  filterStudentsResult: null,

  // Selected Active Student Marks State
  selectedStudentForMarks: null,
  selectedStudentMarksList: [],
  isLoadingMarks: false,

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div>Please log in.</div>`;

    // Role Protection
    if (user.role === 'STUDENT') {
      return this.renderStudentSelfView(user);
    } else {
      return this.renderHybridManagementView(user);
    }
  },

  // =========================================================================
  // STUDENT ROLE VIEW (READ ONLY SELF MARKS)
  // =========================================================================
  renderStudentSelfView(user) {
    const students = DataStore.get('STUDENTS') || [];
    const student = students.find(s => s.email === user.email || s.userId === user.uid || s.id === user.id) || students[0];

    const marks = midTermMarksService.getMarksForStudent(student ? student.id : user.id);
    const published = marks.filter(m => m.status === 'PUBLISHED');

    if (published.length === 0) {
      return `
        <div class="page-header">
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark);">Mid-Term Marks</h1>
          <p style="color:var(--color-text-muted);">View your mid-term examination performance.</p>
        </div>
        <div class="card" style="text-align:center; padding:3.5rem 2rem; margin-top:1rem;">
          <i data-lucide="file-spreadsheet" style="width:48px; height:48px; stroke-width:1.5; color:#94A3B8; margin-bottom:1rem;"></i>
          <h3 style="font-size:1.25rem; font-weight:700; color:var(--color-navy-dark); margin-bottom:0.5rem;">Mid-Term Marks Not Published</h3>
          <p style="color:var(--color-text-muted); font-size:0.9rem; max-width:400px; margin:0 auto;">Your mid-term evaluation marks have not been published by the academic department yet.</p>
        </div>
      `;
    }

    let totalMax = 0;
    let totalObt = 0;

    const rows = published.map(m => {
      totalMax += m.maxMarks;
      totalObt += m.obtainedMarks;
      return `
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="font-weight:700; color:var(--color-navy-dark);">${m.subjectName} (${m.subjectCode})</td>
          <td style="font-weight:600; color:#475569;">${m.examName || 'Mid-Term 1'}</td>
          <td style="text-align:center; font-weight:700; color:#2563EB;">${m.obtainedMarks} / ${m.maxMarks}</td>
        </tr>
      `;
    }).join('');

    const percentage = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : 0;

    return `
      <div class="page-header" style="margin-bottom:1.5rem;">
        <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">MID-TERM MARKS</h1>
        <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">
          Academic Session: <strong>${student ? student.academicSession || '2026-27' : '2026-27'}</strong> | Semester: <strong>${student ? student.semester || 2 : 2}</strong>
        </p>
      </div>

      <div class="card" style="max-width:800px; margin:0 auto; padding:2rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #E2E8F0; padding-bottom:1rem; margin-bottom:1.5rem;">
          <div>
            <h2 style="font-size:1.25rem; font-weight:800; color:var(--color-navy-dark); margin:0;">${student ? student.name : user.name}</h2>
            <div style="font-size:0.85rem; color:var(--color-text-muted); margin-top:0.2rem;">
              Registration No.: <strong>${student ? student.registrationNumber || student.rollNumber : 'N/A'}</strong> | Section: <strong>${student ? student.section : 'A'}</strong>
            </div>
          </div>
          <span class="status-badge active" style="font-size:0.8rem; font-weight:700;">Read Only</span>
        </div>

        <div class="table-responsive">
          <table class="data-table" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
                <th style="text-align:left;">Subject</th>
                <th style="text-align:left;">Exam</th>
                <th style="text-align:center;">Marks</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
            <tfoot>
              <tr style="background:#F8FAFC; border-top:2px solid #CBD5E1; font-weight:800;">
                <td colspan="2" style="text-align:right; color:var(--color-navy-dark);">TOTAL SCORE</td>
                <td style="text-align:center; color:#2563EB; font-size:1.05rem;">${totalObt} / ${totalMax} (${percentage}%)</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // FACULTY & ADMIN HYBRID MANAGEMENT VIEW (LAZY-LOADING & IMMEDIATE RENDER)
  // =========================================================================
  renderHybridManagementView(user) {
    const departments = typeof departmentService !== 'undefined' ? departmentService.getDepartments() : DataStore.get('DEPARTMENTS') || [];
    const classes = typeof classService !== 'undefined' ? classService.getClasses() : DataStore.get('CLASSES') || [];
    const subjects = DataStore.get('SUBJECTS') || [];

    // Distinct Enrollment Years / Batches
    const enrollmentYears = ['2025', '2026', '2024'];

    return `
      <!-- PAGE HEADER -->
      <div class="page-header" style="margin-bottom:1.5rem;">
        <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0; display:flex; align-items:center; gap:0.6rem;">
          <i data-lucide="file-spreadsheet" style="color:var(--color-primary); width:28px; height:28px;"></i> MID-TERM MARKS
        </h1>
        <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">
          Search students and manage mid-term academic marks.
        </p>
      </div>

      <!-- MAIN HYBRID SEARCH CARD (RENDERS IMMEDIATELY) -->
      <div class="card" style="margin-bottom:1.5rem; padding:1.5rem; background:#FFFFFF; border:1px solid var(--color-border); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        
        <!-- OPTION A: QUICK STUDENT SEARCH -->
        <div style="margin-bottom:1.75rem;">
          <h2 style="font-size:1rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.75rem 0; display:flex; align-items:center; gap:0.5rem; text-transform:uppercase; letter-spacing:0.5px;">
            <i data-lucide="search" style="width:18px; height:18px; color:var(--color-primary);"></i> Quick Student Search
          </h2>

          <div style="display:flex; gap:0.75rem; max-width:600px; flex-wrap:wrap;">
            <input 
              type="text" 
              id="mtm-quick-reg-input" 
              class="form-control" 
              placeholder="Enter Registration Number (e.g. 2025CSSIDHANT)" 
              value="${this.searchRegistrationNo}"
              onkeypress="if(event.key==='Enter') MidTermMarksView.executeQuickSearch()"
              style="flex:1; font-weight:600; font-size:0.9rem;"
            >
            <button 
              class="btn-primary" 
              onclick="MidTermMarksView.executeQuickSearch()" 
              style="padding:0.6rem 1.4rem; font-weight:700; display:flex; align-items:center; gap:0.4rem;"
            >
              <i data-lucide="search" style="width:16px; height:16px;"></i> Search
            </button>
          </div>
        </div>

        <!-- SEPARATOR DIVIDER -->
        <div style="display:flex; align-items:center; text-align:center; margin:1.5rem 0; color:var(--color-text-muted); font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:1px;">
          <div style="flex:1; border-bottom:1px solid #E2E8F0;"></div>
          <span style="padding:0 1rem; background:#FFFFFF;">OR</span>
          <div style="flex:1; border-bottom:1px solid #E2E8F0;"></div>
        </div>

        <!-- OPTION B: FIND STUDENTS BY CLASS (CASCADING FILTERS) -->
        <div>
          <h2 style="font-size:1rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.75rem 0; display:flex; align-items:center; gap:0.5rem; text-transform:uppercase; letter-spacing:0.5px;">
            <i data-lucide="users" style="width:18px; height:18px; color:var(--color-secondary);"></i> Find Students By Class
          </h2>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:0.85rem; margin-bottom:1rem;">
            <!-- ENROLLMENT YEAR -->
            <div>
              <label class="form-label" style="font-size:0.78rem; font-weight:700; color:var(--color-navy-dark);">Enrollment Year</label>
              <select id="mtm-filter-year" class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="MidTermMarksView.onFilterYearChange(this.value)">
                <option value="ALL" ${this.selectedYear === 'ALL' ? 'selected' : ''}>All Years</option>
                ${enrollmentYears.map(y => `<option value="${y}" ${this.selectedYear === y ? 'selected' : ''}>${y}</option>`).join('')}
              </select>
            </div>

            <!-- DEPARTMENT -->
            <div>
              <label class="form-label" style="font-size:0.78rem; font-weight:700; color:var(--color-navy-dark);">Department</label>
              <select id="mtm-filter-dept" class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="MidTermMarksView.onFilterDeptChange(this.value)">
                <option value="ALL" ${this.selectedDepartment === 'ALL' ? 'selected' : ''}>All Departments</option>
                ${departments.map(d => `<option value="${d.id}" ${this.selectedDepartment === d.id ? 'selected' : ''}>${d.code || d.name}</option>`).join('')}
              </select>
            </div>

            <!-- SEMESTER -->
            <div>
              <label class="form-label" style="font-size:0.78rem; font-weight:700; color:var(--color-navy-dark);">Semester</label>
              <select id="mtm-filter-sem" class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="MidTermMarksView.onFilterSemChange(this.value)">
                <option value="ALL" ${this.selectedSemester === 'ALL' ? 'selected' : ''}>All Semesters</option>
                <option value="1" ${this.selectedSemester === '1' ? 'selected' : ''}>Semester 1</option>
                <option value="2" ${this.selectedSemester === '2' ? 'selected' : ''}>Semester 2</option>
                <option value="3" ${this.selectedSemester === '3' ? 'selected' : ''}>Semester 3</option>
                <option value="4" ${this.selectedSemester === '4' ? 'selected' : ''}>Semester 4</option>
              </select>
            </div>

            <!-- SECTION -->
            <div>
              <label class="form-label" style="font-size:0.78rem; font-weight:700; color:var(--color-navy-dark);">Section</label>
              <select id="mtm-filter-sec" class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="MidTermMarksView.onFilterSecChange(this.value)">
                <option value="ALL" ${this.selectedSection === 'ALL' ? 'selected' : ''}>All Sections</option>
                <option value="A" ${this.selectedSection === 'A' ? 'selected' : ''}>Section A</option>
                <option value="B" ${this.selectedSection === 'B' ? 'selected' : ''}>Section B</option>
                <option value="C" ${this.selectedSection === 'C' ? 'selected' : ''}>Section C</option>
              </select>
            </div>

            <!-- ASSESSMENT / MID TERM -->
            <div>
              <label class="form-label" style="font-size:0.78rem; font-weight:700; color:var(--color-navy-dark);">Assessment / Mid Term</label>
              <select id="mtm-filter-assessment" class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="MidTermMarksView.onFilterAssessmentChange(this.value)">
                <option value="" ${this.selectedAssessment === '' ? 'selected' : ''}>Select Assessment</option>
                <option value="Mid-Term 1" ${this.selectedAssessment === 'Mid-Term 1' ? 'selected' : ''}>Mid Term 1</option>
                <option value="Mid-Term 2" ${this.selectedAssessment === 'Mid-Term 2' ? 'selected' : ''}>Mid Term 2</option>
                <option value="OBT" ${this.selectedAssessment === 'OBT' ? 'selected' : ''}>OBT</option>
              </select>
            </div>

            <!-- SUBJECT -->
            <div>
              <label class="form-label" style="font-size:0.78rem; font-weight:700; color:var(--color-navy-dark);">Subject</label>
              <select id="mtm-filter-subject" class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="MidTermMarksView.onFilterSubjectChange(this.value)">
                <option value="ALL" ${this.selectedSubject === 'ALL' ? 'selected' : ''}>All Subjects</option>
                ${subjects.map(s => `<option value="${s.id}" ${this.selectedSubject === s.id ? 'selected' : ''}>${s.name} (${s.code})</option>`).join('')}
              </select>
            </div>
          </div>

          <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
            <button class="btn-primary" onclick="MidTermMarksView.executeClassFilter()" style="padding:0.55rem 1.25rem; font-weight:700;">
              <i data-lucide="filter" style="width:16px; height:16px;"></i> Find Students
            </button>

            <button class="btn-secondary" onclick="MidTermMarksView.clearAllFilters()" style="padding:0.55rem 1.25rem; font-weight:700; color:var(--color-danger); border-color:#FECDD3;">
              <i data-lucide="x-circle" style="width:16px; height:16px;"></i> Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- DYNAMIC CONTENT VIEWPORT CONTAINER -->
      <div id="mtm-dynamic-container">
        ${this.renderDynamicContent(user)}
      </div>
    `;
  },

  /**
   * Renders Content based on Active User State (Quick Search, Class List, or Marks View)
   */
  renderDynamicContent(user) {
    // 1. MARKS PANEL VIEW FOR A SELECTED STUDENT
    if (this.selectedStudentForMarks) {
      return this.renderStudentMarksPanel(this.selectedStudentForMarks, user);
    }

    // 2. QUICK REGISTRATION SEARCH RESULT
    if (this.searchPerformed) {
      if (this.searchedStudent) {
        if (this.searchedStudent.isUnauthorized) {
          return AuthorizationService.renderAccessDeniedBanner(this.searchedStudent.message);
        }
        return this.renderQuickSearchResultCard(this.searchedStudent);
      } else {
        return `
          <div class="card" style="padding:2.5rem; text-align:center;">
            <div style="width:48px; height:48px; border-radius:50%; background:#FEE2E2; color:#DC2626; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto;">
              <i data-lucide="user-x" style="width:24px; height:24px;"></i>
            </div>
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.5rem 0;">No Student Found</h3>
            <p style="color:var(--color-text-muted); font-size:0.9rem; max-width:420px; margin:0 auto 1.25rem auto;">
              No student record found with registration number: <strong>${this.searchRegistrationNo}</strong>
            </p>
            <button class="btn-secondary btn-sm" onclick="MidTermMarksView.clearAllFilters()" style="font-weight:700;">
              <i data-lucide="rotate-ccw" style="width:14px; height:14px; display:inline;"></i> Try Again
            </button>
          </div>
        `;
      }
    }

    // 3. BULK ENTRY OR CLASS-WISE FILTER STUDENT TABLE RESULT
    if (this.filterStudentsResult) {
      if (this.selectedSubject !== 'ALL' && this.selectedAssessment) {
        return this.renderBulkMarksTable(this.filterStudentsResult, user);
      }
      return this.renderClassStudentTable(this.filterStudentsResult, user);
    }

    // 4. INITIAL EMPTY GUIDANCE STATE (NO UNNECESSARY PRE-LOADED DATA)
    return `
      <div class="card" style="padding:3.5rem 1.5rem; text-align:center; background:#FAFAFA; border:2px dashed #E2E8F0;">
        <i data-lucide="search" style="width:54px; height:54px; stroke-width:1.5; color:#94A3B8; margin-bottom:1rem;"></i>
        <h3 style="font-size:1.15rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.5rem 0;">Search Student or Select Class Filters</h3>
        <p style="color:var(--color-text-muted); font-size:0.9rem; max-width:480px; margin:0 auto;">
          Enter a Registration Number above for direct student lookup, or choose class parameters and click <strong>Find Students</strong> to manage mid-term academic marks.
        </p>
      </div>
    `;
  },

  /**
   * QUICK REGISTRATION SEARCH CARD RESULT
   */
  renderQuickSearchResultCard(student) {
    return `
      <div class="card" style="padding:1.75rem; border-left:5px solid #10B981; background:linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:1rem;">
          <div style="display:flex; align-items:center; gap:0.5rem; color:#047857; font-weight:800; font-size:0.95rem;">
            <i data-lucide="check-circle-2" style="width:20px; height:20px;"></i> ✓ Student Found
          </div>
          <span class="status-badge active" style="font-weight:700;">Active Record</span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.5rem; background:#FFFFFF; padding:1.25rem; border-radius:10px; border:1px solid #E2E8F0;">
          <div>
            <div style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Student Name</div>
            <div style="font-size:1.1rem; font-weight:800; color:var(--color-navy-dark); margin-top:0.2rem;">${student.name}</div>
          </div>

          <div>
            <div style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Registration No.</div>
            <div style="font-size:1.05rem; font-family:monospace; font-weight:800; color:#2563EB; margin-top:0.2rem;">${student.registrationNumber || student.rollNumber}</div>
          </div>

          <div>
            <div style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Department</div>
            <div style="font-size:0.95rem; font-weight:700; color:#334155; margin-top:0.2rem;">${student.department || 'CSE'}</div>
          </div>

          <div>
            <div style="font-size:0.75rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase;">Semester & Section</div>
            <div style="font-size:0.95rem; font-weight:700; color:#334155; margin-top:0.2rem;">Sem ${student.semester || 2} — Sec ${student.section || 'A'}</div>
          </div>
        </div>

        <div>
          <button 
            class="btn-primary" 
            onclick="MidTermMarksView.viewStudentMarks('${student.id}')"
            style="padding:0.65rem 1.5rem; font-weight:700; display:inline-flex; align-items:center; gap:0.5rem; box-shadow:0 4px 6px -1px rgba(37,99,235,0.25);"
          >
            <i data-lucide="eye" style="width:18px; height:18px;"></i> View Mid-Term Marks
          </button>
        </div>
      </div>
    `;
  },

  /**
   * CLASS-WISE PAGINATED STUDENT TABLE RESULT
   */
  renderClassStudentTable(data, user) {
    const deptObj = (DataStore.get('DEPARTMENTS') || []).find(d => d.id === this.selectedDepartment || d.code === this.selectedDepartment);
    const deptName = deptObj ? deptObj.code : (this.selectedDepartment !== 'ALL' ? this.selectedDepartment : 'CSE');

    return `
      <div class="card" style="padding:0; overflow:hidden; border:1px solid var(--color-border); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="padding:1.25rem; background:#F8FAFC; border-bottom:1px solid #E2E8F0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <h3 style="font-size:1.05rem; font-weight:800; color:var(--color-navy-dark); margin:0;">
            ${deptName} — Semester ${this.selectedSemester !== 'ALL' ? this.selectedSemester : '2'} — Section ${this.selectedSection !== 'ALL' ? this.selectedSection : 'A'}
          </h3>
          <span style="font-size:0.85rem; font-weight:700; color:var(--color-primary);">Found ${data.totalRecords} Student${data.totalRecords !== 1 ? 's' : ''}</span>
        </div>

        ${data.items.length === 0 ? `
          <div style="padding:3rem; text-align:center;">
            <p style="color:var(--color-text-muted); font-size:0.9rem;">No students found matching the selected class criteria.</p>
            <button class="btn-secondary btn-sm" onclick="MidTermMarksView.clearAllFilters()" style="margin-top:0.5rem; font-weight:700;">
              Clear Filters
            </button>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#FFFFFF; border-bottom:2px solid #E2E8F0;">
                  <th style="text-align:left; padding:0.85rem 1.25rem;">Registration No.</th>
                  <th style="text-align:left; padding:0.85rem 1.25rem;">Student Name</th>
                  <th style="text-align:center; padding:0.85rem 1.25rem;">Section</th>
                  <th style="text-align:center; padding:0.85rem 1.25rem;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(s => `
                  <tr style="border-bottom:1px solid #F1F5F9;">
                    <td style="font-weight:800; font-family:monospace; color:#2563EB; padding:0.85rem 1.25rem;">
                      ${s.registrationNumber || s.rollNumber}
                    </td>
                    <td style="font-weight:700; color:var(--color-navy-dark); padding:0.85rem 1.25rem;">
                      ${s.name}
                    </td>
                    <td style="text-align:center; font-weight:700; color:#475569; padding:0.85rem 1.25rem;">
                      ${s.section || 'A'}
                    </td>
                    <td style="text-align:center; padding:0.85rem 1.25rem;">
                      <button 
                        class="btn-secondary btn-sm" 
                        onclick="MidTermMarksView.viewStudentMarks('${s.id}')"
                        style="font-weight:700; padding:0.35rem 0.85rem; color:#2563EB; border-color:#BFDBFE;"
                      >
                        <i data-lucide="eye" style="width:14px; height:14px; display:inline;"></i> View
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- PAGINATION FOOTER -->
          <div style="display:flex; align-items:center; justify-content:space-between; padding:1rem 1.25rem; background:#F8FAFC; border-top:1px solid #E2E8F0; flex-wrap:wrap; gap:1rem;">
            <div style="font-size:0.85rem; color:var(--color-text-muted); font-weight:600;">
              Showing <strong>${data.startIndex}–${data.endIndex}</strong> of <strong>${data.totalRecords}</strong> students
            </div>

            <div style="display:flex; gap:0.3rem;">
              <button 
                class="btn-secondary btn-sm" 
                ${data.currentPage <= 1 ? 'disabled' : ''} 
                onclick="MidTermMarksView.goToPage(${data.currentPage - 1})"
                style="padding:0.3rem 0.6rem; font-size:0.8rem;"
              >
                ← Previous
              </button>

              ${Array(data.totalPages).fill(0).map((_, idx) => {
                const pNum = idx + 1;
                return `
                  <button 
                    class="btn-sm ${pNum === data.currentPage ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="MidTermMarksView.goToPage(${pNum})"
                    style="padding:0.3rem 0.6rem; font-size:0.8rem; font-weight:700;"
                  >
                    ${pNum}
                  </button>
                `;
              }).join('')}

              <button 
                class="btn-secondary btn-sm" 
                ${data.currentPage >= data.totalPages ? 'disabled' : ''} 
                onclick="MidTermMarksView.goToPage(${data.currentPage + 1})"
                style="padding:0.3rem 0.6rem; font-size:0.8rem;"
              >
                Next →
              </button>
            </div>
          </div>
        `}
      </div>
    `;
  },

  /**
   * SELECTED STUDENT MID-TERM MARKS MANAGEMENT PANEL
   */
  renderStudentMarksPanel(student, user) {
    let marks = this.selectedStudentMarksList || [];
    if (this.selectedAssessment) {
      marks = marks.filter(m => m.examName === this.selectedAssessment);
    }
    const isAdmin = user.role === 'ADMIN';

    return `
      <div class="card" style="padding:0; overflow:hidden; border:1px solid var(--color-border); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); animation:fadeIn 0.2s ease-out;">
        
        <!-- HEADER DETAILS BAR -->
        <div style="padding:1.5rem; background:linear-gradient(135deg, #1E293B 0%, #0F172A 100%); color:white; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <div style="font-size:0.75rem; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.5px;">STUDENT DETAILS</div>
            <h2 style="font-size:1.35rem; font-weight:800; margin:0.2rem 0 0.4rem 0;">${student.name}</h2>
            <div style="font-size:0.85rem; color:#CBD5E1; display:flex; flex-wrap:wrap; gap:1rem;">
              <span>Registration No.: <strong style="color:#60A5FA;">${student.registrationNumber || student.rollNumber}</strong></span>
              <span>Department: <strong>${student.department || 'CSE'}</strong></span>
              <span>Semester: <strong>${student.semester || 2}</strong></span>
              <span>Section: <strong>${student.section || 'A'}</strong></span>
            </div>
          </div>

          <div style="display:flex; gap:0.5rem;">
            <button class="btn-secondary btn-sm" onclick="MidTermMarksView.backToSearch()" style="background:rgba(255,255,255,0.1); color:white; border-color:rgba(255,255,255,0.2); font-weight:700;">
              ← Back
            </button>
            <button class="btn-primary btn-sm" onclick="MidTermMarksView.openAddMarksModal()" style="font-weight:700; box-shadow:0 4px 6px -1px rgba(37,99,235,0.4);">
              <i data-lucide="plus-circle" style="width:16px; height:16px; display:inline;"></i> + Add Marks
            </button>
          </div>
        </div>

        <!-- MARKS TABLE SECTION -->
        <div style="padding:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="font-size:1.1rem; font-weight:800; color:var(--color-navy-dark); margin:0;">
              MID-TERM MARKS ${this.selectedAssessment ? `<span style="color:var(--color-primary);">— Assessment: ${this.selectedAssessment}</span>` : ''}
            </h3>
            <span style="font-size:0.8rem; color:var(--color-text-muted); font-weight:600;">Total Evaluated: ${marks.length} Subjects</span>
          </div>

          ${this.isLoadingMarks ? `
            <div style="padding:3rem; text-align:center;">
              <div class="spinner" style="margin:0 auto 1rem auto; width:32px; height:32px; border:3px solid #E2E8F0; border-top-color:#2563EB; border-radius:50%; animation:spin 1s linear infinite;"></div>
              <p style="color:var(--color-text-muted); font-size:0.85rem;">Loading student's mid-term marks...</p>
            </div>
          ` : marks.length === 0 ? `
            <div style="padding:3rem; text-align:center; background:#F8FAFC; border-radius:8px; border:1px dashed #CBD5E1;">
              <p style="color:var(--color-text-muted); font-size:0.9rem; margin-bottom:1rem;">No ${this.selectedAssessment || 'mid-term'} mark records currently exist for this student.</p>
              <button class="btn-primary btn-sm" onclick="MidTermMarksView.openAddMarksModal()" style="font-weight:700;">
                + Add First Mark Record
              </button>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table" style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
                    <th style="text-align:left; padding:0.85rem 1rem;">Subject</th>
                    <th style="text-align:left; padding:0.85rem 1rem;">Exam</th>
                    <th style="text-align:center; padding:0.85rem 1rem;">Marks</th>
                    <th style="text-align:center; padding:0.85rem 1rem;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${marks.map(m => {
                    const isFacultyAuthorized = midTermMarksService.isFacultyAuthorized(user, m.subjectId, student.classId);
                    return `
                      <tr style="border-bottom:1px solid #F1F5F9;">
                        <td style="font-weight:700; color:var(--color-navy-dark); padding:0.85rem 1rem;">
                          ${m.subjectName}
                          <div style="font-size:0.75rem; color:var(--color-text-muted); font-weight:500;">Code: ${m.subjectCode}</div>
                        </td>
                        <td style="font-weight:600; color:#334155; padding:0.85rem 1rem;">
                          ${m.examName || 'Mid-Term 1'}
                        </td>
                        <td style="text-align:center; padding:0.85rem 1rem;">
                          <span style="font-size:0.95rem; font-weight:800; color:#2563EB; background:#EFF6FF; padding:0.3rem 0.75rem; border-radius:6px; border:1px solid #BFDBFE;">
                            ${m.obtainedMarks} / ${m.maxMarks}
                          </span>
                        </td>
                        <td style="text-align:center; padding:0.85rem 1rem; white-space:nowrap;">
                          ${(isAdmin || isFacultyAuthorized) ? `
                            <button 
                              class="btn-icon" 
                              title="Edit Marks" 
                              aria-label="Edit Marks" 
                              onclick="MidTermMarksView.openEditMarksModal('${m.id}')"
                              style="color:#2563EB; margin-right:4px;"
                            >
                              <i data-lucide="edit-2" style="width:16px; height:16px;"></i>
                            </button>

                            <button 
                              class="btn-icon" 
                              title="Remove Record" 
                              aria-label="Remove Record" 
                              onclick="MidTermMarksView.confirmDeleteMarksModal('${m.id}')"
                              style="color:var(--color-danger); margin-right:4px;"
                            >
                              <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
                            </button>

                            ${(m.auditHistory && m.auditHistory.length > 0) ? `
                              <button 
                                class="btn-icon" 
                                title="Inspect Audit Log (${m.auditHistory.length} revisions)" 
                                aria-label="Audit Log" 
                                onclick="MidTermMarksView.openAuditHistoryModal('${m.id}')"
                                style="color:#8B5CF6;"
                              >
                                <i data-lucide="history" style="width:16px; height:16px;"></i>
                              </button>
                            ` : ''}
                          ` : `
                            <span style="font-size:0.75rem; color:#94A3B8;">Unauthorized</span>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  },

  // =========================================================================
  // ACTIONS & HANDLERS (SEARCH, CASCADING FILTERS, CLEAR, MODALS)
  // =========================================================================
  executeQuickSearch() {
    const input = document.getElementById('mtm-quick-reg-input');
    const val = input ? input.value : this.searchRegistrationNo;
    if (!val || !val.trim()) {
      UIService.showToast("Please enter a student Registration Number.", "warning");
      return;
    }

    this.searchRegistrationNo = val.trim();
    this.searchPerformed = true;
    this.selectedStudentForMarks = null;
    this.filterStudentsResult = null;

    // Fast direct lookup with active user authorization
    const user = authService.getCurrentUser();
    this.searchedStudent = midTermMarksService.findStudentByRegistration(this.searchRegistrationNo, user);
    this.renderDynamicViewport();
  },

  onFilterYearChange(val) {
    this.selectedYear = val;
  },

  onFilterDeptChange(val) {
    this.selectedDepartment = val;
  },

  onFilterSemChange(val) {
    this.selectedSemester = val;
  },

  onFilterSecChange(val) {
    this.selectedSection = val;
  },

  onFilterAssessmentChange(val) {
    this.selectedAssessment = val;
    if (this.selectedStudentForMarks) {
      this.renderDynamicViewport();
    }
  },

  onFilterSubjectChange(val) {
    this.selectedSubject = val;
  },

  executeClassFilter(page = 1) {
    this.searchPerformed = false;
    this.searchedStudent = null;
    this.selectedStudentForMarks = null;

    // Query paginated class students with active user authorization
    const user = authService.getCurrentUser();
    this.filterStudentsResult = midTermMarksService.filterStudentsByClass({
      enrollmentYear: this.selectedYear,
      department: this.selectedDepartment,
      semester: this.selectedSemester,
      section: this.selectedSection,
      page: page,
      pageSize: 20
    }, user);

    this.renderDynamicViewport();
  },

  goToPage(pageNum) {
    this.executeClassFilter(pageNum);
  },

  clearAllFilters() {
    this.searchRegistrationNo = '';
    this.searchedStudent = null;
    this.searchPerformed = false;
    this.selectedYear = 'ALL';
    this.selectedDepartment = 'ALL';
    this.selectedSemester = 'ALL';
    this.selectedSection = 'ALL';
    this.selectedAssessment = '';
    this.selectedSubject = 'ALL';
    this.filterStudentsResult = null;
    this.selectedStudentForMarks = null;
    this.selectedStudentMarksList = [];
    App.renderCurrentView();
  },

  viewStudentMarks(studentId) {
    const students = DataStore.get('STUDENTS') || [];
    const student = students.find(s => s.id === studentId || s.registrationNumber === studentId);
    if (!student) {
      UIService.showToast("Student information not found.", "danger");
      return;
    }

    this.selectedStudentForMarks = student;
    this.isLoadingMarks = true;
    this.renderDynamicViewport();

    // Fetch marks specifically for this student
    setTimeout(() => {
      this.selectedStudentMarksList = midTermMarksService.getMarksForStudent(student.id);
      this.isLoadingMarks = false;
      this.renderDynamicViewport();
    }, 100);
  },

  backToSearch() {
    this.selectedStudentForMarks = null;
    this.selectedStudentMarksList = [];
    this.renderDynamicViewport();
  },

  renderDynamicViewport() {
    const container = document.getElementById('mtm-dynamic-container');
    if (container) {
      const user = authService.getCurrentUser();
      container.innerHTML = this.renderDynamicContent(user);
      if (window.lucide) window.lucide.createIcons();
    } else {
      App.renderCurrentView();
    }
  },

  /**
   * BULK MARKS ENTRY TABLE
   */
  renderBulkMarksTable(data, user) {
    const subjects = DataStore.get('SUBJECTS') || [];
    const subject = subjects.find(s => s.id === this.selectedSubject) || { name: this.selectedSubject, code: 'N/A' };
    const deptObj = (DataStore.get('DEPARTMENTS') || []).find(d => d.id === this.selectedDepartment || d.code === this.selectedDepartment);
    const deptName = deptObj ? deptObj.code : (this.selectedDepartment !== 'ALL' ? this.selectedDepartment : 'CSE');

    return `
      <div class="card" style="padding:0; overflow:hidden; border:1px solid var(--color-border); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="padding:1.5rem; background:linear-gradient(135deg, #1E293B 0%, #0F172A 100%); color:white; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <div style="font-size:0.75rem; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.5px;">BULK MARKS ENTRY</div>
            <h2 style="font-size:1.35rem; font-weight:800; margin:0.2rem 0 0.4rem 0;">${subject.name} (${subject.code})</h2>
            <div style="font-size:0.85rem; color:#CBD5E1; display:flex; flex-wrap:wrap; gap:1rem;">
              <span>Assessment: <strong style="color:#60A5FA;">${this.selectedAssessment}</strong></span>
              <span>Class: <strong>${deptName} — Sem ${this.selectedSemester !== 'ALL' ? this.selectedSemester : '2'} (${this.selectedSection !== 'ALL' ? this.selectedSection : 'A'})</strong></span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.1); padding:0.5rem 1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.2);">
            <label style="font-size:0.85rem; font-weight:700;">Max Marks:</label>
            <input type="number" id="bulk-mtm-max" value="20" min="1" style="width:60px; padding:0.2rem 0.5rem; border-radius:4px; border:1px solid #CBD5E1; color:#0F172A; font-weight:700; text-align:center;">
          </div>
        </div>

        ${data.items.length === 0 ? `
          <div style="padding:3rem; text-align:center;">
            <p style="color:var(--color-text-muted); font-size:0.9rem;">No students found matching the selected class criteria.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
                  <th style="text-align:left; padding:0.85rem 1.25rem;">Registration No.</th>
                  <th style="text-align:left; padding:0.85rem 1.25rem;">Student Name</th>
                  <th style="text-align:center; padding:0.85rem 1.25rem; width:150px;">Obtained Marks</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(s => {
                  const studentMarks = midTermMarksService.getMarksForStudent(s.id);
                  const existingMark = studentMarks.find(m => m.subjectId === this.selectedSubject && m.examName === this.selectedAssessment);
                  const val = existingMark ? existingMark.obtainedMarks : '';
                  return `
                    <tr style="border-bottom:1px solid #F1F5F9;">
                      <td style="font-weight:800; font-family:monospace; color:#2563EB; padding:0.85rem 1.25rem;">
                        ${s.registrationNumber || s.rollNumber}
                      </td>
                      <td style="font-weight:700; color:var(--color-navy-dark); padding:0.85rem 1.25rem;">
                        ${s.name}
                      </td>
                      <td style="text-align:center; padding:0.85rem 1.25rem;">
                        <input type="number" class="form-control bulk-mark-input" data-student-id="${s.id}" value="${val}" min="0" placeholder="-" style="text-align:center; font-weight:800; color:#2563EB;">
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div style="padding:1.25rem; background:#F8FAFC; border-top:1px solid #E2E8F0; text-align:right;">
            <button class="btn-primary" onclick="MidTermMarksView.saveBulkMarks()" style="padding:0.65rem 1.5rem; font-weight:800; box-shadow:0 4px 6px -1px rgba(37,99,235,0.4);">
              <i data-lucide="save" style="width:18px; height:18px; display:inline; margin-right:0.3rem;"></i> SAVE ALL MARKS
            </button>
          </div>
        `}
      </div>
    `;
  },

  /**
   * SAVE BULK MARKS (Iterates inputs, validates, uses existing service layer)
   */
  saveBulkMarks() {
    const maxMarksVal = document.getElementById('bulk-mtm-max').value;
    const maxMarks = parseInt(maxMarksVal, 10);
    if (isNaN(maxMarks) || maxMarks <= 0) {
      UIService.showToast("Invalid Maximum Marks.", "danger");
      return;
    }

    const inputs = document.querySelectorAll('.bulk-mark-input');
    const user = authService.getCurrentUser();
    let successCount = 0;
    let errorCount = 0;

    try {
      inputs.forEach(input => {
        const val = input.value.trim();
        if (val === '') return; // Skip empty inputs
        const obtainedMarks = parseInt(val, 10);
        const studentId = input.getAttribute('data-student-id');

        if (isNaN(obtainedMarks) || obtainedMarks < 0 || obtainedMarks > maxMarks) {
          errorCount++;
          input.style.borderColor = 'red';
          return;
        }

        input.style.borderColor = ''; // Reset

        const student = (DataStore.get('STUDENTS') || []).find(s => s.id === studentId);
        if (!student) return;

        midTermMarksService.addMarkRecord({
          studentId: student.id,
          subjectId: this.selectedSubject,
          examName: this.selectedAssessment,
          maxMarks: maxMarks,
          obtainedMarks: obtainedMarks,
          semester: student.semester || this.selectedSemester || 2,
          academicSession: student.academicSession || '2026-27'
        }, user);

        successCount++;
      });

      if (errorCount > 0) {
        UIService.showToast(`${errorCount} marks were invalid and skipped. Max marks is ${maxMarks}.`, "warning");
      }
      if (successCount > 0) {
        UIService.showToast(`${this.selectedAssessment} marks saved successfully for ${successCount} students.`, "success");
      }
      
      this.renderDynamicViewport();
    } catch (err) {
      UIService.showToast(err.message, "danger");
    }
  },

  // =========================================================================
  // MODALS (ADD, EDIT, DELETE & AUDIT TRAIL)
  // =========================================================================

  /**
   * OPEN ADD MARKS MODAL
   */
  openAddMarksModal() {
    if (!this.selectedStudentForMarks) return;
    const student = this.selectedStudentForMarks;
    const subjects = DataStore.get('SUBJECTS') || [];

    const modalHtml = `
      <form id="add-mtm-form" onsubmit="return false;">
        <div style="background:#F8FAFC; padding:0.85rem; border-radius:8px; border:1px solid #E2E8F0; margin-bottom:1rem; font-size:0.85rem;">
          <div><strong>Student:</strong> ${student.name} (${student.registrationNumber || student.rollNumber})</div>
          <div><strong>Class:</strong> ${student.department || 'CSE'} — Semester ${student.semester || 2} (${student.section || 'A'})</div>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label" style="font-weight:700;">Subject <span style="color:red;">*</span></label>
          <select id="add-mtm-subject" class="form-control" required>
            ${subjects.map(s => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
          </select>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label class="form-label" style="font-weight:700;">Exam <span style="color:red;">*</span></label>
            <select id="add-mtm-exam" class="form-control" required>
              <option value="Mid-Term 1" ${this.selectedAssessment === 'Mid-Term 1' ? 'selected' : ''}>Mid-Term 1</option>
              <option value="Mid-Term 2" ${this.selectedAssessment === 'Mid-Term 2' ? 'selected' : ''}>Mid-Term 2</option>
              <option value="OBT" ${this.selectedAssessment === 'OBT' ? 'selected' : ''}>OBT</option>
            </select>
          </div>

          <div>
            <label class="form-label" style="font-weight:700;">Academic Session</label>
            <input type="text" id="add-mtm-session" class="form-control" value="${student.academicSession || '2026-27'}" readonly style="background:#F1F5F9;">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label class="form-label" style="font-weight:700;">Maximum Marks <span style="color:red;">*</span></label>
            <input type="number" id="add-mtm-max" class="form-control" value="20" min="1" required>
          </div>

          <div>
            <label class="form-label" style="font-weight:700;">Obtained Marks <span style="color:red;">*</span></label>
            <input type="number" id="add-mtm-obt" class="form-control" value="18" min="0" required placeholder="0 to Max">
          </div>
        </div>
      </form>
    `;

    UIService.openModal(
      "ADD MID-TERM MARKS",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Save Marks',
          className: 'btn-primary',
          onClick: () => {
            const subjectId = document.getElementById('add-mtm-subject').value;
            const examName = document.getElementById('add-mtm-exam').value;
            const maxMarks = document.getElementById('add-mtm-max').value;
            const obtainedMarks = document.getElementById('add-mtm-obt').value;
            const academicSession = document.getElementById('add-mtm-session').value;

            try {
              const user = authService.getCurrentUser();
              midTermMarksService.addMarkRecord({
                studentId: student.id,
                subjectId,
                examName,
                maxMarks,
                obtainedMarks,
                semester: student.semester || 2,
                academicSession
              }, user);

              UIService.showToast("Mid-Term marks added successfully.", "success");
              UIService.closeModal();

              // Refresh marks list locally
              this.selectedStudentMarksList = midTermMarksService.getMarksForStudent(student.id);
              this.renderDynamicViewport();
            } catch (err) {
              UIService.showToast(err.message, "danger");
            }
          }
        }
      ]
    );
  },

  /**
   * OPEN EDIT MARKS MODAL
   */
  openEditMarksModal(markId) {
    const mark = (this.selectedStudentMarksList || []).find(m => m.id === markId);
    if (!mark) return;
    const student = this.selectedStudentForMarks;

    const modalHtml = `
      <form id="edit-mtm-form" onsubmit="return false;">
        <div style="background:#F8FAFC; padding:0.85rem; border-radius:8px; border:1px solid #E2E8F0; margin-bottom:1rem; font-size:0.85rem;">
          <div><strong>Student:</strong> ${student.name} (${student.registrationNumber || student.rollNumber})</div>
          <div><strong>Subject:</strong> ${mark.subjectName} (${mark.subjectCode})</div>
          <div><strong>Exam:</strong> ${mark.examName || 'Mid-Term 1'}</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label class="form-label" style="font-weight:700;">Maximum Marks</label>
            <input type="number" class="form-control" value="${mark.maxMarks}" readonly style="background:#F1F5F9;">
          </div>

          <div>
            <label class="form-label" style="font-weight:700;">Obtained Marks <span style="color:red;">*</span></label>
            <input type="number" id="edit-mtm-obt" class="form-control" value="${mark.obtainedMarks}" min="0" max="${mark.maxMarks}" required>
          </div>
        </div>
      </form>
    `;

    UIService.openModal(
      "EDIT MID-TERM MARKS",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Save Changes',
          className: 'btn-primary',
          onClick: () => {
            const newObt = document.getElementById('edit-mtm-obt').value;

            try {
              const user = authService.getCurrentUser();
              midTermMarksService.updateMarkRecord(markId, newObt, user);

              UIService.showToast("Mid-Term marks updated successfully.", "success");
              UIService.closeModal();

              // Refresh marks list locally
              this.selectedStudentMarksList = midTermMarksService.getMarksForStudent(student.id);
              this.renderDynamicViewport();
            } catch (err) {
              UIService.showToast(err.message, "danger");
            }
          }
        }
      ]
    );
  },

  /**
   * DELETE CONFIRMATION MODAL
   */
  confirmDeleteMarksModal(markId) {
    const mark = (this.selectedStudentMarksList || []).find(m => m.id === markId);
    if (!mark) return;
    const student = this.selectedStudentForMarks;

    const dialogHtml = `
      <div style="padding:0.5rem 0; text-align:center;">
        <div style="width:54px; height:54px; border-radius:50%; background:#FEE2E2; color:#DC2626; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto;">
          <i data-lucide="trash-2" style="width:26px; height:26px;"></i>
        </div>
        <h3 style="font-size:1.15rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.5rem 0;">Remove Mid-Term Mark Record?</h3>
        <p style="font-size:0.9rem; color:var(--color-text-muted); margin:0 0 1rem 0;">
          Are you sure you want to remove the mark record for <strong>${mark.subjectName} (${mark.examName})</strong>?
        </p>

        <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:0.75rem; border-radius:8px; font-size:0.88rem; display:inline-block; text-align:left;">
          <div><strong>Student:</strong> ${student.name}</div>
          <div><strong>Score:</strong> ${mark.obtainedMarks} / ${mark.maxMarks}</div>
        </div>
      </div>
    `;

    UIService.openModal(
      "Confirm Mark Record Removal",
      dialogHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Confirm Removal',
          className: 'btn-primary',
          style: 'background:#EF4444; border-color:#EF4444;',
          onClick: () => {
            try {
              const user = authService.getCurrentUser();
              midTermMarksService.deleteMarkRecord(markId, user);

              UIService.showToast("Mid-Term mark record removed successfully.", "info");
              UIService.closeModal();

              // Refresh marks list locally
              this.selectedStudentMarksList = midTermMarksService.getMarksForStudent(student.id);
              this.renderDynamicViewport();
            } catch (err) {
              UIService.showToast(err.message, "danger");
            }
          }
        }
      ]
    );
  },

  /**
   * AUDIT REVISION HISTORY MODAL (ADMIN / FACULTY INSPECTION)
   */
  openAuditHistoryModal(markId) {
    const history = midTermMarksService.getAuditHistory(markId);
    const mark = (this.selectedStudentMarksList || []).find(m => m.id === markId);

    if (history.length === 0) {
      UIService.showToast("No revision history for this mark record.", "info");
      return;
    }

    const rows = history.map((h, i) => `
      <tr style="border-bottom:1px solid #F1F5F9;">
        <td style="font-weight:700; color:var(--color-navy-dark); font-size:0.82rem;">#${i + 1}</td>
        <td style="font-weight:700; color:var(--color-danger); font-size:0.85rem;">${h.oldMarks}</td>
        <td style="font-weight:700; color:#10B981; font-size:0.85rem;">${h.newMarks}</td>
        <td style="font-weight:600; color:#334155; font-size:0.82rem;">${h.changedBy}</td>
        <td style="font-size:0.78rem; color:var(--color-text-muted);">${h.changedAt}</td>
      </tr>
    `).join('');

    const modalHtml = `
      <div style="padding:0.5rem 0;">
        <div style="margin-bottom:1rem; font-size:0.85rem; color:var(--color-text-muted);">
          Subject: <strong>${mark ? mark.subjectName : ''}</strong> | Exam: <strong>${mark ? mark.examName : ''}</strong>
        </div>

        <div class="table-responsive">
          <table class="data-table" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
                <th>Rev</th>
                <th>Old Marks</th>
                <th>New Marks</th>
                <th>Changed By</th>
                <th>Changed At</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;

    UIService.openModal(
      "CORRECTION AUDIT HISTORY",
      modalHtml,
      [
        { text: 'Close', className: 'btn-secondary', onClick: () => UIService.closeModal() }
      ]
    );
  }
};

window.MidTermMarksView = MidTermMarksView;

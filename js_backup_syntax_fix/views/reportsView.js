/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAMS) - REPORTS & ANALYTICS VIEW
   Filter-first, generate-on-demand. No data loaded on render().
   Shared Admin + Faculty interface with RBAC enforced via ReportService.
   ========================================================================== */

const ReportsView = {
  state: {
    mode: 'idle',
    reportData: null,
    studentReportData: null,
    page: 1,
    pageSize: 20,
    reportType: 'attendance',
    chartInstance: null,
    distChartInstance: null,
    filters: {}
  },

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div class="card" style="padding:2rem">Please log in.</div>`;
    const isFaculty = AuthorizationService.isAcademicStaff(user);

    return `
      <div class="page-header" style="margin-bottom:1.5rem;">
        <div>
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">
            Reports &amp; Analytics
          </h1>
          <p style="color:var(--color-text-muted); font-size:0.875rem; margin:0;">
            Generate attendance reports by section, subject, or student.
            ${isFaculty ? '<span style="background:#EFF6FF;color:#1D4ED8;padding:2px 8px;border-radius:4px;font-size:0.78rem;font-weight:700;margin-left:6px;">Scope: Assigned Data Only</span>' : ''}
          </p>
        </div>
      </div>

      <!-- ═══ FILTER PANEL ═══ -->
      <div class="card" style="margin-bottom:1.5rem; padding:1.5rem;">

        <!-- QUICK STUDENT SEARCH -->
        <div style="margin-bottom:1.25rem;">
          <h3 style="font-size:0.78rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 0.5rem 0;">
            Quick Student Search
          </h3>
          <div style="display:flex;gap:0.6rem;align-items:center;flex-wrap:wrap;">
            <input id="rpt-reg-search" type="text" class="form-input"
              placeholder="Enter Registration Number (e.g. 2025CSSIDHANT)"
              style="flex:1;min-width:220px;"
              onkeydown="if(event.key==='Enter') ReportsView.searchStudent()" />
            <button class="btn-primary" onclick="ReportsView.searchStudent()" style="white-space:nowrap;">
              <i data-lucide="search" style="width:15px;height:15px;display:inline;"></i> Search
            </button>
          </div>
        </div>

        <!-- DIVIDER -->
        <div style="display:flex;align-items:center;gap:0.75rem;margin:1.1rem 0;">
          <div style="flex:1;height:1px;background:#E2E8F0;"></div>
          <span style="font-size:0.75rem;color:#94A3B8;font-weight:600;">OR FILTER BY CLASS / SUBJECT</span>
          <div style="flex:1;height:1px;background:#E2E8F0;"></div>
        </div>

        <!-- DROPDOWNS -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:0.75rem 1rem;margin-bottom:1rem;">

          <div>
            <label style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:0.3rem;">Report Type</label>
            <select id="rpt-type" class="form-input" onchange="ReportsView.onReportTypeChange(this.value)">
              <option value="attendance">Attendance Report</option>
              <option value="low-attendance">Low Attendance Report</option>
            </select>
          </div>

          <div id="rpt-threshold-wrap" style="display:none;">
            <label style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:0.3rem;">Threshold (%)</label>
            <input id="rpt-threshold" type="number" class="form-input" value="75" min="1" max="100" />
          </div>

          <div>
            <label style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:0.3rem;">Academic Year</label>
            <select id="rpt-year" class="form-input" onchange="ReportsView.onFilterChange('year')">
              <option value="">— Select Year —</option>
              ${this._getYearOptions(user)}
            </select>
          </div>

          <div>
            <label style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:0.3rem;">Department ${isFaculty ? '🔒' : ''}</label>
            <select id="rpt-dept" class="form-input" onchange="ReportsView.onFilterChange('dept')"
              ${isFaculty ? 'style="pointer-events:none;opacity:0.8;" disabled' : ''}>
              <option value="">— Select Department —</option>
              ${this._getDeptOptions(user)}
            </select>
          </div>

          <div>
            <label style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:0.3rem;">Semester ${isFaculty ? '🔒' : ''}</label>
            <select id="rpt-semester" class="form-input" onchange="ReportsView.onFilterChange('semester')"
              ${isFaculty ? 'style="pointer-events:none;opacity:0.8;" disabled' : ''}>
              <option value="">— Select Semester —</option>
            </select>
          </div>

          <div>
            <label style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:0.3rem;">Section ${isFaculty ? '🔒' : ''}</label>
            <select id="rpt-section" class="form-input" onchange="ReportsView.onFilterChange('section')"
              ${isFaculty ? 'style="pointer-events:none;opacity:0.8;" disabled' : ''}>
              <option value="">— Select Section —</option>
            </select>
          </div>

          <div>
            <label style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:0.3rem;">Subject</label>
            <select id="rpt-subject" class="form-input">
              <option value="">All Subjects</option>
            </select>
          </div>
        </div>

        <!-- DATE RANGE -->
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:flex-end;margin-bottom:1rem;">
          <div>
            <label style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:0.3rem;">Date From</label>
            <input id="rpt-date-from" type="date" class="form-input" style="min-width:150px;" />
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:0.3rem;">Date To</label>
            <input id="rpt-date-to" type="date" class="form-input" style="min-width:150px;" />
          </div>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;padding-bottom:1px;">
            <button class="btn-secondary" style="font-size:0.75rem;padding:0.4rem 0.7rem;" onclick="ReportsView.setQuickDate('week')">This Week</button>
            <button class="btn-secondary" style="font-size:0.75rem;padding:0.4rem 0.7rem;" onclick="ReportsView.setQuickDate('month')">This Month</button>
            <button class="btn-secondary" style="font-size:0.75rem;padding:0.4rem 0.7rem;" onclick="ReportsView.setQuickDate('clear')">Clear Dates</button>
          </div>
        </div>

        <!-- ACTIONS -->
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;">
          <button class="btn-primary" onclick="ReportsView.generateReport()" style="font-weight:700;">
            <i data-lucide="bar-chart-2" style="width:16px;height:16px;display:inline;"></i>
            Generate Report
          </button>
          <button class="btn-secondary" onclick="ReportsView.clearFilters()" style="font-weight:600;">
            <i data-lucide="x-circle" style="width:16px;height:16px;display:inline;"></i>
            Clear Filters
          </button>
        </div>
      </div>

      <!-- ═══ RESULTS AREA ═══ -->
      <div id="rpt-results-area">${this._renderResultsArea()}</div>
    `;
  },

  _getYearOptions(user) {
    return ReportService.getAcademicYears(user).map(y => `<option value="${y}">${y}</option>`).join('');
  },

  _getDeptOptions(user) {
    return ReportService.getDepartments(user).map(d =>
      `<option value="${d.name}">${d.code} — ${d.name}</option>`
    ).join('');
  },

  /* ── CASCADING FILTER HANDLERS ── */

  postInit() {
    const user = authService.getCurrentUser();
    if (!user) return;
    if (AuthorizationService.isAcademicStaff(user)) {
      const depts = ReportService.getDepartments(user);
      if (depts.length >= 1) {
        const deptEl = document.getElementById('rpt-dept');
        if (deptEl) { deptEl.value = depts[0].name; this.onFilterChange('dept'); }
      }
    }
    if (window.lucide) window.lucide.createIcons();
  },

  onFilterChange(level) {
    const user = authService.getCurrentUser();
    if (!user) return;
    const deptEl = document.getElementById('rpt-dept');
    const semEl  = document.getElementById('rpt-semester');
    const secEl  = document.getElementById('rpt-section');
    const subEl  = document.getElementById('rpt-subject');

    if (level === 'year' || level === 'dept') {
      this._resetSelect(semEl, '— Select Semester —');
      this._resetSelect(secEl, '— Select Section —');
      this._resetSelect(subEl, 'All Subjects');
      const dept = deptEl ? deptEl.value : '';
      if (dept) {
        const sems = ReportService.getSemesters(user, dept);
        sems.forEach(s => { const o = document.createElement('option'); o.value = s; o.textContent = `Semester ${s}`; semEl.appendChild(o); });
        if (AuthorizationService.isAcademicStaff(user) && sems.length === 1) { semEl.value = sems[0]; this.onFilterChange('semester'); }
      }
    }

    if (level === 'semester') {
      this._resetSelect(secEl, '— Select Section —');
      this._resetSelect(subEl, 'All Subjects');
      const dept = deptEl ? deptEl.value : '';
      const sem  = semEl  ? semEl.value  : '';
      if (dept && sem) {
        const sections = ReportService.getSections(user, dept, sem);
        sections.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.textContent = `Section ${s.section} (${s.name})`; secEl.appendChild(o); });
        if (AuthorizationService.isAcademicStaff(user) && sections.length === 1) { secEl.value = sections[0].id; this.onFilterChange('section'); }
      }
    }

    if (level === 'section') {
      this._resetSelect(subEl, 'All Subjects');
      const classId = secEl ? secEl.value : '';
      if (classId) {
        const subs = ReportService.getSubjectsForClass(user, classId);
        subs.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.textContent = `${s.code} — ${s.name}`; subEl.appendChild(o); });
        if (AuthorizationService.isAcademicStaff(user) && subs.length === 1) subEl.value = subs[0].id;
      }
    }
  },

  _resetSelect(el, placeholder) {
    if (!el) return;
    el.innerHTML = '';
    const o = document.createElement('option'); o.value = ''; o.textContent = placeholder; el.appendChild(o);
  },

  onReportTypeChange(val) {
    this.state.reportType = val;
    const wrap = document.getElementById('rpt-threshold-wrap');
    if (wrap) wrap.style.display = val === 'low-attendance' ? 'block' : 'none';
  },

  setQuickDate(range) {
    const fromEl = document.getElementById('rpt-date-from');
    const toEl   = document.getElementById('rpt-date-to');
    if (!fromEl || !toEl) return;
    const now = new Date();
    const toStr = now.toISOString().split('T')[0];
    if (range === 'clear') { fromEl.value = ''; toEl.value = ''; return; }
    if (range === 'week')  { const d = new Date(now); d.setDate(now.getDate() - 7); fromEl.value = d.toISOString().split('T')[0]; toEl.value = toStr; }
    if (range === 'month') { const d = new Date(now.getFullYear(), now.getMonth(), 1); fromEl.value = d.toISOString().split('T')[0]; toEl.value = toStr; }
  },

  /* ── STUDENT SEARCH ── */

  searchStudent() {
    const user = authService.getCurrentUser();
    const regNo = (document.getElementById('rpt-reg-search') || {}).value || '';
    if (!regNo.trim()) { UIService.showToast('Please enter a Registration Number.', 'warning'); return; }

    const found = ReportService.searchStudentByRegNo(regNo, user);
    if (found.error) {
      this.state.mode = 'error'; this.state.reportData = { error: found.error }; this.state.studentReportData = null;
      this._refreshResultsArea(); return;
    }

    const report = ReportService.generateStudentReport(found.student.id, user);
    this.state.mode = 'student-results'; this.state.studentReportData = report; this.state.reportData = null;
    this._refreshResultsArea();
  },

  /* ── GENERATE REPORT ── */

  generateReport() {
    const user = authService.getCurrentUser();
    const filters = this._collectFilters();
    if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
      UIService.showToast('Date From cannot be after Date To.', 'error'); return;
    }
    this.state.mode = 'loading'; this.state.reportData = null; this.state.page = 1;
    this._refreshResultsArea();

    setTimeout(() => {
      let result;
      if (this.state.reportType === 'low-attendance') {
        const thr = (document.getElementById('rpt-threshold') || {}).value || 75;
        result = ReportService.generateLowAttendanceReport(filters, thr, user);
      } else {
        result = ReportService.generateAttendanceReport(filters, user);
      }
      if (result.error) {
        this.state.mode = 'error'; this.state.reportData = { error: result.error };
      } else {
        this.state.mode = 'results'; this.state.reportData = result; this.state.filters = filters;
      }
      this._refreshResultsArea();
      this._initCharts();
      if (window.lucide) window.lucide.createIcons();
    }, 80);
  },

  _collectFilters() {
    const v = id => (document.getElementById(id) || {}).value || '';
    return { academicYear: v('rpt-year'), department: v('rpt-dept'), classId: v('rpt-section'), subjectId: v('rpt-subject'), dateFrom: v('rpt-date-from'), dateTo: v('rpt-date-to') };
  },

  clearFilters() {
    this.state.mode = 'idle'; this.state.reportData = null; this.state.studentReportData = null; this.state.page = 1;
    if (this.state.chartInstance) { try { this.state.chartInstance.destroy(); } catch(e){} this.state.chartInstance = null; }
    if (this.state.distChartInstance) { try { this.state.distChartInstance.destroy(); } catch(e){} this.state.distChartInstance = null; }
    ['rpt-year','rpt-date-from','rpt-date-to','rpt-reg-search'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    ['rpt-type'].forEach(id => { const el = document.getElementById(id); if (el) el.selectedIndex = 0; });
    this._resetSelect(document.getElementById('rpt-semester'), '— Select Semester —');
    this._resetSelect(document.getElementById('rpt-section'), '— Select Section —');
    this._resetSelect(document.getElementById('rpt-subject'), 'All Subjects');
    const wrap = document.getElementById('rpt-threshold-wrap'); if (wrap) wrap.style.display = 'none';
    this._refreshResultsArea();
  },

  /* ── PAGINATION ── */

  changePage(delta) {
    if (!this.state.reportData || !this.state.reportData.rows) return;
    const total = Math.ceil(this.state.reportData.rows.length / this.state.pageSize);
    this.state.page = Math.max(1, Math.min(this.state.page + delta, total));
    this._refreshResultsArea();
    this._initCharts();
    if (window.lucide) window.lucide.createIcons();
  },

  /* ── EXPORT ── */

  exportCSV() {
    if (!this.state.reportData || !this.state.reportData.rows) {
      UIService.showToast('Generate a report first before exporting.', 'warning'); return;
    }
    ReportService.exportReportCSV(this.state.reportData, this.state.reportData.meta);
  },

  /* ── RENDER HELPERS ── */

  _refreshResultsArea() {
    const area = document.getElementById('rpt-results-area');
    if (area) { area.innerHTML = this._renderResultsArea(); if (window.lucide) window.lucide.createIcons(); }
  },

  _renderResultsArea() {
    const { mode, reportData, studentReportData, page, pageSize } = this.state;

    if (mode === 'idle') return `
      <div class="card" style="padding:3rem 2rem;text-align:center;border:2px dashed #E2E8F0;background:#FAFBFF;">
        <div style="width:56px;height:56px;background:#EFF6FF;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem auto;">
          <i data-lucide="bar-chart-2" style="width:28px;height:28px;color:#2563EB;"></i>
        </div>
        <h3 style="font-size:1.05rem;font-weight:700;color:var(--color-navy-dark);margin:0 0 0.35rem 0;">No Report Generated Yet</h3>
        <p style="color:var(--color-text-muted);font-size:0.875rem;margin:0;">
          Search by Registration Number or select filters above, then click <strong>Generate Report</strong>.
        </p>
      </div>`;

    if (mode === 'loading') return `
      <div class="card" style="padding:3rem 2rem;text-align:center;">
        <div style="width:40px;height:40px;border:3px solid #E2E8F0;border-top-color:#2563EB;border-radius:50%;animation:spin 0.9s linear infinite;margin:0 auto 1rem auto;"></div>
        <p style="color:var(--color-text-muted);font-size:0.95rem;margin:0;font-weight:600;">Generating report…</p>
      </div>`;

    if (mode === 'error' || (reportData && reportData.error)) {
      const msg = (reportData && reportData.error) || 'An error occurred.';
      return `
        <div class="card" style="padding:2.5rem 2rem;text-align:center;border:1px solid #FECACA;">
          <div style="width:48px;height:48px;background:#FEE2E2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem auto;">
            <i data-lucide="alert-circle" style="width:24px;height:24px;color:#DC2626;"></i>
          </div>
          <h3 style="color:#991B1B;font-size:1rem;font-weight:700;margin:0 0 0.4rem 0;">No Data Found</h3>
          <p style="color:#6B7280;font-size:0.875rem;margin:0 0 0.5rem 0;">${msg}</p>
          <p style="color:#94A3B8;font-size:0.8rem;margin:0;">Try adjusting: Department, Semester, Section, Subject, or Date Range.</p>
        </div>`;
    }

    if (mode === 'student-results' && studentReportData && !studentReportData.error) {
      return this._renderStudentReport(studentReportData);
    }

    if (mode === 'results' && reportData && !reportData.error) {
      return this._renderGroupReport(reportData, page, pageSize);
    }

    return '';
  },

  _renderStudentReport(data) {
    const { student, rows, overall } = data;
    const c = p => p >= 75 ? '#10B981' : p >= 60 ? '#F59E0B' : '#EF4444';
    return `
      <div class="card" style="margin-bottom:1.25rem;padding:1.5rem;background:linear-gradient(135deg,#1E293B,#0F172A);color:#F8FAFC;border:none;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
          <div>
            <h3 style="margin:0 0 0.2rem 0;font-size:1.1rem;font-weight:800;">${student.name}</h3>
            <p style="margin:0;font-size:0.82rem;color:#94A3B8;">
              ${student.registrationNumber || student.rollNumber} &nbsp;|&nbsp; ${student.department || ''} &nbsp;|&nbsp; Sem ${student.semester || ''} &nbsp;|&nbsp; Section ${student.section || ''}
            </p>
          </div>
          <div style="text-align:center;">
            <div style="font-size:2.2rem;font-weight:900;color:${c(overall.percentage)};">${overall.percentage}%</div>
            <div style="font-size:0.72rem;color:#94A3B8;letter-spacing:0.03em;">Overall Attendance</div>
          </div>
        </div>
      </div>
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:0.9rem 1.25rem;border-bottom:1px solid #F1F5F9;display:flex;justify-content:space-between;align-items:center;">
          <h3 style="margin:0;font-size:0.875rem;font-weight:700;color:var(--color-navy-dark);">Subject-wise Attendance</h3>
          <span style="font-size:0.78rem;color:#94A3B8;">${rows.length} subject(s)</span>
        </div>
        <div style="overflow-x:auto;">
          <table class="custom-table" style="width:100%;border-collapse:collapse;min-width:480px;">
            <thead><tr style="background:#F8FAFC;">
              <th style="padding:0.7rem 1rem;text-align:left;font-size:0.75rem;color:#64748B;">Subject</th>
              <th style="padding:0.7rem 1rem;text-align:center;font-size:0.75rem;color:#64748B;">Present</th>
              <th style="padding:0.7rem 1rem;text-align:center;font-size:0.75rem;color:#64748B;">Absent</th>
              <th style="padding:0.7rem 1rem;text-align:center;font-size:0.75rem;color:#64748B;">Total</th>
              <th style="padding:0.7rem 1rem;text-align:center;font-size:0.75rem;color:#64748B;">Attendance</th>
              <th style="padding:0.7rem 1rem;text-align:center;font-size:0.75rem;color:#64748B;">Status</th>
            </tr></thead>
            <tbody>
              ${rows.length === 0
                ? `<tr><td colspan="6" style="padding:2rem;text-align:center;color:#94A3B8;">No attendance records found for this student.</td></tr>`
                : rows.map(r => `
                  <tr style="border-bottom:1px solid #F1F5F9;">
                    <td style="padding:0.65rem 1rem;">
                      <div style="font-weight:700;font-size:0.85rem;color:var(--color-navy-dark);">${r.subjectName}</div>
                      <div style="font-size:0.72rem;color:#94A3B8;">${r.subjectCode}</div>
                    </td>
                    <td style="text-align:center;padding:0.65rem 1rem;font-weight:700;color:#10B981;">${r.present}</td>
                    <td style="text-align:center;padding:0.65rem 1rem;font-weight:700;color:#EF4444;">${r.absent}</td>
                    <td style="text-align:center;padding:0.65rem 1rem;color:#64748B;">${r.total}</td>
                    <td style="text-align:center;padding:0.65rem 1rem;">
                      <div style="font-weight:800;font-size:0.95rem;color:${c(r.percentage)};">${r.percentage}%</div>
                      <div style="width:72px;height:4px;background:#E2E8F0;border-radius:3px;margin:4px auto 0;">
                        <div style="width:${r.percentage}%;height:100%;background:${c(r.percentage)};border-radius:3px;"></div>
                      </div>
                    </td>
                    <td style="text-align:center;padding:0.65rem 1rem;">
                      <span class="status-badge ${r.percentage >= 75 ? 'present' : 'warning'}">${r.status}</span>
                    </td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="padding:0.9rem 1.25rem;background:#F8FAFC;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
          <span style="font-size:0.85rem;font-weight:700;color:var(--color-navy-dark);">
            Overall: <span style="color:${c(overall.percentage)};">${overall.percentage}%</span>
            <span style="font-weight:400;color:#64748B;font-size:0.8rem;">(${overall.present}/${overall.total} classes)</span>
          </span>
          <span class="status-badge ${overall.percentage >= 75 ? 'present' : 'warning'}">${overall.status}</span>
        </div>
      </div>`;
  },

  _renderGroupReport(data, page, pageSize) {
    const { summary, distribution, rows, chart, meta, isLowAttendance, threshold } = data;
    const start = (page - 1) * pageSize;
    const pageRows = rows.slice(start, start + pageSize);
    const totalPages = Math.ceil(rows.length / pageSize);
    const c = p => p >= 75 ? '#10B981' : p >= 60 ? '#F59E0B' : '#EF4444';

    return `
      <!-- SUMMARY CARDS -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:0.75rem;margin-bottom:1.25rem;">
        ${this._sCard('Total Students', summary.totalStudents, 'users', '#2563EB')}
        ${this._sCard('Total Classes', summary.totalClasses, 'calendar', '#7C3AED')}
        ${this._sCard('Total Present', summary.totalPresent, 'check-circle', '#10B981')}
        ${this._sCard('Total Absent', summary.totalAbsent, 'x-circle', '#EF4444')}
        ${this._sCard('Avg. Attendance', summary.avgPercentage + '%', 'percent', summary.avgPercentage >= 75 ? '#10B981' : '#F59E0B')}
        ${this._sCard('Low Attendance', summary.lowCount, 'alert-triangle', '#F59E0B')}
      </div>

      ${isLowAttendance ? `<div class="card" style="padding:0.75rem 1.25rem;margin-bottom:1.25rem;background:#FEF3C7;border:1px solid #FCD34D;display:flex;align-items:center;gap:0.6rem;">
        <i data-lucide="alert-triangle" style="width:18px;height:18px;color:#B45309;flex-shrink:0;"></i>
        <span style="font-size:0.85rem;font-weight:600;color:#92400E;">Low Attendance Report — Students below ${threshold}% threshold shown.</span>
      </div>` : ''}

      <!-- CHARTS -->
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:1rem;margin-bottom:1.25rem;">
        <div class="card" style="padding:1.25rem;">
          <h3 style="font-size:0.82rem;font-weight:700;color:var(--color-navy-dark);margin:0 0 0.9rem 0;">
            <i data-lucide="bar-chart-2" style="width:14px;height:14px;display:inline;"></i> Attendance by Student (Top 12)
          </h3>
          <div style="height:230px;position:relative;"><canvas id="rpt-bar-chart"></canvas></div>
        </div>
        <div class="card" style="padding:1.25rem;">
          <h3 style="font-size:0.82rem;font-weight:700;color:var(--color-navy-dark);margin:0 0 0.9rem 0;">
            <i data-lucide="pie-chart" style="width:14px;height:14px;display:inline;"></i> Distribution
          </h3>
          <div style="height:140px;position:relative;margin-bottom:0.6rem;"><canvas id="rpt-dist-chart"></canvas></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.35rem;">
            ${this._dBand('90–100%', distribution.excellent, '#10B981')}
            ${this._dBand('75–89%', distribution.good, '#3B82F6')}
            ${this._dBand('60–74%', distribution.warning, '#F59E0B')}
            ${this._dBand('Below 60%', distribution.critical, '#EF4444')}
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:0.9rem 1.25rem;border-bottom:1px solid #F1F5F9;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
          <div>
            <h3 style="margin:0;font-size:0.875rem;font-weight:700;color:var(--color-navy-dark);">${meta.subjectName} — Student-wise Report</h3>
            ${meta.dateFrom || meta.dateTo ? `<p style="margin:0.15rem 0 0;font-size:0.75rem;color:#94A3B8;">Period: ${meta.dateFrom || '—'} to ${meta.dateTo || '—'}</p>` : ''}
          </div>
          <button class="btn-secondary" onclick="ReportsView.exportCSV()" style="font-size:0.78rem;padding:0.4rem 0.85rem;">
            <i data-lucide="download" style="width:14px;height:14px;display:inline;"></i> Export CSV
          </button>
        </div>
        <div style="overflow-x:auto;">
          <table class="custom-table" style="width:100%;border-collapse:collapse;min-width:540px;">
            <thead><tr style="background:#F8FAFC;">
              <th style="padding:0.7rem 1rem;font-size:0.75rem;color:#64748B;text-align:left;">#</th>
              <th style="padding:0.7rem 1rem;font-size:0.75rem;color:#64748B;text-align:left;">Reg. No.</th>
              <th style="padding:0.7rem 1rem;font-size:0.75rem;color:#64748B;text-align:left;">Student Name</th>
              <th style="padding:0.7rem 1rem;font-size:0.75rem;color:#64748B;text-align:center;">Present</th>
              <th style="padding:0.7rem 1rem;font-size:0.75rem;color:#64748B;text-align:center;">Absent</th>
              <th style="padding:0.7rem 1rem;font-size:0.75rem;color:#64748B;text-align:center;">Total</th>
              <th style="padding:0.7rem 1rem;font-size:0.75rem;color:#64748B;text-align:center;">Attendance</th>
              <th style="padding:0.7rem 1rem;font-size:0.75rem;color:#64748B;text-align:center;">Status</th>
            </tr></thead>
            <tbody>
              ${pageRows.length === 0
                ? `<tr><td colspan="8" style="padding:2.5rem;text-align:center;color:#94A3B8;">No records match the selected filters.</td></tr>`
                : pageRows.map((r, i) => `
                  <tr style="border-bottom:1px solid #F1F5F9;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background=''">
                    <td style="padding:0.6rem 1rem;font-size:0.78rem;color:#94A3B8;">${start + i + 1}</td>
                    <td style="padding:0.6rem 1rem;font-weight:700;font-size:0.82rem;color:var(--color-navy-dark);">${r.regNo}</td>
                    <td style="padding:0.6rem 1rem;font-weight:600;color:var(--color-navy-dark);">${r.name}</td>
                    <td style="text-align:center;padding:0.6rem 1rem;font-weight:700;color:#10B981;">${r.present}</td>
                    <td style="text-align:center;padding:0.6rem 1rem;font-weight:700;color:#EF4444;">${r.absent}</td>
                    <td style="text-align:center;padding:0.6rem 1rem;color:#64748B;">${r.total}</td>
                    <td style="text-align:center;padding:0.6rem 1rem;"><span style="font-weight:800;font-size:0.9rem;color:${c(r.percentage)};">${r.percentage}%</span></td>
                    <td style="text-align:center;padding:0.6rem 1rem;"><span class="status-badge ${r.percentage >= 75 ? 'present' : 'warning'}">${r.status}</span></td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${rows.length > pageSize ? `
          <div style="padding:0.8rem 1.25rem;border-top:1px solid #F1F5F9;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
            <span style="font-size:0.78rem;color:#64748B;">Showing ${start + 1}–${Math.min(start + pageSize, rows.length)} of ${rows.length} students</span>
            <div style="display:flex;gap:0.5rem;align-items:center;">
              <button class="btn-secondary" style="padding:0.3rem 0.7rem;font-size:0.78rem;" onclick="ReportsView.changePage(-1)" ${page <= 1 ? 'disabled' : ''}>
                ← Prev
              </button>
              <span style="padding:0.3rem 0.7rem;font-size:0.78rem;font-weight:700;color:var(--color-navy-dark);background:#F1F5F9;border-radius:4px;">${page} / ${totalPages}</span>
              <button class="btn-secondary" style="padding:0.3rem 0.7rem;font-size:0.78rem;" onclick="ReportsView.changePage(1)" ${page >= totalPages ? 'disabled' : ''}>
                Next →
              </button>
            </div>
          </div>` : ''}
      </div>`;
  },

  _sCard(label, value, icon, color) {
    return `<div class="card" style="padding:0.9rem;text-align:center;">
      <div style="width:34px;height:34px;border-radius:50%;background:${color}1A;display:flex;align-items:center;justify-content:center;margin:0 auto 0.4rem;">
        <i data-lucide="${icon}" style="width:16px;height:16px;color:${color};"></i>
      </div>
      <div style="font-size:1.35rem;font-weight:900;color:var(--color-navy-dark);line-height:1.1;">${value}</div>
      <div style="font-size:0.7rem;color:#94A3B8;margin-top:0.2rem;font-weight:600;">${label}</div>
    </div>`;
  },

  _dBand(label, count, color) {
    return `<div style="display:flex;align-items:center;gap:0.35rem;">
      <div style="width:9px;height:9px;border-radius:2px;background:${color};flex-shrink:0;"></div>
      <span style="font-size:0.72rem;color:#64748B;">${label}: <strong>${count}</strong></span>
    </div>`;
  },

  /* ── CHARTS ── */

  _initCharts() {
    if (!this.state.reportData || !this.state.reportData.chart) return;
    const { chart, distribution } = this.state.reportData;
    if (this.state.chartInstance) { try { this.state.chartInstance.destroy(); } catch(e){} this.state.chartInstance = null; }
    if (this.state.distChartInstance) { try { this.state.distChartInstance.destroy(); } catch(e){} this.state.distChartInstance = null; }

    const ctx1 = document.getElementById('rpt-bar-chart');
    if (ctx1 && window.Chart) {
      this.state.chartInstance = new window.Chart(ctx1, {
        type: 'bar',
        data: {
          labels: chart.labels,
          datasets: [{ label: 'Attendance %', data: chart.data,
            backgroundColor: chart.data.map(v => v >= 75 ? '#3B82F6' : '#F59E0B'),
            borderRadius: 5, borderSkipped: false }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, ticks: { callback: v => v + '%', font: { size: 10 } }, grid: { color: '#F1F5F9' } },
            x: { ticks: { font: { size: 10 } }, grid: { display: false } }
          }
        }
      });
    }

    const ctx2 = document.getElementById('rpt-dist-chart');
    if (ctx2 && window.Chart && distribution) {
      this.state.distChartInstance = new window.Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['90–100%', '75–89%', '60–74%', 'Below 60%'],
          datasets: [{ data: [distribution.excellent, distribution.good, distribution.warning, distribution.critical],
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'], borderWidth: 2, borderColor: '#fff' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '65%' }
      });
    }
  },

  initCharts() { this._initCharts(); }
};

window.ReportsView = ReportsView;

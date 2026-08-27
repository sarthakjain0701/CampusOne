/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAMS) - ADMIN & ACADEMIC TIMETABLE VIEW
   Dual-Tab Architecture: 1. WEEKLY TIMETABLE | 2. SCHEDULED SLOTS (DATA TABLE)
   ========================================================================== */

const TimetableView = {
  // Active View State
  activeTab: 'scheduled', // 'weekly' | 'scheduled'
  viewMode: 'grid', // 'grid' | 'list' (for Weekly Timetable tab)

  // Scheduled Slots Table State
  searchQuery: '',
  dateFilter: 'ALL', // 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'SPECIFIC' | 'RANGE'
  specificDate: '',
  startDate: '',
  endDate: '',
  selectedDay: 'ALL',
  selectedDepartment: 'ALL',
  selectedSection: 'ALL',
  selectedFaculty: 'ALL',
  selectedSubject: 'ALL',
  selectedStatus: 'ALL',
  sortBy: 'date',
  sortOrder: 'asc',
  page: 1,
  pageSize: 10,
  isLoading: false,

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div>Please log in.</div>`;

    const isAdmin = user.role === 'ADMIN';

    // Default student / faculty views to weekly tab if first render, admin defaults to scheduled slots tab
    if (!params.keepTab && !this._initializedTab) {
      this.activeTab = isAdmin ? 'scheduled' : 'weekly';
      this._initializedTab = true;
    }

    return `
      <!-- PAGE HEADER -->
      <div class="page-header" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.5rem;">
        <div>
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0; display:flex; align-items:center; gap:0.6rem;">
            <i data-lucide="calendar" style="color:var(--color-primary); width:28px; height:28px;"></i> TIMETABLE
          </h1>
          <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">
            Manage and organize academic classes and scheduled sessions efficiently.
          </p>
        </div>

        <!-- MAIN TABS CONTROL -->
        <div style="display:flex; background:#E2E8F0; padding:0.25rem; border-radius:10px; gap:0.25rem;">
          <button 
            id="tab-btn-weekly"
            class="btn ${this.activeTab === 'weekly' ? 'btn-primary' : 'btn-secondary'}" 
            onclick="TimetableView.setActiveTab('weekly')"
            style="font-size:0.85rem; font-weight:700; padding:0.5rem 1.1rem; border-radius:8px; display:flex; align-items:center; gap:0.4rem; ${this.activeTab === 'weekly' ? 'box-shadow:0 2px 4px rgba(0,0,0,0.1);' : 'background:transparent; color:#475569; border:none;'}"
          >
            <i data-lucide="grid" style="width:16px; height:16px;"></i> Weekly Timetable
          </button>

          <button 
            id="tab-btn-scheduled"
            class="btn ${this.activeTab === 'scheduled' ? 'btn-primary' : 'btn-secondary'}" 
            onclick="TimetableView.setActiveTab('scheduled')"
            style="font-size:0.85rem; font-weight:700; padding:0.5rem 1.1rem; border-radius:8px; display:flex; align-items:center; gap:0.4rem; ${this.activeTab === 'scheduled' ? 'box-shadow:0 2px 4px rgba(0,0,0,0.1);' : 'background:transparent; color:#475569; border:none;'}"
          >
            <i data-lucide="table" style="width:16px; height:16px;"></i> Scheduled Slots
          </button>
        </div>
      </div>

      <!-- MAIN TAB CONTENTS -->
      <div id="timetable-tab-content">
        ${this.activeTab === 'weekly' ? this.renderWeeklyTab(user) : this.renderScheduledSlotsTab(user)}
      </div>
    `;
  },

  setActiveTab(tabName) {
    this.activeTab = tabName;
    App.renderCurrentView();
  },

  // =========================================================================
  // TAB 1: WEEKLY TIMETABLE VIEW
  // =========================================================================
  renderWeeklyTab(user) {
    const isAdmin = user.role === 'ADMIN';
    const classes = classService.getClasses();

    let sectionId = this.selectedSection !== 'ALL' ? this.selectedSection : (classes[0] ? classes[0].id : 'CLS001');

    if (user.role === 'STUDENT') {
      const student = DataStore.get('STUDENTS').find(s => s.email === user.email || s.userId === user.uid) || DataStore.get('STUDENTS')[0];
      sectionId = student ? (student.classId || 'CLS001') : 'CLS001';
    }

    const rawTimetable = TimetableService.getAllTimetables();
    let filtered = rawTimetable.filter(t => (t.sectionId === sectionId || t.classId === sectionId) && t.status === 'ACTIVE');

    if (this.selectedDay !== 'ALL') {
      filtered = filtered.filter(t => t.day && t.day.toLowerCase() === this.selectedDay.toLowerCase());
    }

    const selectedClass = classes.find(c => c.id === sectionId);

    return `
      <!-- WEEKLY FILTER & MODE CONTROLS -->
      <div class="card" style="margin-bottom:1.5rem; padding:1.25rem;">
        <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem;">
          <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
            ${isAdmin ? `
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <label style="font-weight:700; font-size:0.85rem; color:var(--color-navy-dark);">Select Class:</label>
                <select class="form-control" style="min-width:180px; font-weight:600;" onchange="TimetableView.handleWeeklySectionChange(this.value)">
                  ${classes.map(c => `<option value="${c.id}" ${c.id === sectionId ? 'selected' : ''}>${c.name} (${c.department || 'CSE'})</option>`).join('')}
                </select>
              </div>
            ` : `
              <div style="font-weight:700; font-size:0.95rem; color:var(--color-navy-dark);">
                Class Schedule: <span style="color:var(--color-primary);">${selectedClass ? selectedClass.name : sectionId}</span>
              </div>
            `}

            <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
              <button class="btn-sm btn-secondary ${this.selectedDay === 'ALL' ? 'active-filter' : ''}" onclick="TimetableView.filterWeeklyDay('ALL')">All Days</button>
              <button class="btn-sm btn-secondary ${this.selectedDay === 'Monday' ? 'active-filter' : ''}" onclick="TimetableView.filterWeeklyDay('Monday')">Mon</button>
              <button class="btn-sm btn-secondary ${this.selectedDay === 'Tuesday' ? 'active-filter' : ''}" onclick="TimetableView.filterWeeklyDay('Tuesday')">Tue</button>
              <button class="btn-sm btn-secondary ${this.selectedDay === 'Wednesday' ? 'active-filter' : ''}" onclick="TimetableView.filterWeeklyDay('Wednesday')">Wed</button>
              <button class="btn-sm btn-secondary ${this.selectedDay === 'Thursday' ? 'active-filter' : ''}" onclick="TimetableView.filterWeeklyDay('Thursday')">Thu</button>
              <button class="btn-sm btn-secondary ${this.selectedDay === 'Friday' ? 'active-filter' : ''}" onclick="TimetableView.filterWeeklyDay('Friday')">Fri</button>
              <button class="btn-sm btn-secondary ${this.selectedDay === 'Saturday' ? 'active-filter' : ''}" onclick="TimetableView.filterWeeklyDay('Saturday')">Sat</button>
            </div>
          </div>

          <div style="display:flex; gap:0.5rem;">
            <button class="btn-sm ${this.viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}" onclick="TimetableView.setWeeklyViewMode('grid')">
              <i data-lucide="grid" style="width:14px; height:14px;"></i> Grid
            </button>
            <button class="btn-sm ${this.viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}" onclick="TimetableView.setWeeklyViewMode('list')">
              <i data-lucide="list" style="width:14px; height:14px;"></i> List
            </button>
          </div>
        </div>
      </div>

      <!-- TIMETABLE DISPLAY -->
      ${filtered.length === 0 ? `
        <div class="card" style="padding:3.5rem; text-align:center; color:var(--color-text-muted);">
          <i data-lucide="calendar-x" style="width:54px; height:54px; stroke-width:1.5; margin-bottom:1rem; color:#94A3B8;"></i>
          <h3 style="font-weight:700; color:var(--color-navy-dark);">No Timetable Slots Found</h3>
          <p style="font-size:0.9rem; max-width:400px; margin:0.5rem auto 0 auto;">There are no active scheduled classes for the selected criteria in the Weekly Timetable.</p>
        </div>
      ` : this.viewMode === 'grid' ? this.renderTimetableGrid(filtered, user) : this.renderTimetableList(filtered, user)}
    `;
  },

  renderTimetableGrid(entries) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = [
      { label: '09:00 AM – 10:00 AM', start: '09:00', end: '10:00' },
      { label: '10:00 AM – 11:00 AM', start: '10:00', end: '11:00' },
      { label: '11:00 AM – 12:00 PM', start: '11:00', end: '12:00' },
      { label: '12:00 PM – 01:00 PM', start: '12:00', end: '13:00' }
    ];

    const subjects = subjectService.getSubjects();
    const faculty = DataStore.get('FACULTY') || [];

    return `
      <div class="card" style="padding:0; overflow:hidden; border:1px solid var(--color-border); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <div class="table-responsive">
          <table class="data-table timetable-grid" style="border-collapse:collapse; width:100%; text-align:center;">
            <thead>
              <tr style="background:#F1F5F9; border-bottom:2px solid #CBD5E1;">
                <th style="width:150px; text-align:center; padding:1rem; font-weight:800; color:var(--color-navy-dark);">TIME / DAY</th>
                ${days.map(d => `<th style="text-align:center; padding:1rem; font-weight:800; color:var(--color-navy-dark);">${d.toUpperCase()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${timeSlots.map(slot => `
                <tr>
                  <td style="font-weight:700; font-size:0.8rem; background:#F8FAFC; color:var(--color-navy-dark); padding:0.85rem; border-right:1px solid #E2E8F0;">
                    ${slot.label}
                  </td>
                  ${days.map(day => {
                    const entry = entries.find(e => e.day && e.day.toLowerCase() === day.toLowerCase() && e.startTime === slot.start);
                    if (!entry) {
                      return `<td style="background:#FAFAFA; color:#CBD5E1; font-size:0.75rem; height:85px; vertical-align:middle; border:1px solid #F1F5F9;">— Free —</td>`;
                    }
                    const sub = subjects.find(s => s.id === entry.subjectId);
                    const fac = faculty.find(f => f.id === entry.facultyId);
                    const formattedDate = entry.date && typeof AcademicCalendarService !== 'undefined' ? AcademicCalendarService.formatDate(entry.date) : '';
                    return `
                      <td style="background:#EFF6FF; border:1px solid #BFDBFE; padding:0.75rem; text-align:left; vertical-align:top; border-radius:6px; transition:all 0.2s;">
                        <div style="font-weight:800; font-size:0.85rem; color:#1E40AF;">${sub ? sub.name : entry.subjectId}</div>
                        <div style="font-size:0.75rem; font-weight:700; color:#3B82F6; margin-top:0.25rem;">${sub ? sub.code : ''}</div>
                        <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:0.4rem; display:flex; align-items:center; gap:0.25rem;">
                          <i data-lucide="user" style="width:12px; height:12px;"></i> ${fac ? fac.name : 'Faculty'}
                        </div>
                        <div style="font-size:0.75rem; color:var(--color-text-muted); display:flex; align-items:center; gap:0.25rem;">
                          <i data-lucide="map-pin" style="width:12px; height:12px;"></i> Room ${entry.room || '301'}
                        </div>
                        ${formattedDate ? `<div style="font-size:0.7rem; color:#64748B; margin-top:0.3rem; font-weight:600;"><i data-lucide="calendar" style="width:10px; height:10px;"></i> ${formattedDate}</div>` : ''}
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderTimetableList(entries) {
    const subjects = subjectService.getSubjects();
    const faculty = DataStore.get('FACULTY') || [];

    return `
      <div class="timetable-list-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap:1rem;">
        ${entries.map(t => {
          const sub = subjects.find(s => s.id === t.subjectId);
          const fac = faculty.find(f => f.id === t.facultyId);
          const dateStr = t.date && typeof AcademicCalendarService !== 'undefined' ? AcademicCalendarService.formatDate(t.date) : '';
          return `
            <div class="card" style="border-left:4px solid #2563EB; transition:transform 0.2s; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <span class="status-badge active" style="font-weight:700;">${t.day} ${dateStr ? '• ' + dateStr : ''}</span>
                <span style="font-size:0.8rem; font-weight:700; color:#2563EB;"><i data-lucide="clock" style="width:12px; height:12px; display:inline;"></i> ${t.startTime} – ${t.endTime}</span>
              </div>
              <h4 style="font-size:1.05rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 0.25rem 0;">${sub ? sub.name : t.subjectId}</h4>
              <p style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:0.75rem;">Subject Code: <strong>${sub ? sub.code : 'CS'}</strong></p>
              
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; border-top:1px solid #F1F5F9; padding-top:0.6rem;">
                <span><i data-lucide="user" style="width:14px; height:14px; display:inline;"></i> ${fac ? fac.name : 'Faculty'}</span>
                <span><i data-lucide="map-pin" style="width:14px; height:14px; display:inline;"></i> Room ${t.room || '301'}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  handleWeeklySectionChange(secId) {
    this.selectedSection = secId;
    App.renderCurrentView();
  },

  filterWeeklyDay(day) {
    this.selectedDay = day;
    App.renderCurrentView();
  },

  setWeeklyViewMode(mode) {
    this.viewMode = mode;
    App.renderCurrentView();
  },

  // =========================================================================
  // TAB 2: SCHEDULED SLOTS (DATA TABLE MANAGEMENT VIEW)
  // =========================================================================
  renderScheduledSlotsTab(user) {
    const isAdmin = user.role === 'ADMIN';
    const stats = TimetableService.getSummaryStats();

    // Fetch Paginated & Filtered Data
    const queryOptions = {
      search: this.searchQuery,
      dateFilter: this.dateFilter,
      specificDate: this.specificDate,
      startDate: this.startDate,
      endDate: this.endDate,
      day: this.selectedDay,
      department: this.selectedDepartment,
      section: this.selectedSection,
      facultyId: this.selectedFaculty,
      subjectId: this.selectedSubject,
      status: this.selectedStatus,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      page: this.page,
      pageSize: this.pageSize
    };

    const data = TimetableService.getScheduledSlots(queryOptions);

    const departments = typeof departmentService !== 'undefined' ? departmentService.getDepartments() : DataStore.get('DEPARTMENTS') || [];
    const classes = typeof classService !== 'undefined' ? classService.getClasses() : DataStore.get('CLASSES') || [];
    const subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : DataStore.get('SUBJECTS') || [];
    const faculty = typeof facultyService !== 'undefined' ? facultyService.getFaculty() : DataStore.get('FACULTY') || [];

    const todayStr = new Date().toISOString().split('T')[0];
    const isTodayFilterActive = this.dateFilter === 'TODAY' || this.specificDate === todayStr;

    return `
      <!-- SUMMARY KPI CARDS -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
        <div class="card" style="padding:1.25rem; border-left:4px solid #2563EB; background:linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);">
          <div style="font-size:0.8rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.5px;">Total Slots</div>
          <div style="font-size:1.75rem; font-weight:800; color:var(--color-navy-dark); margin-top:0.25rem;">${stats.totalSlots}</div>
        </div>

        <div class="card" style="padding:1.25rem; border-left:4px solid #10B981; background:linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);">
          <div style="font-size:0.8rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.5px;">Active Slots</div>
          <div style="font-size:1.75rem; font-weight:800; color:#047857; margin-top:0.25rem;">${stats.activeSlots}</div>
        </div>

        <div class="card" style="padding:1.25rem; border-left:4px solid #F59E0B; background:linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);">
          <div style="font-size:0.8rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.5px;">Today's Slots</div>
          <div style="font-size:1.75rem; font-weight:800; color:#B45309; margin-top:0.25rem;">${stats.todaySlots}</div>
        </div>

        <div class="card" style="padding:1.25rem; border-left:4px solid #8B5CF6; background:linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);">
          <div style="font-size:0.8rem; font-weight:700; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.5px;">This Week</div>
          <div style="font-size:1.75rem; font-weight:800; color:#6D28D9; margin-top:0.25rem;">${stats.thisWeekSlots}</div>
        </div>
      </div>

      <!-- MAIN ACTION & HEADER BAR -->
      <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1rem;">
        <div>
          <h2 style="font-size:1.25rem; font-weight:800; color:var(--color-navy-dark); margin:0;">SCHEDULED SLOTS</h2>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin:0.1rem 0 0 0;">View, search, filter, and manage all date-wise academic class schedules.</p>
        </div>

        ${isAdmin ? `
          <button class="btn-primary" onclick="TimetableView.openAddModal()" style="padding:0.6rem 1.25rem; font-weight:700; box-shadow:0 4px 6px -1px rgba(37,99,235,0.25);">
            <i data-lucide="plus-circle" style="width:18px; height:18px;"></i> + Add Scheduled Slot
          </button>
        ` : ''}
      </div>

      <!-- TODAY'S SCHEDULE BANNER (WHEN TODAY FILTER ACTIVE) -->
      ${isTodayFilterActive ? `
        <div class="card" style="margin-bottom:1.5rem; background:linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border:1px solid #93C5FD; padding:1.25rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
            <h3 style="font-size:1.05rem; font-weight:800; color:#1E40AF; margin:0; display:flex; align-items:center; gap:0.5rem;">
              <i data-lucide="sun" style="color:#F59E0B; width:20px; height:20px;"></i> Today's Scheduled Slots — ${AcademicCalendarService.formatDate(todayStr, 'full')} (${AcademicCalendarService.getDayName(todayStr)})
            </h3>
            <span class="status-badge active" style="background:#2563EB; color:white;">${data.totalRecords} Lecture${data.totalRecords !== 1 ? 's' : ''} Today</span>
          </div>
        </div>
      ` : ''}

      <!-- FILTER & SEARCH BAR CONTAINER -->
      <div class="card" style="margin-bottom:1.5rem; padding:1.25rem; background:#FFFFFF;">
        <!-- SEARCH & PRIMARY FILTER CONTROLS -->
        <div style="display:grid; grid-template-columns: 2fr repeat(auto-fit, minmax(130px, 1fr)); gap:0.75rem; align-items:center;">
          <!-- SEARCH BOX -->
          <div style="position:relative;">
            <i data-lucide="search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--color-text-muted); width:16px; height:16px;"></i>
            <input 
              type="text" 
              class="form-control" 
              placeholder="🔍 Search scheduled slots..." 
              value="${this.searchQuery}"
              onkeyup="TimetableView.handleSearch(this.value)"
              style="padding-left:2.3rem; font-size:0.88rem;"
            >
          </div>

          <!-- DATE FILTER -->
          <div>
            <select class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="TimetableView.handleDateFilterChange(this.value)">
              <option value="ALL" ${this.dateFilter === 'ALL' ? 'selected' : ''}>Date: All</option>
              <option value="TODAY" ${this.dateFilter === 'TODAY' ? 'selected' : ''}>Date: Today</option>
              <option value="THIS_WEEK" ${this.dateFilter === 'THIS_WEEK' ? 'selected' : ''}>Date: This Week</option>
              <option value="THIS_MONTH" ${this.dateFilter === 'THIS_MONTH' ? 'selected' : ''}>Date: This Month</option>
              <option value="SPECIFIC" ${this.dateFilter === 'SPECIFIC' ? 'selected' : ''}>Specific Date...</option>
              <option value="RANGE" ${this.dateFilter === 'RANGE' ? 'selected' : ''}>Date Range...</option>
            </select>
          </div>

          <!-- DAY FILTER -->
          <div>
            <select class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="TimetableView.handleFilterChange('selectedDay', this.value)">
              <option value="ALL" ${this.selectedDay === 'ALL' ? 'selected' : ''}>Day: All Days</option>
              <option value="Monday" ${this.selectedDay === 'Monday' ? 'selected' : ''}>Monday</option>
              <option value="Tuesday" ${this.selectedDay === 'Tuesday' ? 'selected' : ''}>Tuesday</option>
              <option value="Wednesday" ${this.selectedDay === 'Wednesday' ? 'selected' : ''}>Wednesday</option>
              <option value="Thursday" ${this.selectedDay === 'Thursday' ? 'selected' : ''}>Thursday</option>
              <option value="Friday" ${this.selectedDay === 'Friday' ? 'selected' : ''}>Friday</option>
              <option value="Saturday" ${this.selectedDay === 'Saturday' ? 'selected' : ''}>Saturday</option>
              <option value="Sunday" ${this.selectedDay === 'Sunday' ? 'selected' : ''}>Sunday</option>
            </select>
          </div>

          <!-- DEPARTMENT FILTER -->
          <div>
            <select class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="TimetableView.handleFilterChange('selectedDepartment', this.value)">
              <option value="ALL" ${this.selectedDepartment === 'ALL' ? 'selected' : ''}>Dept: All</option>
              ${departments.map(d => `<option value="${d.id}" ${this.selectedDepartment === d.id ? 'selected' : ''}>${d.code || d.name}</option>`).join('')}
            </select>
          </div>

          <!-- SECTION FILTER -->
          <div>
            <select class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="TimetableView.handleFilterChange('selectedSection', this.value)">
              <option value="ALL" ${this.selectedSection === 'ALL' ? 'selected' : ''}>Section: All</option>
              ${classes.map(c => `<option value="${c.id}" ${this.selectedSection === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>

          <!-- FACULTY FILTER -->
          <div>
            <select class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="TimetableView.handleFilterChange('selectedFaculty', this.value)">
              <option value="ALL" ${this.selectedFaculty === 'ALL' ? 'selected' : ''}>Faculty: All</option>
              ${faculty.map(f => `<option value="${f.id}" ${this.selectedFaculty === f.id ? 'selected' : ''}>${f.name}</option>`).join('')}
            </select>
          </div>

          <!-- SUBJECT FILTER -->
          <div>
            <select class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="TimetableView.handleFilterChange('selectedSubject', this.value)">
              <option value="ALL" ${this.selectedSubject === 'ALL' ? 'selected' : ''}>Subject: All</option>
              ${subjects.map(s => `<option value="${s.id}" ${this.selectedSubject === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>

          <!-- STATUS FILTER -->
          <div>
            <select class="form-control" style="font-size:0.85rem; font-weight:600;" onchange="TimetableView.handleFilterChange('selectedStatus', this.value)">
              <option value="ALL" ${this.selectedStatus === 'ALL' ? 'selected' : ''}>Status: All</option>
              <option value="ACTIVE" ${this.selectedStatus === 'ACTIVE' ? 'selected' : ''}>Active</option>
              <option value="INACTIVE" ${this.selectedStatus === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
        </div>

        <!-- CONDITIONAL CUSTOM DATE INPUTS & CLEAR FILTERS BUTTON -->
        <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; margin-top:0.85rem; pt:0.5rem; gap:0.75rem;">
          <div>
            ${this.dateFilter === 'SPECIFIC' ? `
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <label style="font-size:0.8rem; font-weight:700; color:var(--color-navy-dark);">Pick Date:</label>
                <input type="date" class="form-control" style="width:auto; font-size:0.85rem;" value="${this.specificDate}" onchange="TimetableView.handleSpecificDateChange(this.value)">
              </div>
            ` : ''}

            ${this.dateFilter === 'RANGE' ? `
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <label style="font-size:0.8rem; font-weight:700; color:var(--color-navy-dark);">From:</label>
                <input type="date" class="form-control" style="width:auto; font-size:0.85rem;" value="${this.startDate}" onchange="TimetableView.handleRangeChange('startDate', this.value)">
                <label style="font-size:0.8rem; font-weight:700; color:var(--color-navy-dark);">To:</label>
                <input type="date" class="form-control" style="width:auto; font-size:0.85rem;" value="${this.endDate}" onchange="TimetableView.handleRangeChange('endDate', this.value)">
              </div>
            ` : ''}
          </div>

          <div style="margin-left:auto;">
            <button class="btn-secondary btn-sm" onclick="TimetableView.clearFilters()" style="font-weight:700; color:var(--color-danger); border-color:#FECDD3; display:flex; align-items:center; gap:0.3rem;">
              <i data-lucide="x-circle" style="width:14px; height:14px;"></i> Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- SCHEDULED SLOTS DATA TABLE CARD -->
      <div class="card" style="padding:0; overflow:hidden; border:1px solid var(--color-border); box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <!-- SKELETON / LOADING STATE -->
        ${this.isLoading ? `
          <div style="padding:3rem; text-align:center;">
            <div class="spinner" style="margin:0 auto 1rem auto; width:36px; height:36px; border:3px solid #E2E8F0; border-top-color:#2563EB; border-radius:50%; animation:spin 1s linear infinite;"></div>
            <p style="color:var(--color-text-muted); font-size:0.9rem;">Loading scheduled slots data table...</p>
          </div>
        ` : data.items.length === 0 ? `
          <!-- EMPTY STATE -->
          <div style="padding:3.5rem 1.5rem; text-align:center;">
            <i data-lucide="calendar-x" style="width:54px; height:54px; stroke-width:1.5; margin-bottom:1rem; color:#94A3B8;"></i>
            <h3 style="font-size:1.15rem; font-weight:700; color:var(--color-navy-dark); margin:0 0 0.5rem 0;">No Scheduled Slots Found</h3>
            <p style="font-size:0.9rem; color:var(--color-text-muted); max-width:400px; margin:0 auto 1.25rem auto;">
              ${this.hasActiveFilters() ? 'No timetable slots match your selected search criteria or filters.' : 'No scheduled slots are currently available in the system.'}
            </p>
            ${this.hasActiveFilters() ? `
              <button class="btn-secondary btn-sm" onclick="TimetableView.clearFilters()" style="font-weight:700;">
                <i data-lucide="rotate-ccw" style="width:14px; height:14px; display:inline;"></i> Clear Filters
              </button>
            ` : isAdmin ? `
              <button class="btn-primary btn-sm" onclick="TimetableView.openAddModal()" style="font-weight:700;">
                <i data-lucide="plus-circle" style="width:14px; height:14px; display:inline;"></i> + Add Scheduled Slot
              </button>
            ` : ''}
          </div>
        ` : `
          <!-- DATA TABLE -->
          <div class="table-responsive">
            <table class="data-table" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#F8FAFC; border-bottom:2px solid #E2E8F0;">
                  <th style="cursor:pointer;" onclick="TimetableView.handleSort('date')" title="Click to sort by Date">
                    Date ${this.getSortIcon('date')}
                  </th>
                  <th style="cursor:pointer;" onclick="TimetableView.handleSort('day')" title="Click to sort by Day">
                    Day ${this.getSortIcon('day')}
                  </th>
                  <th style="cursor:pointer;" onclick="TimetableView.handleSort('time')" title="Click to sort by Time">
                    Time ${this.getSortIcon('time')}
                  </th>
                  <th style="cursor:pointer;" onclick="TimetableView.handleSort('subject')" title="Click to sort by Subject">
                    Subject ${this.getSortIcon('subject')}
                  </th>
                  <th style="cursor:pointer;" onclick="TimetableView.handleSort('faculty')" title="Click to sort by Faculty">
                    Faculty ${this.getSortIcon('faculty')}
                  </th>
                  <th style="cursor:pointer;" onclick="TimetableView.handleSort('department')" title="Click to sort by Department">
                    Dept ${this.getSortIcon('department')}
                  </th>
                  <th style="cursor:pointer;" onclick="TimetableView.handleSort('section')" title="Click to sort by Section">
                    Section ${this.getSortIcon('section')}
                  </th>
                  <th style="cursor:pointer;" onclick="TimetableView.handleSort('room')" title="Click to sort by Room">
                    Room ${this.getSortIcon('room')}
                  </th>
                  <th style="cursor:pointer;" onclick="TimetableView.handleSort('status')" title="Click to sort by Status">
                    Status ${this.getSortIcon('status')}
                  </th>
                  <th style="text-align:center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(t => {
                  const sub = subjects.find(s => s.id === t.subjectId);
                  const fac = faculty.find(f => f.id === t.facultyId);
                  const cls = classes.find(c => c.id === t.sectionId || c.id === t.classId);
                  const dept = departments.find(d => d.id === t.departmentId || d.code === t.departmentId);

                  const formattedDate = AcademicCalendarService.formatDate(t.date);
                  const calculatedDay = AcademicCalendarService.getDayName(t.date) || t.day;

                  return `
                    <tr style="border-bottom:1px solid #F1F5F9; transition:background 0.15s;">
                      <td style="font-weight:700; color:var(--color-navy-dark); font-size:0.88rem; white-space:nowrap;">
                        <i data-lucide="calendar" style="width:14px; height:14px; color:#2563EB; display:inline; margin-right:4px;"></i>
                        ${formattedDate || t.date}
                      </td>
                      <td style="font-size:0.85rem; font-weight:600; color:#475569;">
                        ${calculatedDay}
                      </td>
                      <td style="white-space:nowrap;">
                        <span class="status-badge active" style="font-size:0.75rem; background:#EFF6FF; color:#1E40AF; border:1px solid #BFDBFE; font-weight:700;">
                          <i data-lucide="clock" style="width:11px; height:11px; display:inline;"></i> ${t.startTime} – ${t.endTime}
                        </span>
                      </td>
                      <td style="font-weight:700; color:var(--color-navy-dark); font-size:0.88rem;">
                        ${sub ? sub.name : t.subjectId}
                        <div style="font-size:0.75rem; color:var(--color-text-muted); font-weight:500;">${sub ? sub.code : ''}</div>
                      </td>
                      <td style="font-size:0.85rem; font-weight:600; color:#334155;">
                        ${fac ? fac.name : t.facultyId}
                      </td>
                      <td style="font-size:0.82rem; font-weight:600; color:#475569;">
                        ${dept ? dept.code : (t.departmentId || 'CSE')}
                      </td>
                      <td style="font-size:0.85rem; font-weight:700; color:#1E293B;">
                        ${cls ? cls.name : (t.sectionId || 'CSE-A')}
                      </td>
                      <td style="font-size:0.85rem; font-family:monospace; font-weight:700; color:#0F172A;">
                        ${t.room || '301'}
                      </td>
                      <td style="white-space:nowrap;">
                        ${t.status === 'ACTIVE' 
                          ? `<span class="status-badge active" style="font-weight:700; font-size:0.75rem;">Active</span>`
                          : `<span class="status-badge inactive" style="font-weight:700; font-size:0.75rem; background:#F1F5F9; color:#64748B;">Inactive</span>`
                        }
                      </td>
                      <td style="text-align:center; white-space:nowrap;">
                        ${isAdmin ? `
                          <button class="btn-icon" title="Edit Scheduled Slot" aria-label="Edit Scheduled Slot" onclick="TimetableView.openEditModal('${t.id}')" style="color:#2563EB;">
                            <i data-lucide="edit-2" style="width:15px; height:15px;"></i>
                          </button>
                          <button class="btn-icon" title="Delete Scheduled Slot" aria-label="Delete Scheduled Slot" onclick="TimetableView.confirmDeleteModal('${t.id}')" style="color:var(--color-danger); margin-left:4px;">
                            <i data-lucide="trash-2" style="width:15px; height:15px;"></i>
                          </button>
                        ` : `
                          <span style="font-size:0.75rem; color:#94A3B8;">Read Only</span>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- PAGINATION FOOTER CONTROLS -->
          <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; padding:1rem 1.25rem; background:#F8FAFC; border-top:1px solid #E2E8F0; gap:1rem;">
            <div style="font-size:0.85rem; color:var(--color-text-muted); font-weight:600;">
              Showing <strong>${data.startIndex}–${data.endIndex}</strong> of <strong>${data.totalRecords}</strong> scheduled slots
            </div>

            <div style="display:flex; align-items:center; gap:0.5rem;">
              <label style="font-size:0.8rem; color:var(--color-text-muted); font-weight:600;">Rows per page:</label>
              <select class="form-control" style="width:auto; padding:0.2rem 0.5rem; font-size:0.8rem;" onchange="TimetableView.setPageSize(this.value)">
                <option value="10" ${this.pageSize === 10 ? 'selected' : ''}>10</option>
                <option value="20" ${this.pageSize === 20 ? 'selected' : ''}>20</option>
                <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50</option>
              </select>

              <div style="display:flex; gap:0.25rem; margin-left:0.5rem;">
                <button 
                  class="btn-secondary btn-sm" 
                  ${data.currentPage <= 1 ? 'disabled' : ''} 
                  onclick="TimetableView.goToPage(${data.currentPage - 1})"
                  style="padding:0.3rem 0.6rem; font-size:0.8rem;"
                >
                  ← Previous
                </button>

                ${Array(data.totalPages).fill(0).map((_, idx) => {
                  const pNum = idx + 1;
                  return `
                    <button 
                      class="btn-sm ${pNum === data.currentPage ? 'btn-primary' : 'btn-secondary'}" 
                      onclick="TimetableView.goToPage(${pNum})"
                      style="padding:0.3rem 0.6rem; font-size:0.8rem; font-weight:700;"
                    >
                      ${pNum}
                    </button>
                  `;
                }).join('')}

                <button 
                  class="btn-secondary btn-sm" 
                  ${data.currentPage >= data.totalPages ? 'disabled' : ''} 
                  onclick="TimetableView.goToPage(${data.currentPage + 1})"
                  style="padding:0.3rem 0.6rem; font-size:0.8rem;"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        `}
      </div>
    `;
  },

  // =========================================================================
  // SEARCH, FILTER, SORT & PAGINATION EVENT HANDLERS
  // =========================================================================
  handleSearch(query) {
    this.searchQuery = query;
    this.page = 1;
    this.renderScheduledSlotsTabOnly();
  },

  handleFilterChange(field, val) {
    this[field] = val;
    this.page = 1;
    this.renderScheduledSlotsTabOnly();
  },

  handleDateFilterChange(val) {
    this.dateFilter = val;
    if (val === 'TODAY') {
      this.specificDate = new Date().toISOString().split('T')[0];
    }
    this.page = 1;
    this.renderScheduledSlotsTabOnly();
  },

  handleSpecificDateChange(val) {
    this.specificDate = val;
    this.page = 1;
    this.renderScheduledSlotsTabOnly();
  },

  handleRangeChange(field, val) {
    this[field] = val;
    this.page = 1;
    this.renderScheduledSlotsTabOnly();
  },

  handleSort(field) {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.renderScheduledSlotsTabOnly();
  },

  getSortIcon(field) {
    if (this.sortBy !== field) return `<span style="opacity:0.3; font-size:0.75rem;">↕</span>`;
    return this.sortOrder === 'asc' ? `▲` : `▼`;
  },

  goToPage(pageNum) {
    this.page = pageNum;
    this.renderScheduledSlotsTabOnly();
  },

  setPageSize(size) {
    this.pageSize = parseInt(size, 10);
    this.page = 1;
    this.renderScheduledSlotsTabOnly();
  },

  clearFilters() {
    this.searchQuery = '';
    this.dateFilter = 'ALL';
    this.specificDate = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedDay = 'ALL';
    this.selectedDepartment = 'ALL';
    this.selectedSection = 'ALL';
    this.selectedFaculty = 'ALL';
    this.selectedSubject = 'ALL';
    this.selectedStatus = 'ALL';
    this.sortBy = 'date';
    this.sortOrder = 'asc';
    this.page = 1;
    App.renderCurrentView();
  },

  hasActiveFilters() {
    return this.searchQuery || this.dateFilter !== 'ALL' || this.selectedDay !== 'ALL' ||
           this.selectedDepartment !== 'ALL' || this.selectedSection !== 'ALL' ||
           this.selectedFaculty !== 'ALL' || this.selectedSubject !== 'ALL' ||
           this.selectedStatus !== 'ALL';
  },

  renderScheduledSlotsTabOnly() {
    const container = document.getElementById('timetable-tab-content');
    if (container && this.activeTab === 'scheduled') {
      const user = authService.getCurrentUser();
      container.innerHTML = this.renderScheduledSlotsTab(user);
      if (window.lucide) window.lucide.createIcons();
    } else {
      App.renderCurrentView();
    }
  },

  // =========================================================================
  // MODALS & DIALOGS (ADD, EDIT, DELETE & CALENDAR WARNINGS)
  // =========================================================================

  /**
   * Helper triggered on Date input change inside Add/Edit Form
   * Updates automatic day display and real-time Academic Calendar status pill
   */
  onDateInputChange(dateStr, formType = 'add') {
    const dayInput = document.getElementById(`${formType}-tt-day`);
    const statusContainer = document.getElementById(`${formType}-tt-calendar-status`);

    if (!dateStr) {
      if (dayInput) dayInput.value = '';
      if (statusContainer) statusContainer.innerHTML = '';
      return;
    }

    const dayName = AcademicCalendarService.getDayName(dateStr);
    if (dayInput) dayInput.value = dayName;

    const user = authService.getCurrentUser();
    const role = user ? user.role : 'ADMIN';
    const statusObj = AcademicCalendarService.getDateStatus(dateStr, role);

    if (statusContainer) {
      let badgeHtml = '';
      if (statusObj.status === 'WORKING_DAY') {
        badgeHtml = `<span class="status-badge active" style="background:#D1FAE5; color:#065F46; font-weight:700; padding:0.35rem 0.75rem; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.3rem;"><i data-lucide="check-circle" style="width:14px; height:14px;"></i> ✓ Working Day</span>`;
      } else if (statusObj.status === 'COLLEGE_HOLIDAY') {
        badgeHtml = `<span class="status-badge" style="background:#FEF3C7; color:#92400E; font-weight:700; padding:0.35rem 0.75rem; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.3rem;"><i data-lucide="alert-triangle" style="width:14px; height:14px;"></i> 🟠 College Holiday: ${statusObj.holidayName}</span>`;
      } else if (statusObj.status === 'WEEKLY_OFF') {
        badgeHtml = `<span class="status-badge" style="background:#FEE2E2; color:#991B1B; font-weight:700; padding:0.35rem 0.75rem; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.3rem;"><i data-lucide="calendar-off" style="width:14px; height:14px;"></i> 🔴 Weekly Off (${statusObj.applicableTo})</span>`;
      } else if (statusObj.status === 'SPECIAL_WORKING_DAY') {
        badgeHtml = `<span class="status-badge" style="background:#F3E8FF; color:#6B21A8; font-weight:700; padding:0.35rem 0.75rem; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.3rem;"><i data-lucide="sparkles" style="width:14px; height:14px;"></i> 🟣 Special Working Day</span>`;
      } else if (statusObj.status === 'EXAM_DAY') {
        badgeHtml = `<span class="status-badge" style="background:#DBEAFE; color:#1E40AF; font-weight:700; padding:0.35rem 0.75rem; font-size:0.8rem; display:inline-flex; align-items:center; gap:0.3rem;"><i data-lucide="book-open" style="width:14px; height:14px;"></i> 🔵 Exam Day</span>`;
      }

      statusContainer.innerHTML = badgeHtml;
      if (window.lucide) window.lucide.createIcons();
    }
  },

  /**
   * OPEN ADD SCHEDULED SLOT MODAL
   */
  openAddModal() {
    const departments = typeof departmentService !== 'undefined' ? departmentService.getDepartments() : DataStore.get('DEPARTMENTS') || [];
    const classes = typeof classService !== 'undefined' ? classService.getClasses() : DataStore.get('CLASSES') || [];
    const subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : DataStore.get('SUBJECTS') || [];
    const faculty = typeof facultyService !== 'undefined' ? facultyService.getFaculty() : DataStore.get('FACULTY') || [];

    const defaultDate = new Date().toISOString().split('T')[0];
    const defaultDay = AcademicCalendarService.getDayName(defaultDate);

    const modalHtml = `
      <form id="add-scheduled-slot-form" onsubmit="return false;">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Date *</label>
            <input type="date" id="add-tt-date" class="form-input" value="${defaultDate}" required onchange="TimetableView.onDateInputChange(this.value, 'add')">
          </div>
          <div class="form-group">
            <label class="form-label">Day (Auto Calculated)</label>
            <input type="text" id="add-tt-day" class="form-input" value="${defaultDay}" readonly style="background-color: var(--color-bg-main); font-weight: 600;">
          </div>
        </div>

        <!-- ACADEMIC CALENDAR STATUS BANNER -->
        <div id="add-tt-calendar-status" style="margin-bottom:1rem;"></div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Start Time *</label>
            <input type="time" id="add-tt-start" class="form-input" value="09:00" required>
          </div>
          <div class="form-group">
            <label class="form-label">End Time *</label>
            <input type="time" id="add-tt-end" class="form-input" value="10:00" required>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Department *</label>
            <select id="add-tt-department" class="form-select" required>
              <option value="" disabled selected>Select Department ▼</option>
              ${departments.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Section / Class *</label>
            <select id="add-tt-section" class="form-select" required>
              <option value="" disabled selected>Select Section ▼</option>
              ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Subject *</label>
            <select id="add-tt-subject" class="form-select" required>
              <option value="" disabled selected>Select Subject ▼</option>
              ${subjects.map(s => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Faculty Instructor *</label>
            <select id="add-tt-faculty" class="form-select" required>
              <option value="" disabled selected>Select Faculty ▼</option>
              ${faculty.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Room / Lecture Hall *</label>
            <input type="text" id="add-tt-room" class="form-input" value="301" placeholder="e.g. 301" required>
          </div>
          <div class="form-group">
            <label class="form-label">Status *</label>
            <select id="add-tt-status" class="form-select" required>
              <option value="ACTIVE" selected>Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </form>
    `;

    UIService.openModal(
      "Add Scheduled Slot",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Add Scheduled Slot',
          className: 'btn-primary',
          onClick: () => this.processSaveSlot('add')
        }
      ]
    );

    // Trigger initial calendar status evaluation
    setTimeout(() => this.onDateInputChange(defaultDate, 'add'), 50);
  },

  /**
   * OPEN EDIT SCHEDULED SLOT MODAL
   */
  openEditModal(id) {
    const entry = TimetableService.getTimetableById(id);
    if (!entry) {
      UIService.showToast("Scheduled slot not found.", "danger");
      return;
    }

    const departments = typeof departmentService !== 'undefined' ? departmentService.getDepartments() : DataStore.get('DEPARTMENTS') || [];
    const classes = typeof classService !== 'undefined' ? classService.getClasses() : DataStore.get('CLASSES') || [];
    const subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : DataStore.get('SUBJECTS') || [];
    const faculty = typeof facultyService !== 'undefined' ? facultyService.getFaculty() : DataStore.get('FACULTY') || [];

    const slotDate = entry.date || new Date().toISOString().split('T')[0];
    const slotDay = AcademicCalendarService.getDayName(slotDate) || entry.day;

    const modalHtml = `
      <form id="edit-scheduled-slot-form" onsubmit="return false;">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Date *</label>
            <input 
              type="date" 
              id="edit-tt-date" 
              class="form-input" 
              value="${slotDate}" 
              required
              onchange="TimetableView.onDateInputChange(this.value, 'edit')"
            >
          </div>
          <div class="form-group">
            <label class="form-label">Day (Auto Calculated)</label>
            <input 
              type="text" 
              id="edit-tt-day" 
              class="form-input" 
              value="${slotDay}" 
              readonly 
              style="background:#F1F5F9; font-weight:700;"
            >
          </div>
        </div>

        <!-- ACADEMIC CALENDAR STATUS BANNER -->
        <div id="edit-tt-calendar-status" style="margin-bottom:1rem;"></div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Start Time *</label>
            <input type="time" id="edit-tt-start" class="form-input" value="${entry.startTime}" required>
          </div>
          <div class="form-group">
            <label class="form-label">End Time *</label>
            <input type="time" id="edit-tt-end" class="form-input" value="${entry.endTime}" required>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Department *</label>
            <select id="edit-tt-department" class="form-select" required>
              ${departments.map(d => `<option value="${d.id}" ${d.id === entry.departmentId ? 'selected' : ''}>${d.name} (${d.code})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Section / Class *</label>
            <select id="edit-tt-section" class="form-select" required>
              ${classes.map(c => `<option value="${c.id}" ${c.id === entry.sectionId ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Subject *</label>
            <select id="edit-tt-subject" class="form-select" required>
              ${subjects.map(s => `<option value="${s.id}" ${s.id === entry.subjectId ? 'selected' : ''}>${s.name} (${s.code})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Faculty Instructor *</label>
            <select id="edit-tt-faculty" class="form-select" required>
              ${faculty.map(f => `<option value="${f.id}" ${f.id === entry.facultyId ? 'selected' : ''}>${f.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Room / Lecture Hall *</label>
            <input type="text" id="edit-tt-room" class="form-input" value="${entry.room || '301'}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Status *</label>
            <select id="edit-tt-status" class="form-select" required>
              <option value="ACTIVE" ${entry.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
              <option value="INACTIVE" ${entry.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
        </div>
      </form>
    `;

    UIService.openModal(
      "EDIT SCHEDULED SLOT",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Save Changes',
          className: 'btn-primary',
          onClick: () => this.processSaveSlot('edit', id)
        }
      ]
    );

    // Trigger initial calendar status evaluation for prefilled date
    setTimeout(() => this.onDateInputChange(slotDate, 'edit'), 50);
  },

  /**
   * Process Save / Update Slot with Calendar Warnings Interruption
   */
  processSaveSlot(formType, editId = null) {
    const date = document.getElementById(`${formType}-tt-date`).value;
    const startTime = document.getElementById(`${formType}-tt-start`).value;
    const endTime = document.getElementById(`${formType}-tt-end`).value;
    const departmentId = document.getElementById(`${formType}-tt-department`).value;
    const sectionId = document.getElementById(`${formType}-tt-section`).value;
    const subjectId = document.getElementById(`${formType}-tt-subject`).value;
    const facultyId = document.getElementById(`${formType}-tt-faculty`).value;
    const room = document.getElementById(`${formType}-tt-room`).value;
    const status = document.getElementById(`${formType}-tt-status`).value;

    const user = authService.getCurrentUser();
    const role = user ? user.role : 'ADMIN';
    const statusObj = AcademicCalendarService.getDateStatus(date, role);

    const executeSave = () => {
      try {
        if (formType === 'add') {
          TimetableService.createTimetableEntry({
            date, startTime, endTime, departmentId, sectionId, subjectId, facultyId, room, status
          });
          UIService.showToast("Scheduled slot created successfully.", "success");
        } else {
          TimetableService.updateTimetableEntry(editId, {
            date, startTime, endTime, departmentId, sectionId, subjectId, facultyId, room, status
          });
          UIService.showToast("Scheduled slot updated successfully.", "success");
        }
        UIService.closeModal();
        this.renderScheduledSlotsTabOnly();
      } catch (err) {
        UIService.showToast(err.message, "danger");
      }
    };

    // 1. HOLIDAY INTERRUPTION WARNING
    if (statusObj.status === 'COLLEGE_HOLIDAY') {
      this.showHolidayWarningModal(date, statusObj.holidayName, executeSave);
      return;
    }

    // 2. WEEKLY OFF INTERRUPTION WARNING
    if (statusObj.status === 'WEEKLY_OFF') {
      this.showWeeklyOffWarningModal(date, statusObj.applicableTo, executeSave);
      return;
    }

    // Direct save if working day or special working day
    executeSave();
  },

  /**
   * COLLEGE HOLIDAY WARNING DIALOG
   */
  showHolidayWarningModal(dateStr, holidayName, onProceed) {
    const formattedDate = AcademicCalendarService.formatDate(dateStr, 'full');
    const dayName = AcademicCalendarService.getDayName(dateStr);

    const dialogHtml = `
      <div style="text-align:center; padding:1rem 0.5rem;">
        <div style="width:56px; height:56px; border-radius:50%; background:#FEF3C7; color:#D97706; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto;">
          <i data-lucide="alert-triangle" style="width:28px; height:28px;"></i>
        </div>
        <h3 style="font-size:1.25rem; font-weight:800; color:#92400E; margin:0 0 0.5rem 0;">COLLEGE HOLIDAY</h3>
        <p style="font-size:0.95rem; color:#475569; margin:0 0 1rem 0;">
          <strong>${formattedDate} (${dayName})</strong> is marked as an official college holiday (<strong>${holidayName}</strong>).
        </p>
        <p style="font-size:0.88rem; color:#64748B;">
          Do you still want to create a scheduled slot for this holiday date?
        </p>
      </div>
    `;

    UIService.openModal(
      "Holiday Schedule Notice",
      dialogHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        { text: 'Continue', className: 'btn-primary', onClick: () => { UIService.closeModal(); onProceed(); } }
      ]
    );
  },

  /**
   * WEEKLY OFF WARNING DIALOG
   */
  showWeeklyOffWarningModal(dateStr, applicableTo, onProceed) {
    const formattedDate = AcademicCalendarService.formatDate(dateStr, 'full');
    const dayName = AcademicCalendarService.getDayName(dateStr);

    const dialogHtml = `
      <div style="text-align:center; padding:1rem 0.5rem;">
        <div style="width:56px; height:56px; border-radius:50%; background:#FEE2E2; color:#DC2626; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto;">
          <i data-lucide="calendar-off" style="width:28px; height:28px;"></i>
        </div>
        <h3 style="font-size:1.25rem; font-weight:800; color:#991B1B; margin:0 0 0.5rem 0;">WEEKLY OFF</h3>
        <p style="font-size:0.95rem; color:#475569; margin:0 0 0.75rem 0;">
          This date is configured as a weekly off.
        </p>
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:0.75rem; border-radius:8px; text-align:left; font-size:0.88rem; margin-bottom:1rem;">
          <div><strong>Date:</strong> ${formattedDate}</div>
          <div><strong>Day:</strong> ${dayName}</div>
          <div><strong>Applicable To:</strong> ${applicableTo}</div>
        </div>
      </div>
    `;

    UIService.openModal(
      "Weekly Off Notice",
      dialogHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        { text: 'Continue if authorized', className: 'btn-primary', onClick: () => { UIService.closeModal(); onProceed(); } }
      ]
    );
  },

  /**
   * DELETE SCHEDULED SLOT CONFIRMATION MODAL
   */
  confirmDeleteModal(id) {
    const entry = TimetableService.getTimetableById(id);
    if (!entry) return;

    const subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : DataStore.get('SUBJECTS') || [];
    const faculty = typeof facultyService !== 'undefined' ? facultyService.getFaculty() : DataStore.get('FACULTY') || [];
    const classes = typeof classService !== 'undefined' ? classService.getClasses() : DataStore.get('CLASSES') || [];

    const sub = subjects.find(s => s.id === entry.subjectId);
    const fac = faculty.find(f => f.id === entry.facultyId);
    const cls = classes.find(c => c.id === entry.sectionId);

    const formattedDate = AcademicCalendarService.formatDate(entry.date);
    const calculatedDay = AcademicCalendarService.getDayName(entry.date) || entry.day;

    const dialogHtml = `
      <div style="padding:0.5rem 0;">
        <h3 style="font-size:1.1rem; font-weight:800; color:var(--color-navy-dark); margin:0 0 1rem 0;">Delete Scheduled Slot?</h3>

        <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:1rem; border-radius:8px; font-size:0.88rem; display:grid; grid-template-columns:1fr 1fr; gap:0.5rem 1rem; margin-bottom:1.25rem;">
          <div><strong style="color:var(--color-text-muted);">Date:</strong> ${formattedDate || entry.date}</div>
          <div><strong style="color:var(--color-text-muted);">Day:</strong> ${calculatedDay}</div>
          <div><strong style="color:var(--color-text-muted);">Time:</strong> ${entry.startTime} – ${entry.endTime}</div>
          <div><strong style="color:var(--color-text-muted);">Subject:</strong> ${sub ? sub.name : entry.subjectId}</div>
          <div><strong style="color:var(--color-text-muted);">Faculty:</strong> ${fac ? fac.name : entry.facultyId}</div>
          <div><strong style="color:var(--color-text-muted);">Section:</strong> ${cls ? cls.name : entry.sectionId}</div>
          <div><strong style="color:var(--color-text-muted);">Room:</strong> ${entry.room || '301'}</div>
        </div>

        <p style="font-size:0.85rem; color:var(--color-danger); margin:0; font-weight:600;">
          ⚠ This action will permanently remove this slot from the timetable.
        </p>
      </div>
    `;

    UIService.openModal(
      "Confirm Delete Slot",
      dialogHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Delete',
          className: 'btn-primary',
          style: 'background:#EF4444; border-color:#EF4444;',
          onClick: () => {
            try {
              TimetableService.deleteTimetableEntry(id);
              UIService.showToast("Scheduled slot deleted successfully.", "info");
              UIService.closeModal();
              this.renderScheduledSlotsTabOnly();
            } catch (err) {
              UIService.showToast(err.message, "danger");
            }
          }
        }
      ]
    );
  }
};

window.TimetableView = TimetableView;


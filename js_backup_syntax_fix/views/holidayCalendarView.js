/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - HOLIDAY CALENDAR VIEW CONTROLLER
   ========================================================================== */

const HolidayCalendarView = {
  viewMode: 'calendar', // 'calendar' | 'list'
  filterType: 'ALL',
  
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  isLoading: false,
  hasLoadedGoogleEvents: false,
  errorLoadingGoogleEvents: null,

  async fetchGoogleEvents() {
    this.isLoading = true;
    App.renderCurrentView();

    try {
      if (window.GoogleCalendarService) {
        await window.GoogleCalendarService.syncEventsToMemory();
      }
      this.hasLoadedGoogleEvents = true;
      this.errorLoadingGoogleEvents = null;
    } catch (e) {
      this.hasLoadedGoogleEvents = true;
      this.errorLoadingGoogleEvents = "Unable to load external calendar events. Please try again later.";
    }

    this.isLoading = false;
    App.renderCurrentView();
  },

  changeMonth(delta) {
    this.currentMonth += delta;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    App.renderCurrentView();
  },

  setToday() {
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    App.renderCurrentView();
  },

  render(params = {}) {
    const user = authService.getCurrentUser();
    if (!user) return `<div>Please log in.</div>`;

    if (!this.hasLoadedGoogleEvents && !this.isLoading) {
      // Async fetch without returning immediately, rely on re-render
      setTimeout(() => this.fetchGoogleEvents(), 0);
    }

    if (this.isLoading) {
      return `
        <div class="page-header" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem;">
          <div>
            <h1>HOLIDAY CALENDAR</h1>
            <p>Official Academic & Institutional Holidays list for Poornima Group of Education.</p>
          </div>
        </div>
        <div style="padding: 3rem; text-align: center; color: var(--color-text-muted);">
           <i data-lucide="loader" class="spin" style="width:32px; height:32px; margin-bottom:1rem; display:inline-block; animation: spin 2s linear infinite;"></i>
           <p style="font-size:1.1rem; font-weight:600;">Loading academic calendar...</p>
        </div>
        <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
      `;
    }

    const holidays = HolidayService.getAllHolidays();
    const isAdmin = user.role === 'ADMIN';

    let filtered = holidays.filter(h => isAdmin || h.status === 'ACTIVE' || h.status === 'GOOGLE_EVENT');
    if (this.filterType !== 'ALL') {
      filtered = filtered.filter(h => h.type === this.filterType);
    }

    return `
      <div class="page-header" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem;">
        <div>
          <h1>HOLIDAY CALENDAR</h1>
          <p>Official Academic & Institutional Holidays list for Poornima Group of Education.</p>
        </div>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          ${isAdmin ? `
            <button class="btn-primary" onclick="HolidayCalendarView.openAddModal()">
              <i data-lucide="plus-circle"></i> Add Holiday
            </button>
          ` : ''}
          <button class="btn-secondary ${this.viewMode === 'calendar' ? 'active-filter' : ''}" onclick="HolidayCalendarView.setViewMode('calendar')">
            <i data-lucide="calendar"></i> Calendar View
          </button>
          <button class="btn-secondary ${this.viewMode === 'list' ? 'active-filter' : ''}" onclick="HolidayCalendarView.setViewMode('list')">
            <i data-lucide="list"></i> List View
          </button>
        </div>
      </div>

      ${this.errorLoadingGoogleEvents ? `
        <div style="background:#FEE2E2; color:#B91C1C; padding:1rem; border-radius:8px; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem; font-weight:600;">
          <i data-lucide="alert-triangle"></i>
          ${this.errorLoadingGoogleEvents}
        </div>
      ` : ''}

      <!-- FILTER BAR -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center;">
          <span style="font-weight:600; font-size:0.85rem; margin-right:0.5rem;">Filter Category:</span>
          <button class="btn-secondary ${this.filterType === 'ALL' ? 'active-filter' : ''}" onclick="HolidayCalendarView.setFilter('ALL')">All Events</button>
          <button class="btn-secondary ${this.filterType === 'NATIONAL' ? 'active-filter' : ''}" onclick="HolidayCalendarView.setFilter('NATIONAL')">National</button>
          <button class="btn-secondary ${this.filterType === 'FESTIVAL' ? 'active-filter' : ''}" onclick="HolidayCalendarView.setFilter('FESTIVAL')">Festivals</button>
          <button class="btn-secondary ${this.filterType === 'COLLEGE' ? 'active-filter' : ''}" onclick="HolidayCalendarView.setFilter('COLLEGE')">College Events</button>
          <button class="btn-secondary ${this.filterType === 'ACADEMIC' ? 'active-filter' : ''}" onclick="HolidayCalendarView.setFilter('ACADEMIC')">Academic</button>
          <button class="btn-secondary ${this.filterType === 'OTHER' ? 'active-filter' : ''}" onclick="HolidayCalendarView.setFilter('OTHER')">Other</button>
        </div>
      </div>

      <!-- CONTENT DISPLAY -->
      ${this.viewMode === 'calendar' ? this.renderCalendarGrid(filtered) : this.renderHolidayList(filtered, isAdmin)}
    `;
  },

  renderCalendarGrid(holidays) {
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    
    // Calculate calendar days
    const firstDayObj = new Date(this.currentYear, this.currentMonth, 1);
    let startDayOffset = firstDayObj.getDay() - 1; 
    if (startDayOffset === -1) startDayOffset = 6; // Make Monday=0, Sunday=6

    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const monthStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}`;

    const monthHolidaysMap = {};
    holidays.forEach(h => {
      if (h.date.startsWith(monthStr)) {
        const dayNum = parseInt(h.date.split('-')[2], 10);
        // Group by day to allow multiple events per day
        if (!monthHolidaysMap[dayNum]) monthHolidaysMap[dayNum] = [];
        monthHolidaysMap[dayNum].push(h);
      }
    });

    const now = new Date();
    const isCurrentMonth = now.getFullYear() === this.currentYear && now.getMonth() === this.currentMonth;
    const todayNum = now.getDate();

    return `
      <div class="card">
        <div class="card-header" style="text-align:center; display:flex; justify-content:space-between; align-items:center; padding-bottom:1rem;">
          <button class="btn-icon" onclick="HolidayCalendarView.changeMonth(-1)" title="Previous Month"><i data-lucide="chevron-left"></i></button>
          <div style="display:flex; flex-direction:column; align-items:center;">
             <h2 style="font-size:1.25rem; font-weight:800; color:var(--color-navy-dark); margin:0;">${monthNames[this.currentMonth]} ${this.currentYear}</h2>
             <button class="btn-link" style="font-size:0.75rem; color:var(--color-primary); border:none; background:none; cursor:pointer;" onclick="HolidayCalendarView.setToday()">Go to Today</button>
          </div>
          <button class="btn-icon" onclick="HolidayCalendarView.changeMonth(1)" title="Next Month"><i data-lucide="chevron-right"></i></button>
        </div>

        <div class="calendar-grid-container" style="overflow-x:auto;">
          <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:6px; min-width:320px; text-align:center;">
            ${weekDays.map(d => `
              <div style="font-weight:700; font-size:0.8rem; color:var(--color-text-muted); padding:0.5rem; background:#F8FAFC; border-radius:4px;">${d}</div>
            `).join('')}

            ${Array(startDayOffset).fill(0).map(() => `
              <div style="padding:1rem; background:#FAFAFA; border-radius:6px; opacity:0.3;"></div>
            `).join('')}

            ${Array(daysInMonth).fill(0).map((_, i) => {
              const day = i + 1;
              const hols = monthHolidaysMap[day] || [];
              const isToday = isCurrentMonth && day === todayNum;
              
              // Calculate day of week index to visually distinct Saturday and Sunday
              const dow = (startDayOffset + i) % 7;
              const isWeekend = (dow === 5 || dow === 6); // Sat or Sun
              
              const hasEvents = hols.length > 0;
              
              // Distinct visual if it's weekend
              let bg = isToday ? '#EFF6FF' : (isWeekend ? '#F8FAFC' : '#FFFFFF');
              let border = isToday ? '#2563EB' : (isWeekend ? '#E2E8F0' : '#E2E8F0');
              
              if (hasEvents) {
                 bg = '#FEF3C7';
                 border = '#FDE68A';
              }

              return `
                <div 
                  style="
                    min-height:85px; 
                    padding:0.5rem; 
                    border-radius:8px; 
                    border: 1px solid ${border}; 
                    background: ${bg};
                    display:flex; 
                    flex-direction:column; 
                    text-align:left;
                    overflow:hidden;
                  "
                >
                  <div style="font-weight:700; font-size:0.85rem; color:${hasEvents ? '#92400E' : isToday ? '#1E40AF' : (isWeekend ? '#94A3B8' : 'var(--color-navy-dark)')}; display:flex; justify-content:space-between;">
                    <span>${day}</span>
                    ${isToday ? '<span style="font-size:0.65rem; background:#2563EB; color:#FFF; padding:1px 4px; border-radius:4px;">TODAY</span>' : ''}
                  </div>
                  
                  <div style="flex:1; margin-top:4px; overflow-y:auto; padding-right:2px; display:flex; flex-direction:column; gap:4px;">
                    ${isWeekend && !hasEvents ? `<div style="font-size:0.7rem; color:#94A3B8; text-align:center; margin-top:8px;">WEEKEND OFF</div>` : ''}
                    
                    ${hols.map(hol => `
                      <div 
                        onclick="HolidayCalendarView.openHolidayDetails('${hol.id}')"
                        style="
                          font-size:0.7rem; 
                          font-weight:700; 
                          color:${hol.source === 'GOOGLE_CALENDAR' ? '#1D4ED8' : '#B45309'}; 
                          background:${hol.source === 'GOOGLE_CALENDAR' ? '#DBEAFE' : 'transparent'};
                          padding:${hol.source === 'GOOGLE_CALENDAR' ? '4px' : '0'};
                          border-radius:4px;
                          line-height:1.2; 
                          word-break:break-word;
                          cursor:pointer;
                          margin-bottom:2px;
                        ">
                        ${hol.source === 'GOOGLE_CALENDAR' ? '📅' : '🎉'} ${hol.name}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  renderHolidayList(holidays, isAdmin) {
    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="calendar"></i> Holiday List (${holidays.length})</h3>
        </div>

        ${holidays.length === 0 ? `
          <div style="padding:2rem; text-align:center; color:var(--color-text-muted);">
            No holidays found.
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Holiday Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  ${isAdmin ? '<th>Status</th><th>Actions</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${holidays.map(h => `
                  <tr>
                    <td><strong>${h.date}</strong></td>
                    <td><strong style="color:var(--color-navy-dark);">${h.name}</strong></td>
                    <td><span class="status-badge active" style="font-size:0.75rem;">${h.type}</span></td>
                    <td>${h.description || 'Institutional Holiday'}</td>
                    ${isAdmin ? `
                      <td><span class="status-badge ${h.status.toLowerCase()}">${h.status}</span></td>
                      <td>
                        <button class="btn-icon" title="Edit" onclick="HolidayCalendarView.openEditModal('${h.id}')"><i data-lucide="edit-2"></i></button>
                        <button class="btn-icon" style="color:var(--color-danger);" title="Delete" onclick="HolidayCalendarView.deleteHoliday('${h.id}')"><i data-lucide="trash-2"></i></button>
                      </td>
                    ` : ''}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  setViewMode(mode) {
    this.viewMode = mode;
    App.renderCurrentView();
  },

  setFilter(type) {
    this.filterType = type;
    App.renderCurrentView();
  },

  openHolidayDetails(id) {
    const hol = HolidayService.getHolidayById(id);
    if (!hol) return;

    UIService.openModal(
      `🎉 ${hol.name}`,
      `
        <div style="line-height:1.6;">
          <p><strong>Date:</strong> ${hol.date}</p>
          <p><strong>Category:</strong> <span class="status-badge active">${hol.type}</span></p>
          <p><strong>Description:</strong></p>
          <div style="background:#F8FAFC; padding:0.75rem; border-radius:6px; font-size:0.9rem;">
            ${hol.description || 'No specific details.'}
          </div>
        </div>
      `
    );
  },

  openAddModal() {
    const modalHtml = `
      <form id="add-holiday-form" onsubmit="return false;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Holiday Name *</label>
            <input type="text" id="hol-name" class="form-input" placeholder="e.g. Republic Day" required style="padding-left:1rem;">
          </div>
          <div class="form-group">
            <label class="form-label">Date *</label>
            <input type="date" id="hol-date" class="form-input" required style="padding-left:1rem; width:100%; font-family:inherit;">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">Type *</label>
            <select id="hol-type" class="form-select" style="width:100%; padding:0.5rem; border:1px solid var(--color-border); border-radius:4px; font-family:inherit;" required>
              <option value="" disabled selected>Select Type ▼</option>
              <option value="NATIONAL">NATIONAL</option>
              <option value="FESTIVAL">FESTIVAL</option>
              <option value="COLLEGE">COLLEGE</option>
              <option value="ACADEMIC">ACADEMIC</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Applicable To *</label>
            <select id="hol-applicable" class="form-select" style="width:100%; padding:0.5rem; border:1px solid var(--color-border); border-radius:4px; font-family:inherit;">
              <option value="ALL">All (Students & Faculty)</option>
              <option value="STUDENTS">Students Only</option>
              <option value="FACULTY">Faculty Only</option>
            </select>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Description</label>
          <textarea id="hol-desc" class="form-input" rows="2" placeholder="Brief event notes..." style="padding-left:1rem; width:100%;"></textarea>
        </div>
      </form>
    `;

    UIService.openModal(
      "Add New Holiday",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Add Holiday',
          className: 'btn-primary',
          onClick: () => {
            const name = document.getElementById('hol-name').value;
            const date = document.getElementById('hol-date').value;
            const type = document.getElementById('hol-type').value;
            const description = document.getElementById('hol-desc').value;

            try {
              HolidayService.createHoliday({ name, date, type, description });
              UIService.showToast("Holiday added to calendar!", "success");
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

  openEditModal(id) {
    const hol = HolidayService.getHolidayById(id);
    if (!hol) return;

    const modalHtml = `
      <form id="edit-holiday-form">
        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Holiday Name</label>
          <input type="text" id="edit-hol-name" class="form-control" value="${hol.name}" required>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label class="form-label">Date</label>
            <input type="date" id="edit-hol-date" class="form-control" value="${hol.date}">
          </div>
          <div>
            <label class="form-label">Type</label>
            <select id="edit-hol-type" class="form-control">
              <option value="NATIONAL" ${hol.type === 'NATIONAL' ? 'selected' : ''}>NATIONAL</option>
              <option value="FESTIVAL" ${hol.type === 'FESTIVAL' ? 'selected' : ''}>FESTIVAL</option>
              <option value="COLLEGE" ${hol.type === 'COLLEGE' ? 'selected' : ''}>COLLEGE</option>
              <option value="ACADEMIC" ${hol.type === 'ACADEMIC' ? 'selected' : ''}>ACADEMIC</option>
              <option value="OTHER" ${hol.type === 'OTHER' ? 'selected' : ''}>OTHER</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Description</label>
          <textarea id="edit-hol-desc" class="form-control" rows="2">${hol.description || ''}</textarea>
        </div>
      </form>
    `;

    UIService.openModal(
      "EDIT HOLIDAY",
      modalHtml,
      [
        { text: 'Cancel', className: 'btn-secondary', onClick: () => UIService.closeModal() },
        {
          text: 'Save Changes',
          className: 'btn-primary',
          onClick: () => {
            const name = document.getElementById('edit-hol-name').value;
            const date = document.getElementById('edit-hol-date').value;
            const type = document.getElementById('edit-hol-type').value;
            const description = document.getElementById('edit-hol-desc').value;

            try {
              HolidayService.updateHoliday(id, { name, date, type, description });
              UIService.showToast("Holiday updated successfully!", "success");
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

  deleteHoliday(id) {
    UIService.showConfirm("Delete Holiday", "Are you sure you want to remove this holiday?", () => {
      HolidayService.deleteHoliday(id);
      UIService.showToast("Holiday deleted.", "info");
      App.renderCurrentView();
    });
  }
};

window.HolidayCalendarView = HolidayCalendarView;

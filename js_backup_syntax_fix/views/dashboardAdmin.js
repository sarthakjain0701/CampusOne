/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM - ADMIN DASHBOARD (SERVICE CONNECTED)
   ========================================================================== */

const DashboardAdmin = {
  render() {
    const user = authService.getCurrentUser();
    const students = studentService.getStudents();
    const faculty = facultyService.getFaculty();
    const subjects = subjectService.getSubjects();
    const classes = classService.getClasses();

    return `
      <div class="page-header">
        <h1>Welcome back, ${user ? user.name : 'Admin'}! 👋</h1>
        <p>Here's what's happening across Poornima Attendance System today.</p>
      </div>

      <!-- STATISTIC CARDS (DYNAMICALLY CALCULATED FROM MOCK SERVICES) -->
      <div class="stats-grid">
        <div class="stat-card" onclick="App.navigateTo('students')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Total Students</h3>
            <div class="value">${students.length}</div>
            <span class="stat-trend positive"><i data-lucide="trending-up"></i> Active Enrolled</span>
          </div>
          <div class="stat-icon blue">
            <i data-lucide="graduation-cap"></i>
          </div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('faculty')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Total Faculty</h3>
            <div class="value">${faculty.length}</div>
            <span class="stat-trend positive"><i data-lucide="trending-up"></i> Active Instructors</span>
          </div>
          <div class="stat-icon purple">
            <i data-lucide="users"></i>
          </div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('subjects')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Total Subjects</h3>
            <div class="value">${subjects.length}</div>
            <span class="stat-trend positive"><i data-lucide="check-circle"></i> Active Courses</span>
          </div>
          <div class="stat-icon green">
            <i data-lucide="book-open"></i>
          </div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('classes')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Total Classes</h3>
            <div class="value">${classes.length}</div>
            <span class="stat-trend positive"><i data-lucide="award"></i> Active Sections</span>
          </div>
          <div class="stat-icon amber">
            <i data-lucide="layers"></i>
          </div>
        </div>
      </div>

      <!-- ACADEMIC SERVICES SUMMARY CARDS (BATCH 1) -->
      <div class="stats-grid" style="margin-bottom:1.5rem;">
        <div class="stat-card" onclick="App.navigateTo('digital-learning')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Learning Resources</h3>
            <div class="value">${MOCK_DATA.learningResources ? MOCK_DATA.learningResources.length : 0}</div>
            <span class="stat-trend positive"><i data-lucide="book-open"></i> Uploaded Materials</span>
          </div>
          <div class="stat-icon blue"><i data-lucide="file-text"></i></div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('timetable')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Timetable Entries</h3>
            <div class="value">${MOCK_DATA.timetables ? MOCK_DATA.timetables.length : 0}</div>
            <span class="stat-trend positive"><i data-lucide="calendar"></i> Scheduled Slots</span>
          </div>
          <div class="stat-icon purple"><i data-lucide="clock"></i></div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('exam-results')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Published Results</h3>
            <div class="value">${MOCK_DATA.examResults ? MOCK_DATA.examResults.filter(r => r.status === 'PUBLISHED').length : 0}</div>
            <span class="stat-trend positive"><i data-lucide="award"></i> Official Grade Cards</span>
          </div>
          <div class="stat-icon green"><i data-lucide="award"></i></div>
        </div>

        <div class="stat-card" onclick="App.navigateTo('holiday-calendar')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Upcoming Holidays</h3>
            <div class="value">${MOCK_DATA.holidays ? MOCK_DATA.holidays.filter(h => h.date >= new Date().toISOString().split('T')[0]).length : 0}</div>
            <span class="stat-trend warning"><i data-lucide="flag"></i> Academic Calendar</span>
          </div>
          <div class="stat-icon amber"><i data-lucide="calendar-days"></i></div>
        </div>


      </div>

      <!-- ACADEMIC & LIBRARY SERVICES SUMMARY (BATCH 3) -->
      <div class="stats-grid" style="margin-bottom:1.5rem; grid-template-columns: 1fr 1fr !important;">
        <div class="stat-card" onclick="App.navigateTo('exam-form-management')" style="cursor:pointer;">
          <div class="stat-info">
            <h3>Pending Exam Forms</h3>
            <div class="value" style="color:${window.ExamFormService && ExamFormService.getAllSubmissions().filter(f => f.status === 'SUBMITTED').length > 0 ? 'var(--color-warning)' : 'var(--color-navy-dark)'}; font-size:1.4rem;">
              ${window.ExamFormService ? ExamFormService.getAllSubmissions().filter(f => f.status === 'SUBMITTED').length : 0}
            </div>
            <span class="stat-trend warning"><i data-lucide="file-check"></i> Pending Admin Review</span>
          </div>
          <div class="stat-icon purple"><i data-lucide="file-signature"></i></div>
        </div>

        <div class="stat-card" style="cursor:default;">
          <div class="stat-info">
            <h3>Outstanding Fines</h3>
            <div class="value" style="color:var(--color-danger); font-size:1.4rem;">
              ₹${window.LibraryService ? LibraryService.getAllRecords().filter(r => r.fineStatus === 'UNPAID').reduce((sum, r) => sum + r.fineAmount, 0) : 0}
            </div>
            <span class="stat-trend negative"><i data-lucide="indian-rupee"></i> Total Unpaid Library Fines</span>
          </div>
          <div class="stat-icon red"><i data-lucide="alert-triangle"></i></div>
        </div>
      </div>

      <!-- MAIN CONTENT GRID -->
      <div class="dashboard-grid">
        <!-- LEFT LARGE CARD: Attendance Overview Chart -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title"><i data-lucide="activity"></i> Attendance Overview</h3>
              <p class="card-subtitle">Weekly institution-wide attendance trend (%)</p>
            </div>
            <div class="filter-group">
              <span class="status-badge active"><i data-lucide="check"></i> 86.4% Avg Today</span>
            </div>
          </div>
          <div style="height: 300px; position: relative;">
            <canvas id="adminAttendanceChart"></canvas>
          </div>
        </div>

        <!-- RIGHT CARD: Recent Activities Feed -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><i data-lucide="bell"></i> Recent Activities</h3>
          </div>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon" style="background: #EFF6FF; color: #2563EB;">
                <i data-lucide="check-square"></i>
              </div>
              <div class="activity-content">
                <p>Attendance marked for CSE-A (Data Structures)</p>
                <span>Today at 10:15 AM by Dr. Rajesh Kumar</span>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon" style="background: #ECFDF5; color: #10B981;">
                <i data-lucide="user-plus"></i>
              </div>
              <div class="activity-content">
                <p>New Student profile added: Rahul Sharma</p>
                <span>Yesterday at 04:20 PM</span>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon" style="background: #FFFBEB; color: #F59E0B;">
                <i data-lucide="alert-triangle"></i>
              </div>
              <div class="activity-content">
                <p>Low attendance alert generated for 2 students</p>
                <span>12 Aug, 02:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- QUICK ACTIONS SECTION -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><i data-lucide="zap"></i> Quick Administrative Actions</h3>
        </div>
        <div class="quick-actions-grid">
          <button class="quick-action-btn" onclick="App.navigateTo('students')">
            <i data-lucide="user-plus"></i>
            <span>Add Student</span>
          </button>
          <button class="quick-action-btn" onclick="App.navigateTo('faculty')">
            <i data-lucide="user-check"></i>
            <span>Add Faculty</span>
          </button>
          <button class="quick-action-btn" onclick="App.navigateTo('subjects')">
            <i data-lucide="book-plus"></i>
            <span>Add Subject</span>
          </button>
          <button class="quick-action-btn" onclick="App.navigateTo('classes')">
            <i data-lucide="folder-plus"></i>
            <span>Add Class</span>
          </button>
          <button class="quick-action-btn" onclick="App.navigateTo('assignments')">
            <i data-lucide="link"></i>
            <span>Assign Faculty</span>
          </button>
          <button class="quick-action-btn" onclick="App.navigateTo('reports')">
            <i data-lucide="file-text"></i>
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    `;
  },

  initCharts() {
    const ctx = document.getElementById('adminAttendanceChart');
    if (!ctx) return;

    if (window.Chart) {
      new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [{
            label: 'Attendance Rate (%)',
            data: [82, 88, 85, 90, 86, 84],
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#2563EB'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 60, max: 100, grid: { color: '#F1F5F9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  }
};

window.DashboardAdmin = DashboardAdmin;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - MAIN APPLICATION ROUTER
   Supports 5 roles: STUDENT, FACULTY, LAB_ASSISTANT, LIBRARIAN, ADMIN
   ========================================================================== */

const App = {
  currentView: 'dashboard',
  viewParams: {},
  mobileSidebarOpen: false,

  init() {
    console.log("Initializing Poornima Attendance System...");
    // Eagerly initialize Firebase so Firestore is ready for all views
    if (window.FirebaseService && window.FirebaseService.init) {
      window.FirebaseService.init().catch(err => console.warn("Firebase early init:", err));
    }
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      this.renderLogin();
    } else {
      this.renderMainLayout();
    }
  },

  onLoginSuccess(user) {
    if (user.mustChangePassword) {
      this.currentView = 'change-password';
    } else {
      this.currentView = 'dashboard';
    }
    this.renderMainLayout();
  },

  logout() {
    UIService.showConfirm("Confirm Logout", "Are you sure you want to log out of Poornima Attendance System?", async () => {
      await authService.logout();
      UIService.showToast("Logged out successfully.", "info");
      this.renderLogin();
    });
  },

  renderLogin() {
    const appEl = document.getElementById('app');
    appEl.innerHTML = window.LoginView.render();
    if (window.lucide) window.lucide.createIcons();
  },

  /**
   * Returns a user-friendly display name for role badges and UI text.
   */
  getRoleDisplayName(role) {
    const map = {
      'STUDENT': 'Student',
      'FACULTY': 'Faculty',
      'LAB_ASSISTANT': 'Lab Assistant',
      'LIBRARIAN': 'Librarian',
      'ADMIN': 'Admin'
    };
    return map[role] || role;
  },

  renderMainLayout() {
    const user = authService.getCurrentUser();
    if (!user) {
      this.renderLogin();
      return;
    }

    const appEl = document.getElementById('app');
    const sidebarMenu = this.getNavigationForRole(user.role);
    const roleDisplayName = this.getRoleDisplayName(user.role);

    const unreadCount = notificationService.getUnreadCount(user);
    const badgeText = notificationService.getBadgeText(user);

    appEl.innerHTML = `
      <div class="main-layout">
        <!-- SIDEBAR DRAWER OVERLAY -->
        <div class="sidebar-overlay" id="sidebar-overlay" onclick="App.toggleMobileSidebar()"></div>

        <!-- SIDEBAR -->
        <aside class="sidebar ${this.mobileSidebarOpen ? 'mobile-open' : ''}" id="sidebar">
          <div class="sidebar-header" style="padding: 1rem 1.25rem;">
            ${LogoComponent.render({ variant: 'full', theme: 'dark', size: 'small' })}
            <span class="role-badge ${user.role.toLowerCase().replace('_', '-')}" style="margin-left: auto;">${roleDisplayName}</span>
          </div>

          <div class="sidebar-menu">
            <div class="menu-category">Main Menu</div>
            ${sidebarMenu.map(item => `
              <a href="#" class="nav-item ${this.currentView === item.id ? 'active' : ''}" onclick="App.navigateTo('${item.id}'); return false;">
                <i data-lucide="${item.icon}"></i>
                <span>${item.label}</span>
              </a>
            `).join('')}
          </div>

          <div class="sidebar-footer">
            <a href="#" class="nav-item" onclick="App.logout(); return false;" style="color: #FCA5A5;">
              <i data-lucide="log-out"></i>
              <span>Logout</span>
            </a>
          </div>
        </aside>

        <!-- MAIN WRAPPER -->
        <div class="main-wrapper">
          <!-- NAVBAR -->
          <header class="navbar">
            <div class="navbar-left">
              <button class="btn-toggle-sidebar" onclick="App.toggleMobileSidebar()">
                <i data-lucide="menu"></i>
              </button>
              <div class="page-title">${this.getPageTitle()}</div>
            </div>

            <div class="navbar-right">
              <div class="search-box">
                <i data-lucide="search"></i>
                <input type="text" class="search-input" placeholder="Global search..." onkeyup="App.handleGlobalSearch(this.value)">
              </div>

              <!-- NOTIFICATION BELL WITH BADGE -->
              <div style="position:relative;">
                <button class="nav-icon-btn" onclick="App.toggleNotificationDropdown(event)" aria-label="Notifications (${unreadCount} unread)" title="Notifications">
                  <i data-lucide="bell"></i>
                  ${unreadCount > 0 ? `<span style="position:absolute; top:-2px; right:-2px; background:#EF4444; color:white; font-size:0.68rem; font-weight:800; padding:0.1rem 0.35rem; border-radius:10px; border:2px solid white; min-width:18px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.15);">${badgeText}</span>` : ''}
                </button>

                <!-- NOTIFICATION DROPDOWN MENU -->
                <div id="pams-notif-dropdown" style="display:none; position:absolute; right:0; top:48px; width:360px; max-width:90vw; background:white; border-radius:14px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04); border:1px solid var(--color-border); z-index:1000; overflow:hidden; animation:fadeIn 0.15s ease-out;">
                  <div style="padding:1rem 1.25rem; background:var(--color-navy-dark); color:white; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:800; font-size:0.95rem;">Notifications (${unreadCount} unread)</div>
                    <a href="#" onclick="App.navigateTo('notifications'); App.closeNotificationDropdown(); return false;" style="color:#60A5FA; font-size:0.8rem; font-weight:700; text-decoration:none;">View All</a>
                  </div>

                  <div style="max-height:360px; overflow-y:auto; padding:0.5rem 0;">
                    ${this.renderNotificationDropdownItems(user)}
                  </div>

                  <div style="padding:0.75rem; background:#F8FAFC; border-top:1px solid var(--color-border); text-align:center;">
                    <button class="btn-xs btn-primary" onclick="App.navigateTo('notifications'); App.closeNotificationDropdown();" style="width:100%; justify-content:center; padding:0.5rem; font-weight:700;">
                      Go to Notification Center
                    </button>
                  </div>
                </div>
              </div>

              <div class="user-profile-menu" onclick="App.navigateTo('profile')">
                <div class="avatar">${user.name.charAt(0)}</div>
                <div class="user-info-text">
                  <div class="name">${user.name}</div>
                  <div class="role">${roleDisplayName}</div>
                </div>
                <i data-lucide="chevron-down" style="font-size: 14px; color: var(--color-text-muted);"></i>
              </div>
            </div>
          </header>

          <!-- VIEWPORT CONTAINER -->
          <main class="content-area" id="view-container">
            ${this.getViewHtml()}
          </main>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.postRenderView();
  },

  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) {
      if (this.mobileSidebarOpen) {
        sidebar.classList.add('mobile-open');
        if (overlay) overlay.classList.add('active');
      } else {
        sidebar.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
      }
    }
  },

  navigateTo(viewId, params = {}) {
    const user = authService.getCurrentUser();
    if (!user) {
      this.renderLogin();
      return;
    }

    // Role Protection Check
    const allowedNavigation = this.getNavigationForRole(user.role);
    let isAllowed = viewId === 'change-password' || allowedNavigation.some(item => item.id === viewId);
    
    // Hidden route: Students can access mark-attendance for VIEW mode only
    if (viewId === 'mark-attendance' && user.role === 'STUDENT') {
      isAllowed = true;
    }

    if (!isAllowed) {
      // For settings specifically, show the access denied view rather than a toast
      if (viewId === 'settings') {
        this.currentView = '__access_denied_settings__';
      } else {
        UIService.showToast("Access Denied: You are not authorized to access this page.", "danger");
        this.currentView = 'dashboard';
      }
    } else {
      this.currentView = viewId;
      this.viewParams = params;
    }

    this.mobileSidebarOpen = false;
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
    
    this.renderMainLayout();
  },

  renderCurrentView() {
    const container = document.getElementById('view-container');
    if (container) {
      container.innerHTML = this.getViewHtml();
      if (window.lucide) window.lucide.createIcons();
      this.postRenderView();
    }
  },

  getNavigationForRole(role) {
    if (role === 'LIBRARIAN') {
      return [
        { id: 'library-dashboard', label: 'Dashboard', icon: 'layout-dashboard', roles: ['LIBRARIAN'] },
        { id: 'library-books', label: 'Books & Inventory', icon: 'book', roles: ['LIBRARIAN'] },
        { id: 'library-circulation', label: 'Circulation', icon: 'rotate-ccw', roles: ['LIBRARIAN'] },
        { id: 'library-members', label: 'Members', icon: 'users', roles: ['LIBRARIAN'] },
        { id: 'library-reservations', label: 'Reservations', icon: 'calendar-clock', roles: ['LIBRARIAN'] },
        { id: 'library-fines', label: 'Fines & Payments', icon: 'indian-rupee', roles: ['LIBRARIAN'] },
        { id: 'library-reports', label: 'Reports', icon: 'bar-chart', roles: ['LIBRARIAN'] },
        { id: 'library-settings', label: 'Settings', icon: 'settings', roles: ['LIBRARIAN'] },
        { id: 'notifications', label: 'Notifications', icon: 'bell', roles: ['LIBRARIAN'] },
        { id: 'profile', label: 'User Profile', icon: 'user', roles: ['LIBRARIAN'] }
      ];
    }

    const allItems = [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', roles: ['ADMIN', 'FACULTY', 'LAB_ASSISTANT', 'STUDENT'] },
      { id: 'mark-attendance', label: 'Attendance', icon: 'check-square', roles: ['ADMIN', 'FACULTY', 'LAB_ASSISTANT'] },
      { id: 'attendance-history', label: 'Attendance History', icon: 'history', roles: ['ADMIN', 'FACULTY', 'LAB_ASSISTANT', 'STUDENT'] },
      { id: 'attendance-assignments', label: 'Faculty Attendance Assignments', icon: 'calendar-check', roles: ['ADMIN'] },
      { id: 'digital-learning', label: 'Digital Learning', icon: 'book-open', roles: ['ADMIN', 'FACULTY', 'LAB_ASSISTANT', 'STUDENT'] },
      { id: 'timetable', label: 'Timetable', icon: 'calendar', roles: ['ADMIN', 'FACULTY', 'LAB_ASSISTANT', 'STUDENT'] },
      { id: 'exam-results', label: 'Exam Results', icon: 'award', roles: ['ADMIN', 'STUDENT'] },
      { id: 'mid-term-marks', label: 'Mid-Term Marks', icon: 'file-spreadsheet', roles: ['ADMIN', 'FACULTY', 'LAB_ASSISTANT', 'STUDENT'] },
      { id: 'hall-ticket', label: 'Hall Ticket', icon: 'ticket', roles: ['STUDENT'] },
      { id: 'holiday-calendar', label: 'Holiday Calendar', icon: 'calendar-days', roles: ['ADMIN', 'FACULTY', 'LAB_ASSISTANT', 'STUDENT'] },
      { id: 'library', label: 'Library Portal', icon: 'book', roles: ['ADMIN', 'STUDENT'] },
      { id: 'exam-form', label: 'Exam Form', icon: 'file-text', roles: ['STUDENT'] },
      { id: 'digital-id', label: 'Digital ID Card', icon: 'id-card', roles: ['ADMIN', 'FACULTY', 'LAB_ASSISTANT', 'STUDENT'] },
      { id: 'exam-form-management', label: 'Exam Form Management', icon: 'check-square', roles: ['ADMIN'] },
      { id: 'students', label: 'Students', icon: 'graduation-cap', roles: ['ADMIN'] },
      { id: 'faculty', label: 'Staff Management', icon: 'users', roles: ['ADMIN'] },
      { id: 'admin-management', label: 'Admin Management', icon: 'shield', roles: ['ADMIN'] },
      { id: 'departments', label: 'Departments', icon: 'building-2', roles: ['ADMIN'] },
      { id: 'subjects', label: 'Subjects', icon: 'book-text', roles: ['ADMIN'] },
      { id: 'classes', label: 'Classes', icon: 'layers', roles: ['ADMIN'] },
      { id: 'reports', label: 'Reports & Analytics', icon: 'file-text', roles: ['ADMIN', 'FACULTY', 'LAB_ASSISTANT'] },
      { id: 'notifications', label: 'Notifications', icon: 'bell', roles: ['ADMIN', 'FACULTY', 'LAB_ASSISTANT', 'STUDENT'] },
      { id: 'profile', label: 'User Profile', icon: 'user', roles: ['ADMIN', 'FACULTY', 'LAB_ASSISTANT', 'STUDENT'] },
      { id: 'settings', label: 'System Settings', icon: 'settings', roles: ['ADMIN'] }
    ];

    return allItems.filter(item => item.roles.includes(role));
  },

  getPageTitle() {
    const user = authService.getCurrentUser();
    if (this.currentView === 'dashboard') {
      return `${this.getRoleDisplayName(user.role)} Dashboard`;
    }
    const titles = {
      'mark-attendance': 'Mark Attendance',
      'attendance-history': 'Attendance History',
      'attendance-assignments': 'Faculty Attendance Assignments',
      'digital-learning': 'Digital Learning Portal',
      'timetable': 'Semester Timetable',
      'exam-results': 'Examination Results',
      'mid-term-marks': 'Mid-Term Marks',
      'hall-ticket': 'Hall Ticket',
      'holiday-calendar': 'Holiday Calendar',
      'library': 'Library Portal',
      'exam-form': 'Examination Form',
      'digital-id': 'Digital ID Card',
      'exam-form-management': 'Exam Form Management',
      'students': 'Student Management',
      'faculty': 'Staff Management',
      'admin-management': 'Admin Management',
      'departments': 'Department Management',
      'subjects': 'Subject Management',
      'classes': 'Class Management',
      'assignments': 'Faculty Assignment',
      'reports': 'Reports & Analytics',
      'notifications': 'Notification Center',
      'profile': 'User Profile',
      'settings': 'System Settings',
      'change-password': 'Update Password',
      'library-dashboard': 'Library Dashboard',
      'library-books': 'Books & Inventory',
      'library-circulation': 'Circulation Management',
      'library-members': 'Library Members',
      'library-reservations': 'Reservations',
      'library-fines': 'Fines & Payments',
      'library-reports': 'Library Reports',
      'library-settings': 'Library Settings'
    };
    return titles[this.currentView] || 'Poornima Attendance System';
  },

  getViewHtml() {
    const user = authService.getCurrentUser();

    // SETTINGS ACCESS DENIED — Non-Admin blocked from System Settings
    if (this.currentView === '__access_denied_settings__') {
      return `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:5rem 2rem; text-align:center;">
          <div style="width:72px; height:72px; border-radius:50%; background:#FEE2E2; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; box-shadow:0 4px 12px rgba(239,68,68,0.2);">
            <i data-lucide="shield-alert" style="width:36px; height:36px; color:#DC2626;"></i>
          </div>
          <h1 style="font-size:1.8rem; font-weight:800; color:#991B1B; margin:0 0 0.75rem 0;">Access Denied</h1>
          <p style="color:#475569; font-size:1rem; max-width:440px; margin:0 auto 0.5rem auto; line-height:1.6;">
            You are not authorized to access <strong>System Settings</strong>.
          </p>
          <p style="color:#64748B; font-size:0.875rem; max-width:440px; margin:0 auto 2rem auto; line-height:1.6;">
            System Settings are restricted to <strong>Admin</strong> users only.
          </p>
          <button class="btn-primary" onclick="App.navigateTo('dashboard')" style="font-weight:700;">
            <i data-lucide="arrow-left"></i> Return to Dashboard
          </button>
        </div>
      `;
    }

    // DASHBOARD ROUTING — role-specific dashboards
    if (this.currentView === 'dashboard') {
      if (user.role === 'ADMIN') return window.DashboardAdmin.render();
      if (user.role === 'FACULTY' || user.role === 'LAB_ASSISTANT') return window.DashboardFaculty.render();
      if (user.role === 'LIBRARIAN') return window.DashboardLibrarian.render();
      return window.DashboardStudent.render();
    }
    
    if (this.currentView === 'library-dashboard') {
      return window.DashboardLibrarian.render();
    }

    const views = {
      'mark-attendance': window.MarkAttendanceView,
      'attendance-history': window.AttendanceHistoryView,
      'attendance-assignments': window.AttendanceAssignmentsView,
      'digital-learning': window.DigitalLearningView,
      'timetable': window.TimetableView,
      'exam-results': window.ExamResultsView,
      'mid-term-marks': window.MidTermMarksView,
      'hall-ticket': window.HallTicketView,
      'holiday-calendar': window.HolidayCalendarView,
      'library': window.LibraryView,
      'exam-form': window.ExamFormView,
      'digital-id': window.DigitalIdView,
      'exam-form-management': window.ExamFormManagementView,
      'students': window.StudentsView,
      'faculty': window.FacultyView,
      'admin-management': window.AdminManagementView,
      'departments': window.DepartmentsView,
      'subjects': window.SubjectsView,
      'classes': window.ClassesView,
      'assignments': window.AssignmentsView,
      'reports': window.ReportsView,
      'notifications': window.NotificationsView,
      'profile': window.ProfileView,
      'settings': window.SettingsView,
      'change-password': window.ChangePasswordView,
      'library-books': window.LibraryBooksView,
      'library-circulation': window.LibraryCirculationView,
      'library-members': window.LibraryMembersView,
      'library-reservations': window.LibraryReservationsView,
      'library-fines': window.LibraryFinesView,
      'library-reports': window.LibraryReportsView,
      'library-settings': window.LibrarySettingsView
    };

    const targetView = views[this.currentView];
    if (targetView) {
      return targetView.render(this.viewParams);
    }
    return `
      <div style="text-align:center; padding:4rem 2rem;">
        <div style="font-size:4rem; color:var(--color-text-light); margin-bottom:1rem;">🔍</div>
        <h2 style="font-size:1.5rem; font-weight:700; color:var(--color-navy-dark); margin-bottom:0.5rem;">Page Not Found</h2>
        <p style="color:var(--color-text-muted); margin-bottom:1.5rem;">The page you're looking for doesn't exist or has been moved.</p>
        <button class="btn-primary" onclick="App.navigateTo('dashboard')"><i data-lucide="home"></i> Return to Dashboard</button>
      </div>
    `;
  },

  postRenderView() {
    // Clean up real-time Firestore listeners from previous views
    if (this.currentView !== 'students' && window.studentService && window.studentService.stopListening) {
      window.studentService.stopListening();
    }
    if (this.currentView !== 'faculty' && window.facultyService && window.facultyService.stopListening) {
      window.facultyService.stopListening();
    }
    if (this.currentView !== 'admin-management' && window.adminService && window.adminService.stopListening) {
      window.adminService.stopListening();
    }

    const user = authService.getCurrentUser();
    if (this.currentView === 'dashboard') {
      if (user.role === 'ADMIN' && window.DashboardAdmin.initCharts) window.DashboardAdmin.initCharts();
      if ((user.role === 'FACULTY' || user.role === 'LAB_ASSISTANT') && window.DashboardFaculty.initCharts) window.DashboardFaculty.initCharts();
    } else if (this.currentView === 'reports') {
      if (window.ReportsView.postInit) window.ReportsView.postInit();
    } else if (this.currentView === 'students' && window.StudentsView.afterRender) {
      window.StudentsView.afterRender();
    } else if (this.currentView === 'faculty' && window.FacultyView.afterRender) {
      window.FacultyView.afterRender();
    } else if (this.currentView === 'admin-management' && window.AdminManagementView.afterRender) {
      window.AdminManagementView.afterRender();
    }
  },

  handleGlobalSearch(query) {
    if (!query) return;
    console.log("Global search query:", query);
  },

  toggleNotificationDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('pams-notif-dropdown');
    if (!dropdown) return;

    const isOpening = dropdown.style.display === 'none' || !dropdown.style.display;
    dropdown.style.display = isOpening ? 'block' : 'none';
  },

  closeNotificationDropdown() {
    const dropdown = document.getElementById('pams-notif-dropdown');
    if (dropdown) dropdown.style.display = 'none';
  },

  renderNotificationDropdownItems(user) {
    const notifs = notificationService.getNotifications(user).slice(0, 5); // latest 5
    if (notifs.length === 0) {
      return `
        <div style="padding:1.5rem; text-align:center; color:var(--color-text-muted); font-size:0.85rem;">
          <i data-lucide="bell-off" style="width:24px; height:24px; color:var(--color-text-light); margin-bottom:0.25rem;"></i>
          <div>You're all caught up!</div>
        </div>
      `;
    }

    return notifs.map(n => {
      let priorityBadge = `<span style="font-size:0.65rem; font-weight:800; color:#64748B; background:#F1F5F9; padding:0.1rem 0.4rem; border-radius:10px;">LOW</span>`;
      if (n.priority === 'HIGH') {
        priorityBadge = `<span style="font-size:0.65rem; font-weight:800; color:#DC2626; background:#FEF2F2; padding:0.1rem 0.4rem; border-radius:10px;">HIGH</span>`;
      } else if (n.priority === 'MEDIUM') {
        priorityBadge = `<span style="font-size:0.65rem; font-weight:800; color:#D97706; background:#FFFBEB; padding:0.1rem 0.4rem; border-radius:10px;">MEDIUM</span>`;
      }

      return `
        <div onclick="App.handleNotificationClick('${n.id}', '${n.relatedModule || ''}')" style="padding:0.75rem 1.25rem; border-bottom:1px solid var(--color-border-light); cursor:pointer; background:${!n.isRead ? '#F8FAFC' : 'white'}; transition:var(--transition-fast);" onmouseover="this.style.background='#F1F5F9'" onmouseout="this.style.background='${!n.isRead ? '#F8FAFC' : 'white'}'">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.2rem;">
            <div style="display:flex; align-items:center; gap:0.4rem;">
              ${!n.isRead ? `<span style="width:7px; height:7px; background:#2563EB; border-radius:50%; display:inline-block;"></span>` : ''}
              <strong style="font-size:0.85rem; color:var(--color-navy-dark);">${n.title}</strong>
            </div>
            ${priorityBadge}
          </div>
          <div style="font-size:0.78rem; color:var(--color-text-muted); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${n.message}
          </div>
          <div style="font-size:0.7rem; color:var(--color-text-light); margin-top:0.3rem;">
            ${n.createdAt || 'Just now'}
          </div>
        </div>
      `;
    }).join('');
  },

  handleNotificationClick(id, relatedModule) {
    notificationService.markAsRead(id);
    this.closeNotificationDropdown();
    if (relatedModule && relatedModule !== 'null' && relatedModule !== 'undefined') {
      this.navigateTo(relatedModule);
    } else {
      this.navigateTo('notifications');
    }
  }
};

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('pams-notif-dropdown');
  const btn = e.target.closest('.nav-icon-btn');
  if (dropdown && !dropdown.contains(e.target) && !btn) {
    dropdown.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;

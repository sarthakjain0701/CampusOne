/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - NOTIFICATION CENTER
   Role-Based Notification Center with Priority Filters & Module Actions
   ========================================================================== */

const NotificationsView = {
  activeTab: 'ALL', // 'ALL' | 'UNREAD' | 'READ'
  loading: false,
  error: false,

  render() {
    const user = authService.getCurrentUser();
    if (!user) return `<div class="card" style="padding:2rem; text-align:center;">Please log in to view Notification Center.</div>`;

    if (this.loading) {
      return `
        <div class="page-header"><h1>Notification Center</h1></div>
        <div class="card" style="padding: 3rem; text-align: center;">
          <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid #E2E8F0; border-top-color: #2563EB; border-radius: 50%; animation: spin 1s infinite linear;"></div>
          <p style="margin-top: 1rem; color: var(--color-text-muted);">Loading notifications...</p>
        </div>
      `;
    }

    if (this.error) {
      return `
        <div class="page-header"><h1>Notification Center</h1></div>
        <div class="card" style="padding: 3rem; text-align: center;">
          <i data-lucide="alert-triangle" style="width:48px; height:48px; color:var(--color-danger); margin-bottom:1rem;"></i>
          <h3>Unable to load notifications.</h3>
          <p style="color:var(--color-text-muted); margin-bottom:1.5rem;">A network or local storage error occurred.</p>
          <button class="btn-primary" style="margin:0 auto;" onclick="NotificationsView.retryLoad()">Try Again</button>
        </div>
      `;
    }

    const allNotifs = notificationService.getNotifications(user);
    const unreadCount = allNotifs.filter(n => !n.isRead).length;

    let filtered = allNotifs;
    if (this.activeTab === 'UNREAD') filtered = allNotifs.filter(n => !n.isRead);
    if (this.activeTab === 'READ') filtered = allNotifs.filter(n => n.isRead);

    return `
      <div class="page-header">
        <div>
          <h1>NOTIFICATION CENTER</h1>
          <p>Role-specific alerts, academic updates, and urgent system notices for ${user.name} (${user.role}).</p>
        </div>

        <div>
          <button class="btn-secondary" onclick="NotificationsView.markAllRead()" ${unreadCount === 0 ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}>
            <i data-lucide="check-check"></i> Mark All as Read
          </button>
        </div>
      </div>

      <!-- FILTER TABS BAR -->
      <div class="toolbar" style="margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div class="role-tabs" style="margin-bottom:0; width:auto; background:#F1F5F9; padding:0.25rem; border-radius:10px;">
          <button class="role-tab ${this.activeTab === 'ALL' ? 'active' : ''}" onclick="NotificationsView.setTab('ALL')" style="border-radius:8px;">
            ALL (${allNotifs.length})
          </button>
          <button class="role-tab ${this.activeTab === 'UNREAD' ? 'active' : ''}" onclick="NotificationsView.setTab('UNREAD')" style="border-radius:8px;">
            UNREAD (${unreadCount})
          </button>
          <button class="role-tab ${this.activeTab === 'READ' ? 'active' : ''}" onclick="NotificationsView.setTab('READ')" style="border-radius:8px;">
            READ (${allNotifs.length - unreadCount})
          </button>
        </div>

        <div style="font-size:0.85rem; color:var(--color-text-muted); font-weight:600;">
          Showing ${filtered.length} notification${filtered.length === 1 ? '' : 's'}
        </div>
      </div>

      <!-- NOTIFICATIONS LIST CARD -->
      <div class="card">
        ${filtered.length === 0 ? `
          <div style="text-align:center; padding:4rem 2rem;">
            <div style="width:64px; height:64px; background:#F1F5F9; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; color:var(--color-text-light);">
              <i data-lucide="bell-off" style="width:32px; height:32px;"></i>
            </div>
            <h3 style="font-size:1.25rem; font-weight:800; color:var(--color-navy-dark); margin-bottom:0.4rem;">You're all caught up!</h3>
            <p style="color:var(--color-text-muted); margin:0;">No new notifications available in this view.</p>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:1rem; padding:0.5rem 0;">
            ${filtered.map(n => this.renderNotificationCard(n)).join('')}
          </div>
        `}
      </div>
    `;
  },

  renderNotificationCard(n) {
    const isUnread = !n.isRead;
    const category = n.category || 'GENERAL';
    const priority = n.priority || 'LOW';

    // Icon & Color assignment
    let iconName = 'bell';
    let iconBg = '#EFF6FF';
    let iconColor = '#2563EB';

    if (category === 'ATTENDANCE') { iconName = 'check-square'; iconBg = '#F0FDF4'; iconColor = '#16A34A'; }
    if (category === 'DIGITAL_LEARNING') { iconName = 'book-open'; iconBg = '#EFF6FF'; iconColor = '#2563EB'; }
    if (category === 'TIMETABLE') { iconName = 'calendar'; iconBg = '#F5F3FF'; iconColor = '#7C3AED'; }
    if (category === 'RESULT') { iconName = 'award'; iconBg = '#FEF3C7'; iconColor = '#D97706'; }
    if (category === 'HOLIDAY') { iconName = 'calendar-days'; iconBg = '#ECFDF5'; iconColor = '#059669'; }

    if (category === 'LIBRARY') { iconName = 'book'; iconBg = '#FFF7ED'; iconColor = '#EA580C'; }
    if (category === 'EXAM_FORM') { iconName = 'file-text'; iconBg = '#FAF5FF'; iconColor = '#9333EA'; }
    if (category === 'DIGITAL_ID') { iconName = 'id-card'; iconBg = '#F0FDF4'; iconColor = '#15803D'; }

    // Priority Pill formatting
    let priorityBadge = `<span style="background:#F1F5F9; color:#475569; font-size:0.68rem; font-weight:800; padding:0.15rem 0.5rem; border-radius:12px; text-transform:uppercase;">LOW</span>`;
    if (priority === 'HIGH') {
      priorityBadge = `<span style="background:#FEF2F2; color:#DC2626; border:1px solid #FCA5A5; font-size:0.68rem; font-weight:800; padding:0.15rem 0.5rem; border-radius:12px; text-transform:uppercase;">HIGH PRIORITY</span>`;
    } else if (priority === 'MEDIUM') {
      priorityBadge = `<span style="background:#FFFBEB; color:#D97706; border:1px solid #FDE68A; font-size:0.68rem; font-weight:800; padding:0.15rem 0.5rem; border-radius:12px; text-transform:uppercase;">MEDIUM</span>`;
    }

    return `
      <div class="notification-item" style="display:flex; gap:1.25rem; padding:1.25rem; border-radius:12px; border:1px solid ${isUnread ? '#3B82F6' : 'var(--color-border)'}; background:${isUnread ? '#F8FAFC' : 'white'}; transition:var(--transition-fast); position:relative; box-shadow:${isUnread ? '0 4px 12px rgba(59,130,246,0.08)' : 'none'};">
        
        <!-- ICON -->
        <div style="width:48px; height:48px; background:${iconBg}; color:${iconColor}; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          <i data-lucide="${iconName}"></i>
        </div>

        <!-- CONTENT -->
        <div style="flex:1;">
          
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.35rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              ${isUnread ? `<span style="width:8px; height:8px; background:#2563EB; border-radius:50%; display:inline-block;" title="Unread"></span>` : ''}
              <h4 style="font-size:1rem; font-weight:${isUnread ? '800' : '700'}; color:var(--color-navy-dark); margin:0;">
                ${n.title}
              </h4>
              <span style="font-size:0.7rem; font-weight:700; color:var(--color-text-muted); background:var(--color-bg-light); padding:0.15rem 0.5rem; border-radius:6px; text-transform:uppercase;">
                ${category}
              </span>
              ${priorityBadge}
            </div>

            <span style="font-size:0.78rem; color:var(--color-text-muted); font-weight:500;">
              ${n.createdAt || 'Just now'}
            </span>
          </div>

          <p style="margin:0 0 0.5rem 0; font-size:0.88rem; color:var(--color-text-main); line-height:1.5;">
            ${n.message}
          </p>

          ${n.rejectionReason ? `
            <div style="background:#FEF2F2; border:1px solid #FCA5A5; border-radius:8px; padding:0.6rem 0.85rem; font-size:0.82rem; color:#991B1B; margin-bottom:0.6rem; font-weight:600;">
              <strong>Reason:</strong> ${n.rejectionReason}
            </div>
          ` : ''}

          <!-- ACTIONS -->
          <div style="display:flex; gap:0.75rem; align-items:center; margin-top:0.6rem;">
            ${isUnread ? `
              <button class="btn-xs btn-secondary" onclick="NotificationsView.markSingleRead('${n.id}')" style="font-size:0.78rem; padding:0.3rem 0.65rem;">
                <i data-lucide="check"></i> Mark as Read
              </button>
            ` : '<span style="font-size:0.75rem; color:#16A34A; font-weight:700;">✓ Read</span>'}

            ${n.relatedModule ? `
              <button class="btn-xs btn-primary" onclick="App.navigateTo('${n.relatedModule}')" style="font-size:0.78rem; padding:0.3rem 0.65rem;">
                <i data-lucide="arrow-right"></i> Open Module
              </button>
            ` : ''}
          </div>

        </div>

      </div>
    `;
  },

  setTab(tab) {
    this.activeTab = tab;
    App.renderCurrentView();
  },

  markSingleRead(id) {
    notificationService.markAsRead(id);
    UIService.showToast("Notification marked as read.", "info");
    App.renderCurrentView();
  },

  markAllRead() {
    const user = authService.getCurrentUser();
    notificationService.markAllAsRead(user);
    UIService.showToast("All notifications marked as read.", "success");
    App.renderCurrentView();
  },

  retryLoad() {
    this.error = false;
    this.loading = true;
    App.renderCurrentView();
    setTimeout(() => {
      this.loading = false;
      App.renderCurrentView();
    }, 600);
  }
};

window.NotificationsView = NotificationsView;

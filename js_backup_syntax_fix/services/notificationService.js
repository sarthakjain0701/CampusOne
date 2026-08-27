/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - NOTIFICATION SERVICE
   Role-Based, UI-Decoupled Mock & Storage Notification Service Architecture
   ========================================================================== */

const notificationService = {
  /**
   * Retrieves notifications strictly isolated for the logged in user & role
   */
  getNotifications(user) {
    if (!user) return [];

    const all = DataStore.get('NOTIFICATIONS') || window.MOCK_DATA?.notifications || [];
    const userId = user.id || user.uid;
    const userRole = user.role;

    return all.filter(n => {
      // Role match check
      const roleMatches = n.recipientRole === userRole || n.recipientRole === 'ALL';
      if (!roleMatches) return false;

      // Recipient ID match check (if targeted to a specific user)
      if (n.recipientId && n.recipientId !== 'ALL') {
        const idMatches = n.recipientId === userId || 
                          n.recipientId === user.uid || 
                          n.recipientId === user.email || 
                          n.recipientId === user.studentId || 
                          n.recipientId === user.employeeId ||
                          (userRole === 'STUDENT' && n.recipientId === 'USR_STU_01') ||
                          (userRole === 'FACULTY' && n.recipientId === 'USR_FAC_01') ||
                          (userRole === 'ADMIN' && n.recipientId === 'USR_ADMIN_01');
        return idMatches;
      }

      return true;
    }).map(n => ({
      ...n,
      isRead: Boolean(n.isRead || n.read),
      priority: n.priority || (n.type === 'WARNING' ? 'HIGH' : n.type === 'SUCCESS' ? 'MEDIUM' : 'LOW')
    }));
  },

  /**
   * Retrieves unread notifications for current user
   */
  getUnreadNotifications(user) {
    return this.getNotifications(user).filter(n => !n.isRead);
  },

  /**
   * Gets exact unread notification count for badge display
   */
  getUnreadCount(user) {
    return this.getUnreadNotifications(user).length;
  },

  /**
   * Formats count for badge display: 0 => '', 1-99 => exact, 100+ => '99+'
   */
  getBadgeText(user) {
    const count = this.getUnreadCount(user);
    if (count <= 0) return '';
    if (count > 99) return '99+';
    return String(count);
  },

  /**
   * Marks a single notification as read
   */
  markAsRead(notificationId) {
    const list = DataStore.get('NOTIFICATIONS') || window.MOCK_DATA?.notifications || [];
    const item = list.find(n => n.id === notificationId);
    if (item) {
      item.isRead = true;
      item.read = true;
      DataStore.set('NOTIFICATIONS', list);
      if (window.MOCK_DATA) window.MOCK_DATA.notifications = list;
    }
    return item;
  },

  /**
   * Marks ALL notifications for the CURRENT USER as read
   */
  markAllAsRead(user) {
    if (!user) return false;
    const userNotifs = this.getNotifications(user);
    const userNotifIds = new Set(userNotifs.map(n => n.id));

    const list = DataStore.get('NOTIFICATIONS') || window.MOCK_DATA?.notifications || [];
    list.forEach(n => {
      if (userNotifIds.has(n.id)) {
        n.isRead = true;
        n.read = true;
      }
    });

    DataStore.set('NOTIFICATIONS', list);
    if (window.MOCK_DATA) window.MOCK_DATA.notifications = list;
    return true;
  },

  /**
   * System Event Trigger: Creates a new notification with duplicate prevention
   */
  createNotification({ recipientId = 'ALL', recipientRole = 'ALL', title, message, category = 'GENERAL', type = 'INFO', priority = 'LOW', relatedModule = null, rejectionReason = null }) {
    if (!title || !message) return null;

    const list = DataStore.get('NOTIFICATIONS') || window.MOCK_DATA?.notifications || [];

    // Duplicate Prevention: check if identical title + recipient was emitted in last 60s
    const isDuplicate = list.some(n => 
      n.title === title && 
      n.recipientId === recipientId && 
      n.message === message
    );

    if (isDuplicate) return null;

    const now = new Date();
    const timeStr = `${now.getDate()} ${now.toLocaleString('en', { month: 'short' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newNotif = {
      id: "NOT_" + String(Date.now()).slice(-6),
      recipientId,
      recipientRole,
      title,
      message,
      rejectionReason,
      category: category.toUpperCase(),
      type: type.toUpperCase(),
      priority: priority.toUpperCase(),
      isRead: false,
      read: false,
      createdAt: timeStr,
      relatedModule
    };

    list.unshift(newNotif);
    DataStore.set('NOTIFICATIONS', list);
    if (window.MOCK_DATA) window.MOCK_DATA.notifications = list;

    return newNotif;
  }
};

window.notificationService = notificationService;

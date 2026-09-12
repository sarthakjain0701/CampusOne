/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - NOTIFICATION SERVICE (FIRESTORE)
   ========================================================================== */

const notificationService = {
  localCache: [],

  get db() {
    return window.FirebaseService ? window.FirebaseService.db : null;
  },

  async fetchNotificationsFromFirestore(user) {
    if (!this.db || !user) return [];
    try {
      const snap = await this.db.collection('notifications').get();
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      this.localCache = all;
      return this.filterForUser(all, user);
    } catch (e) {
      console.error(e);
      return this.getNotifications(user); // fallback to local mock
    }
  },

  filterForUser(all, user) {
    const userId = user.id || user.uid;
    const userRole = user.role;

    return all.filter(n => {
      const roleMatches = n.recipientRole === userRole || n.recipientRole === 'ALL';
      if (!roleMatches) return false;

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

  getNotifications(user) {
    if (!user) return [];
    let all = [];
    if (this.localCache && this.localCache.length > 0) {
      all = this.localCache;
    } else {
      all = typeof DataStore !== 'undefined' ? (DataStore.get('NOTIFICATIONS') || window.MOCK_DATA?.notifications || []) : [];
    }
    return this.filterForUser(all, user);
  },

  getUnreadNotifications(user) {
    return this.getNotifications(user).filter(n => !n.isRead);
  },

  getUnreadCount(user) {
    return this.getUnreadNotifications(user).length;
  },

  getBadgeText(user) {
    const count = this.getUnreadCount(user);
    if (count <= 0) return '';
    if (count > 99) return '99+';
    return String(count);
  },

  async markAsRead(notificationId) {
    // Local Update
    const item = this.localCache.find(n => n.id === notificationId);
    if (item) {
      item.isRead = true;
      item.read = true;
    }
    const dStoreList = typeof DataStore !== 'undefined' ? DataStore.get('NOTIFICATIONS') : null;
    if (dStoreList) {
      const dItem = dStoreList.find(n => n.id === notificationId);
      if (dItem) { dItem.isRead = true; dItem.read = true; DataStore.set('NOTIFICATIONS', dStoreList); }
    }

    // Firestore Update
    if (this.db) {
      try {
        await this.db.collection('notifications').doc(notificationId).update({ isRead: true, read: true });
      } catch(e) {}
    }
    
    // Refresh Navbar Badge
    if (typeof App !== 'undefined' && App.renderMainLayout) {
      // Re-render layout to update badge
      setTimeout(() => App.renderMainLayout(), 0);
    }
    return item;
  },

  async markAllAsRead(user) {
    if (!user) return false;
    
    // Local Update
    const userNotifs = this.filterForUser(this.localCache, user);
    userNotifs.forEach(n => { n.isRead = true; n.read = true; });
    
    const dStoreList = typeof DataStore !== 'undefined' ? DataStore.get('NOTIFICATIONS') : null;
    if (dStoreList) {
      const userNotifsD = this.filterForUser(dStoreList, user);
      const ids = new Set(userNotifsD.map(n => n.id));
      dStoreList.forEach(n => { if (ids.has(n.id)) { n.isRead = true; n.read = true; } });
      DataStore.set('NOTIFICATIONS', dStoreList);
    }

    // Firestore Update (Batch)
    if (this.db) {
      try {
        const batch = this.db.batch();
        userNotifs.forEach(n => {
          if (!n.isRead) {
            const ref = this.db.collection('notifications').doc(n.id);
            batch.update(ref, { isRead: true, read: true });
          }
        });
        await batch.commit();
      } catch(e) {}
    }

    if (typeof App !== 'undefined' && App.renderMainLayout) {
      setTimeout(() => App.renderMainLayout(), 0);
    }
    return true;
  },

  async createNotification(data) {
    const newNotif = {
      title: data.title,
      message: data.message,
      recipientId: data.recipientId || 'ALL',
      recipientRole: data.recipientRole || 'ALL',
      type: data.type || 'INFO',
      priority: data.priority || 'LOW',
      category: data.category || 'SYSTEM',
      relatedModule: data.relatedModule || '',
      isRead: false,
      read: false,
      createdAt: new Date().toISOString()
    };

    // Firestore
    if (this.db) {
      try {
        const docRef = await this.db.collection('notifications').add(newNotif);
        newNotif.id = docRef.id;
        this.localCache.push(newNotif);
      } catch (e) {
        newNotif.id = "NOT" + String(Date.now());
        this.localCache.push(newNotif);
      }
    }

    if (typeof App !== 'undefined' && App.renderMainLayout) {
      setTimeout(() => App.renderMainLayout(), 0);
    }
    return newNotif;
  }
};

window.notificationService = notificationService;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - QR SERVICE
   Centralized QR Code Generation, Parsing & Identification Service
   With Data Minimization Guard for Scanning Operations
   ========================================================================== */

const QRService = {
  /**
   * Generates or retrieves the unique QR identifier string for a Student.
   * Format: PAMS|STUDENT|<unique-registration-or-roll-token>
   */
  generateStudentQR(studentId) {
    const students = DataStore.get('STUDENTS') || [];
    const student = students.find(s => s.id === studentId || s.studentId === studentId || s.email === studentId);
    if (!student) return `PAMS|STUDENT|UNKNOWN_${studentId}`;

    if (student.qrIdentifier) {
      return student.qrIdentifier;
    }

    const regToken = student.registrationNumber || student.rollNo || student.rollNumber || student.id || `REG-${Date.now()}`;
    const qrString = `PAMS|STUDENT|${regToken}`;
    
    DataStore.updateItem('STUDENTS', student.id, { qrIdentifier: qrString, qrStatus: student.qrStatus || 'ACTIVE' });
    return qrString;
  },

  /**
   * Generates or retrieves the unique QR identifier string for a Faculty member.
   * Format: PAMS|FACULTY|<unique-faculty-id-or-employee-token>
   */
  generateFacultyQR(facultyId) {
    const facultyList = DataStore.get('FACULTY') || [];
    const fac = facultyList.find(f => f.id === facultyId || f.employeeId === facultyId || f.email === facultyId);
    if (!fac) return `PAMS|FACULTY|UNKNOWN_${facultyId}`;

    if (fac.qrIdentifier) {
      return fac.qrIdentifier;
    }

    const empToken = fac.employeeNumber || fac.employeeId || fac.id || `FAC-${Date.now()}`;
    const qrString = `PAMS|FACULTY|${empToken}`;

    DataStore.updateItem('FACULTY', fac.id, { qrIdentifier: qrString, qrStatus: fac.qrStatus || 'ACTIVE' });
    return qrString;
  },

  /**
   * Validates if a QR code string adheres to PAMS format:
   * PAMS|<STUDENT|FACULTY>|<TOKEN>
   */
  validateQRCode(qrData) {
    if (!qrData || typeof qrData !== 'string') {
      return { isValid: false, error: 'Empty or invalid QR format.' };
    }

    const parts = qrData.trim().split('|');
    if (parts.length !== 3 || parts[0] !== 'PAMS') {
      return { isValid: false, error: 'This QR code is not recognized by Poornima Attendance System.' };
    }

    const type = parts[1].toUpperCase();
    if (type !== 'STUDENT' && type !== 'FACULTY') {
      return { isValid: false, error: 'Invalid user type in QR token.' };
    }

    return {
      isValid: true,
      type: type,
      identifier: parts[2]
    };
  },

  /**
   * Scans/Identifies a user from a raw QR code string.
   * DATA MINIMIZATION: Returns only basic identity & status required for verification.
   * Excludes full academic results, CGPA, and financial history.
   */
  identifyUser(qrData, scannerUser = null) {
    const validation = this.validateQRCode(qrData);
    if (!validation.isValid) {
      return {
        success: false,
        status: 'INVALID',
        error: validation.error || 'This QR code is not recognized by Poornima Attendance System.'
      };
    }

    const { type, identifier } = validation;
    const cleanId = identifier.trim().toLowerCase();

    if (type === 'STUDENT') {
      const students = DataStore.get('STUDENTS') || [];
      const student = students.find(s => 
        (s.qrIdentifier && s.qrIdentifier.toLowerCase() === qrData.trim().toLowerCase()) ||
        (s.registrationNumber && s.registrationNumber.toLowerCase() === cleanId) ||
        (s.rollNumber && s.rollNumber.toLowerCase() === cleanId) ||
        (s.rollNo && s.rollNo.toLowerCase() === cleanId) ||
        (s.id && s.id.toLowerCase() === cleanId)
      );

      if (!student) {
        return {
          success: false,
          status: 'NOT_FOUND',
          error: 'No student found matching this QR code.'
        };
      }

      // Minimized Data Payload for Security & Privacy
      const minimizedStudent = {
        id: student.id,
        name: student.name,
        registrationNumber: student.registrationNumber || student.rollNumber,
        rollNumber: student.rollNumber,
        department: student.department || 'CSE',
        semester: student.semester || 2,
        section: student.section || 'A',
        batch: student.batch || student.enrollmentYear || '2025',
        qrStatus: student.qrStatus || 'ACTIVE',
        status: student.status || 'ACTIVE'
      };

      const isInactive = student.status === 'INACTIVE' || student.qrStatus === 'INACTIVE';
      if (isInactive) {
        return {
          success: false,
          status: 'INACTIVE',
          type: 'STUDENT',
          user: minimizedStudent,
          error: 'This Digital ID is currently inactive.'
        };
      }

      return {
        success: true,
        status: 'ACTIVE',
        type: 'STUDENT',
        user: minimizedStudent
      };
    }

    if (type === 'FACULTY') {
      const facultyList = DataStore.get('FACULTY') || [];
      const fac = facultyList.find(f => 
        (f.qrIdentifier && f.qrIdentifier.toLowerCase() === qrData.trim().toLowerCase()) ||
        (f.employeeNumber && f.employeeNumber.toLowerCase() === cleanId) ||
        (f.employeeId && f.employeeId.toLowerCase() === cleanId) ||
        (f.id && f.id.toLowerCase() === cleanId)
      );

      if (!fac) {
        return {
          success: false,
          status: 'NOT_FOUND',
          error: 'No faculty member found matching this QR code.'
        };
      }

      const minimizedFaculty = {
        id: fac.id,
        name: fac.name,
        employeeId: fac.employeeId || fac.employeeNumber,
        department: fac.department || 'CSE',
        designation: fac.designation || 'Assistant Professor',
        qrStatus: fac.qrStatus || 'ACTIVE',
        status: fac.status || 'ACTIVE'
      };

      const isInactive = fac.status === 'INACTIVE' || fac.qrStatus === 'INACTIVE';
      if (isInactive) {
        return {
          success: false,
          status: 'INACTIVE',
          type: 'FACULTY',
          user: minimizedFaculty,
          error: 'This Digital ID is currently inactive.'
        };
      }

      return {
        success: true,
        status: 'ACTIVE',
        type: 'FACULTY',
        user: minimizedFaculty
      };
    }

    return {
      success: false,
      status: 'INVALID',
      error: 'Unrecognized QR code.'
    };
  },

  regenerateQR(userId, role = 'STUDENT') {
    const newSeq = String(Date.now()).slice(-6);
    if (role === 'STUDENT') {
      const newToken = `PAMS|STUDENT|REG-2026-${newSeq}`;
      DataStore.updateItem('STUDENTS', userId, { qrIdentifier: newToken, qrStatus: 'ACTIVE' });
      if (window.notificationService) {
        notificationService.notifyUser(userId, "Digital ID Updated", "Your Digital ID QR Code has been regenerated by administration.", "INFO");
      }
      return newToken;
    } else {
      const newToken = `PAMS|FACULTY|EMP-FAC-${newSeq}`;
      DataStore.updateItem('FACULTY', userId, { qrIdentifier: newToken, qrStatus: 'ACTIVE' });
      if (window.notificationService) {
        notificationService.notifyUser(userId, "Digital ID Updated", "Your Digital ID QR Code has been regenerated by administration.", "INFO");
      }
      return newToken;
    }
  }
};

window.QRService = QRService;

/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - EXCEL IMPORT SERVICE
   Handles Excel File generation, parsing, and I/O using SheetJS.
   ========================================================================== */

const ExcelImportService = {
  /**
   * Generates and downloads an Excel template for Students.
   */
  downloadStudentTemplate() {
    if (typeof XLSX === 'undefined') {
      UIService.showToast("Excel library not loaded. Please try again.", "danger");
      return;
    }

    const dataSheet = [
      ["Enrollment Year", "Department", "Semester", "Section", "Batch", "Name", "First Name", "Roll No", "Registration No", "Phone", "Status"],
      ["2026", "Computer Science & Engineering", "2", "A", "2026-2030", "Shivansh Jain", "Shivansh", "26EPTCS151", "PIET26CS151", "+91 98290 00000", "ACTIVE"],
      ["2026", "Information Technology", "2", "B", "2026-2030", "Aarav Sharma", "Aarav", "26EPTIT001", "PIET26IT001", "+91 98290 00001", "ACTIVE"]
    ];

    const instructionsSheet = [
      ["STUDENT IMPORT INSTRUCTIONS"],
      [""],
      ["1. DO NOT change the column names in the Data sheet."],
      ["2. Required Columns: Name, First Name, Roll No, Registration No, Department, Enrollment Year."],
      ["3. Department must exactly match existing departments (e.g., Computer Science & Engineering)."],
      ["4. Roll No and Registration No must be completely unique."],
      ["5. Status should be ACTIVE or INACTIVE."],
      ["6. Official Email is auto-generated using: EnrollmentYear + piet + DeptCode + FirstName + RegNoSuffix + @poornima.org"],
      ["7. Save this file as .xlsx before uploading."]
    ];

    this._triggerDownload(dataSheet, instructionsSheet, "Student_Import_Template.xlsx");
  },

  /**
   * Generates and downloads an Excel template for Faculty.
   */
  downloadFacultyTemplate() {
    if (typeof XLSX === 'undefined') {
      UIService.showToast("Excel library not loaded. Please try again.", "danger");
      return;
    }

    const dataSheet = [
      ["Employee ID", "Name", "First Name", "Last Name", "Department", "Designation", "Qualification", "Specialization", "Phone", "Status"],
      ["EMP001", "Dr. Rajesh Kumar", "Rajesh", "Kumar", "Computer Science & Engineering", "Professor", "Ph.D.", "Data Science", "+91 98290 11111", "ACTIVE"],
      ["EMP002", "Ms. Priya Sharma", "Priya", "Sharma", "Information Technology", "Assistant Professor", "M.Tech", "Networking", "+91 98290 22222", "ACTIVE"]
    ];

    const instructionsSheet = [
      ["FACULTY IMPORT INSTRUCTIONS"],
      [""],
      ["1. DO NOT change the column names in the Data sheet."],
      ["2. Required Columns: Employee ID, Name, First Name, Last Name, Department."],
      ["3. Department must exactly match existing departments (e.g., Computer Science & Engineering)."],
      ["4. Employee ID must be unique."],
      ["5. Official Email is auto-generated using: firstname.lastname@poornima.org"],
      ["6. Status should be ACTIVE or INACTIVE."],
      ["7. Save this file as .xlsx before uploading."]
    ];

    this._triggerDownload(dataSheet, instructionsSheet, "Faculty_Import_Template.xlsx");
  },

  /**
   * Generates an error report containing original records + Error reasons
   */
  downloadErrorReport(records, type = "Students") {
    if (typeof XLSX === 'undefined') return;

    // Filter out VALID records
    const failedRecords = records.filter(r => r.__importStatus !== 'VALID');
    if (failedRecords.length === 0) {
      UIService.showToast("No errors to export.", "info");
      return;
    }

    // Build header based on keys (ignoring our metadata keys initially)
    const allKeys = new Set();
    failedRecords.forEach(r => {
      Object.keys(r).forEach(k => {
        if (!k.startsWith('__')) allKeys.add(k);
      });
    });

    const headers = Array.from(allKeys);
    
    // Add our error headers at the end
    headers.push("Import Status");
    headers.push("Error Reason");

    const dataSheet = [headers];

    failedRecords.forEach(r => {
      const row = headers.map(h => {
        if (h === "Import Status") return r.__importStatus;
        if (h === "Error Reason") return r.__importError;
        return r[h] !== undefined ? r[h] : "";
      });
      dataSheet.push(row);
    });

    this._triggerDownload(dataSheet, null, `${type}_Import_Error_Report.xlsx`);
  },

  /**
   * Internal helper to build and trigger workbook download
   */
  _triggerDownload(data, instructions, filename) {
    const wb = XLSX.utils.book_new();
    
    const wsData = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, wsData, "Data");
    
    if (instructions) {
      const wsInstr = XLSX.utils.aoa_to_sheet(instructions);
      // Make instructions column wider
      wsInstr['!cols'] = [{ wch: 100 }];
      XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");
    }

    XLSX.writeFile(wb, filename);
  },

  /**
   * Parses an uploaded Excel file and returns JSON rows.
   */
  parseExcel(file) {
    return new Promise((resolve, reject) => {
      if (typeof XLSX === 'undefined') {
        reject(new Error("Excel parser library is not loaded."));
        return;
      }

      if (!file.name.endsWith('.xlsx')) {
        reject(new Error("Invalid file type. Please upload an .xlsx Excel file."));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (workbook.SheetNames.length === 0) {
            throw new Error("Excel file is empty.");
          }

          // We assume data is in the first sheet or a sheet named 'Data'
          let targetSheetName = workbook.SheetNames.find(n => n.toLowerCase() === 'data') || workbook.SheetNames[0];
          
          // But if they used the template and didn't name it data, and the first sheet is instructions...
          if (workbook.SheetNames.includes('Data')) targetSheetName = 'Data';

          const worksheet = workbook.Sheets[targetSheetName];
          
          // Parse to JSON (first row as headers)
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          
          if (json.length === 0) {
            throw new Error(`Worksheet '${targetSheetName}' has no data rows.`);
          }

          resolve(json);
        } catch (error) {
          reject(new Error("Failed to parse Excel file: " + error.message));
        }
      };
      
      reader.onerror = () => reject(new Error("Failed to read file from disk."));
      reader.readAsArrayBuffer(file);
    });
  }
};

window.ExcelImportService = ExcelImportService;

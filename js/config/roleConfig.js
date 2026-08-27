const ROLE_CONFIG = {
  student: { dashboard: "dashboard", label: "Student" },
  faculty: { dashboard: "dashboard", label: "Faculty" },
  proctor: { dashboard: "dashboard", label: "Proctor" },
  hod: { dashboard: "dashboard", label: "HOD" },
  dean: { dashboard: "dashboard", label: "Dean" },
  registrar: { dashboard: "dashboard", label: "Registrar" },
  coe: { dashboard: "dashboard", label: "COE" },
  librarian: { dashboard: "lib-dashboard", label: "Librarian" },
  finance_officer: { dashboard: "dashboard", label: "Finance Officer" },
  admin: { dashboard: "dashboard", label: "Administrator" },
  administrator: { dashboard: "dashboard", label: "Administrator" },
  it_support: { dashboard: "dashboard", label: "IT Support" },
  management: { dashboard: "dashboard", label: "Management" }
};

window.ROLE_CONFIG = ROLE_CONFIG;

window.getDashboardForRole = function(role) {
  if (!role) return null;
  const config = window.ROLE_CONFIG[role.toLowerCase()];
  return config ? config.dashboard : null;
};

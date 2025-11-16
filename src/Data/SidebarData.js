// Sidebar Menu Items Data
// Note: Icons are imported in SideBar.jsx to avoid JSX in data files

export const menuItemsConfig = [
  { text: "Dashboard", iconName: "Dashboard", path: "/dashboard" },
  { text: "Home", iconName: "Home", path: "/" },
  { text: "Find Doctor", iconName: "PersonSearch", path: "/finddoctor" },
  { text: "Pharmacies", iconName: "LocalPharmacy", path: "/pharmacies" },
  { text: "Messages", iconName: "Message", path: "/messages" },
  { text: "Orders", iconName: "ShoppingBag", path: "/orders", roles: ["Pharmacy"] },
  { text: "Patients", iconName: "Group", path: "/patients", roles: ["Doctor"] },
];

export const bottomMenuConfig = [
  { text: "Account", iconName: "AccountCircle", path: "/account" },
  { text: "Logout", iconName: "Logout", color: "error.main" },
];


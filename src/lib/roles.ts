export const ROLES = [
  "super_admin",
  "admin",
  "transport_manager",
  "accountant",
  "teacher",
  "driver",
  "parent",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "SaaS Super Admin",
  admin: "School Administrator",
  transport_manager: "Transport Manager",
  accountant: "Accountant",
  teacher: "Teacher",
  driver: "Driver",
  parent: "Parent / Guardian",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export type NavItem = { href: string; label: string; roles: Role[] };

const STAFF: Role[] = ["admin", "transport_manager"];

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["admin", "transport_manager", "accountant", "teacher"] },
  { href: "/students", label: "Students", roles: ["admin", "transport_manager", "teacher"] },
  { href: "/buses", label: "Buses", roles: STAFF },
  { href: "/drivers", label: "Drivers", roles: STAFF },
  { href: "/routes", label: "Routes", roles: STAFF },
  { href: "/attendance", label: "Attendance", roles: ["admin", "transport_manager", "teacher"] },
];

export function navFor(role: Role | null): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

import { z } from "zod";
import { normalizePkPhone } from "./phone";
import type { Role } from "./roles";

export type Option = { value: string; label: string };
export type Field = {
  name: string;
  label: string;
  required?: boolean;
  type?: "text" | "tel" | "number" | "date";
  options?: Option[];
};

const opts = (...values: string[]): Option[] => values.map((v) => ({ value: v, label: v }));
const req = (label: string, max = 120) => z.string().trim().min(1, `${label} is required.`).max(max);
const opt = (max = 200) => z.string().trim().max(max).optional().transform((v) => (v ? v : null));
const pkPhone = (label: string) =>
  z.string().trim().transform((v, ctx) => {
    const phone = normalizePkPhone(v);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: `${label} must be a valid Pakistani mobile number, e.g. 0300 1234567.` });
      return z.NEVER;
    }
    return phone;
  });

const STATUS = opts("Active", "Inactive");
const EDITORS: Role[] = ["admin", "transport_manager"];

export const RESOURCES = {
  buses: {
    label: "bus",
    path: "/buses",
    creators: EDITORS,
    editors: EDITORS,
    fields: [
      { name: "registration_number", label: "Registration number", required: true },
      { name: "bus_model", label: "Model" },
      { name: "seating_capacity", label: "Seating capacity", type: "number" },
      { name: "driver_name", label: "Driver" },
      { name: "assigned_route", label: "Route" },
      { name: "status", label: "Status", required: true, options: opts("Active", "Inactive", "Maintenance") },
    ] satisfies Field[],
    schema: z.object({
      registration_number: req("Registration number", 40).transform((v) => v.toUpperCase()),
      bus_model: opt(80),
      seating_capacity: z
        .string()
        .trim()
        .optional()
        .transform((v) => (v ? Number(v) : null))
        .pipe(z.number({ message: "Seating capacity must be a number." }).int("Seating capacity must be a whole number.").min(1, "Seating capacity must be at least 1.").max(200, "Seating capacity must be 200 or less.").nullable()),
      driver_name: opt(120),
      assigned_route: opt(120),
      status: z.enum(["Active", "Inactive", "Maintenance"], { message: "Choose a valid status." }),
    }),
  },
  drivers: {
    label: "driver",
    path: "/drivers",
    creators: EDITORS,
    editors: EDITORS,
    fields: [
      { name: "driver_name", label: "Name", required: true },
      { name: "phone", label: "Phone", required: true, type: "tel" },
      { name: "license_number", label: "Licence number", required: true },
      { name: "assigned_bus", label: "Assigned bus" },
      { name: "status", label: "Status", required: true, options: STATUS },
    ] satisfies Field[],
    schema: z.object({
      driver_name: req("Name"),
      phone: pkPhone("Phone"),
      license_number: req("Licence number", 40),
      assigned_bus: opt(40),
      status: z.enum(["Active", "Inactive"], { message: "Choose a valid status." }),
    }),
  },
  routes: {
    label: "route",
    path: "/routes",
    creators: EDITORS,
    editors: EDITORS,
    fields: [
      { name: "route_name", label: "Route name", required: true },
      { name: "starting_point", label: "Starting point", required: true },
      { name: "destination", label: "Destination", required: true },
      { name: "pickup_points", label: "Pickup points (comma separated)" },
      { name: "status", label: "Status", required: true, options: STATUS },
    ] satisfies Field[],
    schema: z.object({
      route_name: req("Route name"),
      starting_point: req("Starting point", 200),
      destination: req("Destination", 200),
      pickup_points: opt(1000),
      status: z.enum(["Active", "Inactive"], { message: "Choose a valid status." }),
    }),
  },
  attendance: {
    label: "attendance record",
    path: "/attendance",
    creators: [...EDITORS, "teacher"] as Role[],
    editors: EDITORS,
    fields: [
      { name: "student_id", label: "Student", required: true, options: [] },
      { name: "attendance_date", label: "Date", required: true, type: "date" },
      { name: "status", label: "Status", required: true, options: opts("Present", "Absent", "Leave") },
    ] satisfies Field[],
    schema: z.object({
      student_id: z.coerce.number({ message: "Choose a student." }).int().positive("Choose a student."),
      attendance_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date."),
      status: z.enum(["Present", "Absent", "Leave"], { message: "Choose a valid status." }),
    }),
  },
};

export type ResourceKey = keyof typeof RESOURCES;

export function isResourceKey(value: unknown): value is ResourceKey {
  return typeof value === "string" && Object.hasOwn(RESOURCES, value);
}

export function canCreate(resource: ResourceKey, role: Role | null) {
  return role !== null && RESOURCES[resource].creators.includes(role);
}

export function canEdit(resource: ResourceKey, role: Role | null) {
  return role !== null && RESOURCES[resource].editors.includes(role);
}

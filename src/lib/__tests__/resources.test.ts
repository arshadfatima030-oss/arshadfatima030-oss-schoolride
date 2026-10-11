import { describe, expect, it } from "vitest";
import { RESOURCES, canCreate, canEdit, isResourceKey } from "../resources";

describe("resource schemas", () => {
  it("normalises bus registration and capacity", () => {
    const r = RESOURCES.buses.schema.parse({ registration_number: " lea-123 ", seating_capacity: "40", status: "Active" });
    expect(r.registration_number).toBe("LEA-123");
    expect(r.seating_capacity).toBe(40);
    expect(r.bus_model).toBeNull();
  });

  it("rejects invalid bus capacity and status", () => {
    expect(RESOURCES.buses.schema.safeParse({ registration_number: "A", seating_capacity: "0", status: "Active" }).success).toBe(false);
    expect(RESOURCES.buses.schema.safeParse({ registration_number: "A", seating_capacity: "4.5", status: "Active" }).success).toBe(false);
    expect(RESOURCES.buses.schema.safeParse({ registration_number: "A", status: "Gone" }).success).toBe(false);
  });

  it("normalises driver phone and rejects bad numbers", () => {
    const ok = RESOURCES.drivers.schema.parse({ driver_name: "Ali", phone: "0300 1234567", license_number: "L1", status: "Active" });
    expect(ok.phone).toBe("+923001234567");
    const bad = RESOURCES.drivers.schema.safeParse({ driver_name: "Ali", phone: "12345", license_number: "L1", status: "Active" });
    expect(bad.success).toBe(false);
  });

  it("requires route endpoints", () => {
    expect(RESOURCES.routes.schema.safeParse({ route_name: "R1", starting_point: "", destination: "X", status: "Active" }).success).toBe(false);
  });

  it("validates attendance fields", () => {
    expect(RESOURCES.attendance.schema.parse({ student_id: "7", attendance_date: "2026-10-11", status: "Absent" }).student_id).toBe(7);
    expect(RESOURCES.attendance.schema.safeParse({ student_id: "", attendance_date: "2026-10-11", status: "Present" }).success).toBe(false);
    expect(RESOURCES.attendance.schema.safeParse({ student_id: "7", attendance_date: "11/10/2026", status: "Present" }).success).toBe(false);
  });
});

describe("resource permissions", () => {
  it("only accepts known resources", () => {
    expect(isResourceKey("buses")).toBe(true);
    expect(isResourceKey("profiles")).toBe(false);
    expect(isResourceKey("toString")).toBe(false);
  });

  it("lets teachers create but not edit attendance, and nothing else", () => {
    expect(canCreate("attendance", "teacher")).toBe(true);
    expect(canEdit("attendance", "teacher")).toBe(false);
    expect(canCreate("buses", "teacher")).toBe(false);
    expect(canCreate("buses", "parent")).toBe(false);
    expect(canEdit("routes", "transport_manager")).toBe(true);
    expect(canCreate("drivers", null)).toBe(false);
  });
});

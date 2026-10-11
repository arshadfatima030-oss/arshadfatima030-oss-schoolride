import { describe, expect, it } from "vitest";
import { isRole, navFor } from "../roles";

describe("roles", () => {
  it("rejects unknown roles", () => {
    expect(isRole("admin")).toBe(true);
    expect(isRole("superuser")).toBe(false);
    expect(isRole(null)).toBe(false);
  });

  it("shows no navigation without a role", () => {
    expect(navFor(null)).toEqual([]);
  });

  it("hides transport pages from teachers", () => {
    const hrefs = navFor("teacher").map((i) => i.href);
    expect(hrefs).toContain("/attendance");
    expect(hrefs).not.toContain("/buses");
  });

  it("gives parents and drivers no staff navigation", () => {
    expect(navFor("parent")).toEqual([]);
    expect(navFor("driver")).toEqual([]);
  });
});

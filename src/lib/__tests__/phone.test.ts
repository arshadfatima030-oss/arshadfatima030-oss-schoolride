import { describe, expect, it } from "vitest";
import { normalizePkPhone } from "../phone";

describe("normalizePkPhone", () => {
  it.each([
    ["03001234567", "+923001234567"],
    ["0300-1234567", "+923001234567"],
    ["0300 123 4567", "+923001234567"],
    ["+92 300 1234567", "+923001234567"],
    ["923001234567", "+923001234567"],
    ["00923001234567", "+923001234567"],
    ["3001234567", "+923001234567"],
  ])("normalises %s", (input, expected) => {
    expect(normalizePkPhone(input)).toBe(expected);
  });

  it.each(["", "12345", "0421234567", "0300123456", "030012345678", "+14155550100"])("rejects %s", (input) => {
    expect(normalizePkPhone(input)).toBeNull();
  });
});

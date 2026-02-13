import { describe, it, expect } from "vitest";
import { getAcademicLabel, formatClassOf } from "@/lib/academic";

/* ─── getAcademicLabel ─── */

describe("getAcademicLabel", () => {
  it('returns "Honors" for aligned', () => {
    expect(getAcademicLabel("aligned")).toBe("Honors");
  });

  it("returns null for drifting", () => {
    expect(getAcademicLabel("drifting")).toBeNull();
  });

  it("returns null for misaligned", () => {
    expect(getAcademicLabel("misaligned")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getAcademicLabel("")).toBeNull();
  });
});

/* ─── formatClassOf ─── */

describe("formatClassOf", () => {
  it("formats ISO timestamp as Class of YYYY", () => {
    expect(formatClassOf("2024-06-01T00:00:00Z")).toBe("Class of 2024");
  });

  it("formats date-only string as Class of YYYY", () => {
    expect(formatClassOf("2025-12-31")).toBe("Class of 2025");
  });

  it("returns empty string for empty input", () => {
    expect(formatClassOf("")).toBe("");
  });

  it("returns empty string for invalid date", () => {
    expect(formatClassOf("not-a-date")).toBe("");
  });
});

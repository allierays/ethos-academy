import { describe, it, expect } from "vitest";
import {
  getGrade,
  TRAIT_LABELS,
  TRAIT_DIMENSIONS,
  DIMENSIONS,
} from "@/lib/colors";

/* ─── getGrade ─── */

describe("getGrade", () => {
  it.each([
    [0.95, "A"],
    [0.90, "A"],
    [1.0, "A"],
    [0.89, "B"],
    [0.80, "B"],
    [0.79, "C"],
    [0.70, "C"],
    [0.69, "D"],
    [0.60, "D"],
    [0.59, "F"],
    [0.0, "F"],
  ])("score %f returns grade %s", (score, expected) => {
    expect(getGrade(score)).toBe(expected);
  });
});

/* ─── TRAIT_LABELS ─── */

describe("TRAIT_LABELS", () => {
  const expectedKeys = [
    "virtue",
    "goodwill",
    "manipulation",
    "deception",
    "accuracy",
    "reasoning",
    "fabrication",
    "brokenLogic",
    "recognition",
    "compassion",
    "dismissal",
    "exploitation",
  ];

  it("has exactly 12 entries", () => {
    expect(Object.keys(TRAIT_LABELS)).toHaveLength(12);
  });

  it("contains all 12 trait keys", () => {
    for (const key of expectedKeys) {
      expect(TRAIT_LABELS).toHaveProperty(key);
    }
  });

  it("all values are non-empty strings", () => {
    for (const value of Object.values(TRAIT_LABELS)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("has no snake_case keys", () => {
    for (const key of Object.keys(TRAIT_LABELS)) {
      expect(key).not.toContain("_");
    }
  });
});

/* ─── TRAIT_DIMENSIONS ─── */

describe("TRAIT_DIMENSIONS", () => {
  it("has exactly 12 entries", () => {
    expect(Object.keys(TRAIT_DIMENSIONS)).toHaveLength(12);
  });

  it("keys match TRAIT_LABELS keys", () => {
    expect(Object.keys(TRAIT_DIMENSIONS).sort()).toEqual(
      Object.keys(TRAIT_LABELS).sort()
    );
  });

  it("maps ethos traits correctly", () => {
    for (const key of ["virtue", "goodwill", "manipulation", "deception"]) {
      expect(TRAIT_DIMENSIONS[key]).toBe("ethos");
    }
  });

  it("maps logos traits correctly", () => {
    for (const key of ["accuracy", "reasoning", "fabrication", "brokenLogic"]) {
      expect(TRAIT_DIMENSIONS[key]).toBe("logos");
    }
  });

  it("maps pathos traits correctly", () => {
    for (const key of [
      "recognition",
      "compassion",
      "dismissal",
      "exploitation",
    ]) {
      expect(TRAIT_DIMENSIONS[key]).toBe("pathos");
    }
  });

  it("has no snake_case keys", () => {
    for (const key of Object.keys(TRAIT_DIMENSIONS)) {
      expect(key).not.toContain("_");
    }
  });
});

/* ─── DIMENSIONS ─── */

describe("DIMENSIONS", () => {
  it("has exactly 3 entries", () => {
    expect(DIMENSIONS).toHaveLength(3);
  });

  it("contains ethos, logos, pathos keys", () => {
    const keys = DIMENSIONS.map((d) => d.key);
    expect(keys).toEqual(["ethos", "logos", "pathos"]);
  });

  it("each entry has label, sublabel, and color", () => {
    for (const dim of DIMENSIONS) {
      expect(typeof dim.label).toBe("string");
      expect(typeof dim.sublabel).toBe("string");
      expect(typeof dim.color).toBe("string");
    }
  });
});

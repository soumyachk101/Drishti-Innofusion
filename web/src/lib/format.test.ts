// Drishti v0.1 — formatter unit tests | 11-Jul-2026
import { describe, expect, it } from "vitest";
import { cvss, money, moneyFull, riskBucket, severityBucket } from "./format";

describe("money", () => {
  it("compacts millions", () => {
    expect(money(3_500_000)).toBe("$3.5M");
    expect(money(2_400_000)).toBe("$2.4M");
  });
  it("compacts thousands", () => {
    expect(money(50_000)).toBe("$50K");
  });
  it("renders — for null/NaN (never NaN)", () => {
    expect(money(null)).toBe("—");
    expect(money(undefined)).toBe("—");
    expect(money(NaN)).toBe("—");
  });
  it("full form uses separators", () => {
    expect(moneyFull(2_400_000)).toBe("$2,400,000");
  });
});

describe("riskBucket thresholds (UIUX.md §2)", () => {
  it("maps score ranges", () => {
    expect(riskBucket(10)).toBe("safe");
    expect(riskBucket(39)).toBe("safe");
    expect(riskBucket(40)).toBe("medium");
    expect(riskBucket(59)).toBe("medium");
    expect(riskBucket(60)).toBe("high");
    expect(riskBucket(79)).toBe("high");
    expect(riskBucket(80)).toBe("critical");
    expect(riskBucket(100)).toBe("critical");
  });
  it("null → safe (never crash)", () => {
    expect(riskBucket(null)).toBe("safe");
    expect(riskBucket(NaN)).toBe("safe");
  });
});

describe("severityBucket", () => {
  it("maps severities case-insensitively", () => {
    expect(severityBucket("Critical")).toBe("critical");
    expect(severityBucket("HIGH")).toBe("high");
    expect(severityBucket("medium")).toBe("medium");
    expect(severityBucket("low")).toBe("safe");
    expect(severityBucket("")).toBe("safe");
  });
});

describe("cvss", () => {
  it("formats one decimal, — on null", () => {
    expect(cvss(8.8)).toBe("8.8");
    expect(cvss(null)).toBe("—");
  });
});

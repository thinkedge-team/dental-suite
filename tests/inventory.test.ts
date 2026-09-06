/// <reference types="vitest" />

import { describe, it, expect, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { calculateNewStock } from "@/lib/inventory/calc";

describe("Inventory stock delta calculations (calculateNewStock)", () => {
  it("increments stock on RESTOCK", () => {
    const res = calculateNewStock(10, "RESTOCK", 5);
    expect(res.valid).toBe(true);
    expect(res.newStock).toBe(15);
    expect(res.delta).toBe(5);
  });

  it("decrements stock on USAGE and DAMAGED", () => {
    const resUsage = calculateNewStock(10, "USAGE", 4);
    expect(resUsage.valid).toBe(true);
    expect(resUsage.newStock).toBe(6);
    expect(resUsage.delta).toBe(-4);

    const resDamaged = calculateNewStock(6, "DAMAGED", 2);
    expect(resDamaged.valid).toBe(true);
    expect(resDamaged.newStock).toBe(4);
    expect(resDamaged.delta).toBe(-2);
  });

  it("prevents negative stock on excess USAGE", () => {
    const res = calculateNewStock(5, "USAGE", 10);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Stok saat ini tidak mencukupi untuk pemakaian tersebut.");
  });

  it("allows USAGE when quantity exactly equals current stock", () => {
    const res = calculateNewStock(5, "USAGE", 5);
    expect(res.valid).toBe(true);
    expect(res.newStock).toBe(0);
    expect(res.delta).toBe(-5);
  });

  it("adjusts stock correctly to a target physical count on ADJUSTMENT", () => {
    const res1 = calculateNewStock(12, "ADJUSTMENT", 15);
    expect(res1.valid).toBe(true);
    expect(res1.newStock).toBe(15);
    expect(res1.delta).toBe(3);

    const res2 = calculateNewStock(12, "ADJUSTMENT", 8);
    expect(res2.valid).toBe(true);
    expect(res2.newStock).toBe(8);
    expect(res2.delta).toBe(-4);
  });

  it("rejects non-positive quantity", () => {
    expect(calculateNewStock(10, "RESTOCK", 0).valid).toBe(false);
    expect(calculateNewStock(10, "RESTOCK", -5).valid).toBe(false);
    expect(calculateNewStock(10, "USAGE", 0).error).toBe(
      "Jumlah mutasi harus bilangan bulat positif lebih dari 0."
    );
  });

  it("rejects non-integer quantity", () => {
    expect(calculateNewStock(10, "USAGE", 3.5).valid).toBe(false);
    expect(calculateNewStock(10, "USAGE", 3.5).error).toBe(
      "Jumlah mutasi harus bilangan bulat positif lebih dari 0."
    );
  });
});
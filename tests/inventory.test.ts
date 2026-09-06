/// <reference types="vitest" />

import { describe, it, expect } from "vitest";

// Pure calculation function for stock mutation
// Calculates new stock based on current stock, type, and quantity
// Returns the new stock value; validates inputs and prevents negative stock
function calculateNewStock(
  currentStock: number,
  type: "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED",
  quantity: number,
  previousStock?: number
): number {
  // Validate quantity > 0 and integer
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Jumlah harus lebih besar dari 0");
  }

  let delta: number;

  switch (type) {
    case "RESTOCK":
      delta = quantity;
      break;
    case "USAGE":
    case "DAMAGED":
      delta = -quantity;
      break;
    case "ADJUSTMENT":
      // ADJUSTMENT: new stock = quantity (the desired stock level)
      // delta = quantity - previousStock
      // But we return the new stock directly: quantity
      return quantity;
    default:
      throw new Error("Tipe mutasi tidak valid");
  }

  const nextStock = currentStock + delta;

  // Prevent negative stock
  if (nextStock < 0) {
    throw new Error("Stok saat ini tidak mencukupi untuk pemakaian tersebut.");
  }

  return nextStock;
}

describe("calculateNewStock pure calculation logic", () => {
  it("calculates RESTOCK: currentStock + quantity", () => {
    const result = calculateNewStock(10, "RESTOCK", 5);
    expect(result).toBe(15);
  });

  it("calculates USAGE: currentStock - quantity", () => {
    const result = calculateNewStock(10, "USAGE", 3);
    expect(result).toBe(7);
  });

  it("calculates DAMAGED: currentStock - quantity", () => {
    const result = calculateNewStock(10, "DAMAGED", 4);
    expect(result).toBe(6);
  });

  it("calculates ADJUSTMENT: returns quantity (desired stock level)", () => {
    const result = calculateNewStock(10, "ADJUSTMENT", 7);
    expect(result).toBe(7);
  });

  it("prevents negative stock on USAGE that would go below zero", () => {
    // currentStock=2, usage of 5 would give -3, should throw
    expect(() => calculateNewStock(2, "USAGE", 5)).toThrow(
      "Stok saat ini tidak mencukupi untuk pemakaian tersebut."
    );
  });

  it("allows USAGE when quantity exactly equals current stock", () => {
    const result = calculateNewStock(5, "USAGE", 5);
    expect(result).toBe(0);
  });

  it("rejects non-positive quantity", () => {
    expect(() => calculateNewStock(10, "USAGE", 0)).toThrow(
      "Jumlah harus lebih besar dari 0"
    );
    expect(() => calculateNewStock(10, "USAGE", -3)).toThrow(
      "Jumlah harus lebih besar dari 0"
    );
  });

  it("rejects non-integer quantity", () => {
    expect(() => calculateNewStock(10, "USAGE", 3.5)).toThrow(
      "Jumlah harus lebih besar dari 0"
    );
  });

  it("handles ADJUSTMENT with different previous stock values", () => {
    // ADJUSTMENT returns the quantity as the new stock level regardless of previous
    expect(calculateNewStock(100, "ADJUSTMENT", 50)).toBe(50);
    expect(calculateNewStock(100, "ADJUSTMENT", 200)).toBe(200);
  });
});
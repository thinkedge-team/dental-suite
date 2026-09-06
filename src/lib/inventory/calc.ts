export function calculateNewStock(
  previousStock: number,
  type: "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED",
  quantity: number,
): { valid: boolean; newStock: number; delta: number; error?: string } {
  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return {
      valid: false,
      newStock: previousStock,
      delta: 0,
      error: "Jumlah mutasi harus bilangan bulat positif lebih dari 0.",
    };
  }

  let delta = 0;
  if (type === "RESTOCK") {
    delta = quantity;
  } else if (type === "USAGE" || type === "DAMAGED") {
    delta = -quantity;
  } else if (type === "ADJUSTMENT") {
    delta = quantity - previousStock;
  }

  const newStock = previousStock + delta;
  if (newStock < 0) {
    return {
      valid: false,
      newStock: previousStock,
      delta: 0,
      error: "Stok saat ini tidak mencukupi untuk pemakaian tersebut.",
    };
  }

  return { valid: true, newStock, delta };
}

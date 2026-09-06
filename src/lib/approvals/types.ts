export interface ProcurementPayload {
  title: string;
  itemId?: string;
  itemName: string;
  category?: string;
  currentStock?: number;
  minStock?: number;
  unit: string;
  quantity: number;
  estimatedCost?: number;
  urgency: "NORMAL" | "URGENT";
  notes?: string;
  fulfilledAt?: string;
}

export interface MaintenancePayload {
  title: string;
  equipmentName: string;
  urgency: "NORMAL" | "URGENT";
  estimatedCost?: number;
  description: string;
}

export interface OtherPayload {
  title: string;
  estimatedCost?: number;
  description: string;
}

export type ApprovalPayload = ProcurementPayload | MaintenancePayload | OtherPayload;

export function isProcurementPayload(p: unknown): p is ProcurementPayload {
  return (
    typeof p === "object" &&
    p !== null &&
    "itemName" in p &&
    "quantity" in p
  );
}

export function isMaintenancePayload(p: unknown): p is MaintenancePayload {
  return (
    typeof p === "object" &&
    p !== null &&
    "equipmentName" in p
  );
}

export function isOtherPayload(p: unknown): p is OtherPayload {
  return (
    typeof p === "object" &&
    p !== null &&
    "description" in p &&
    !("equipmentName" in p) &&
    !("itemName" in p)
  );
}

export function validateApprovalPayload(
  type: string,
  payload: unknown
): { valid: boolean; error?: string } {
  if (typeof payload !== "object" || payload === null) {
    return { valid: false, error: "Payload permohonan harus berupa objek valid." };
  }

  const p = payload as Record<string, unknown>;

  if (type === "PROCUREMENT") {
    if (typeof p.title !== "string" || p.title.trim().length === 0) {
      return { valid: false, error: "Judul permohonan pengadaan wajib diisi." };
    }
    if (typeof p.itemName !== "string" || p.itemName.trim().length === 0) {
      return { valid: false, error: "Nama barang wajib diisi." };
    }
    if (typeof p.unit !== "string" || p.unit.trim().length === 0) {
      return { valid: false, error: "Satuan barang wajib diisi." };
    }
    if (
      typeof p.quantity !== "number" ||
      !Number.isInteger(p.quantity) ||
      p.quantity <= 0
    ) {
      return {
        valid: false,
        error: "Jumlah barang harus berupa bilangan bulat positif lebih dari 0.",
      };
    }
    if (p.urgency !== "NORMAL" && p.urgency !== "URGENT") {
      return {
        valid: false,
        error: "Tingkat urgensi harus NORMAL atau URGENT.",
      };
    }
    if (
      p.estimatedCost !== undefined &&
      (typeof p.estimatedCost !== "number" || p.estimatedCost < 0)
    ) {
      return {
        valid: false,
        error: "Estimasi biaya harus berupa angka non-negatif.",
      };
    }
    return { valid: true };
  }

  if (type === "MAINTENANCE") {
    if (typeof p.title !== "string" || p.title.trim().length === 0) {
      return { valid: false, error: "Judul permohonan pemeliharaan wajib diisi." };
    }
    if (typeof p.equipmentName !== "string" || p.equipmentName.trim().length === 0) {
      return { valid: false, error: "Nama alat / unit wajib diisi." };
    }
    if (typeof p.description !== "string" || p.description.trim().length === 0) {
      return { valid: false, error: "Deskripsi perbaikan atau pemeliharaan wajib diisi." };
    }
    if (p.urgency !== "NORMAL" && p.urgency !== "URGENT") {
      return {
        valid: false,
        error: "Tingkat urgensi harus NORMAL atau URGENT.",
      };
    }
    if (
      p.estimatedCost !== undefined &&
      (typeof p.estimatedCost !== "number" || p.estimatedCost < 0)
    ) {
      return {
        valid: false,
        error: "Estimasi biaya harus berupa angka non-negatif.",
      };
    }
    return { valid: true };
  }

  if (type === "OTHER") {
    if (typeof p.title !== "string" || p.title.trim().length === 0) {
      return { valid: false, error: "Judul permohonan operasional wajib diisi." };
    }
    if (typeof p.description !== "string" || p.description.trim().length === 0) {
      return { valid: false, error: "Deskripsi permohonan operasional wajib diisi." };
    }
    if (
      p.estimatedCost !== undefined &&
      (typeof p.estimatedCost !== "number" || p.estimatedCost < 0)
    ) {
      return {
        valid: false,
        error: "Estimasi biaya harus berupa angka non-negatif.",
      };
    }
    return { valid: true };
  }

  return { valid: false, error: "Tipe permohonan tidak dikenali." };
}

export function canUserReviewRequest(
  userRole: string,
  userBranchId: string | null | undefined,
  targetBranchId: string
): boolean {
  if (userRole === "DIRECTOR" || userRole === "SUPER_ADMIN") {
    return true;
  }
  if (userRole === "MANAGER" && Boolean(userBranchId) && userBranchId === targetBranchId) {
    return true;
  }
  return false;
}

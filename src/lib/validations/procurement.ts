import { z } from "zod";

// Step 1: Procurement Request (Draft / Submit)
export const createProcurementSchema = z.object({
  requestTitle: z.string().min(1, "Request Title is required"),
  itemName: z.string().min(1, "Item Name/Description is required"),
  category: z.string().min(1, "Category is required"),
  assetType: z.string().min(1, "Asset Type is required"),
  department: z.string().min(1, "Department is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  requiredDate: z.string().min(1, "Required Date is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  justification: z.string().min(5, "Business Justification is required"),
  technicalSpecs: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED"]).default("DRAFT"),
});

export type CreateProcurementSchema = z.infer<typeof createProcurementSchema>;

// Step 2: Procurement Review
export const procurementReviewSchema = z.object({
  vendorId: z.string().min(1, "Vendor selection is required"),
  estimatedCost: z.coerce.number().min(1, "Estimated cost must be greater than 0"),
  expectedDeliveryDate: z.string().min(1, "Expected Delivery Date is required"),
  procurementNotes: z.string().optional(),
  action: z.enum(["FORWARD_TO_FINANCE", "REJECT", "REQUEST_CLARIFICATION"])
});

export type ProcurementReviewSchema = z.infer<typeof procurementReviewSchema>;

// Step 3: Finance Approval
export const financeApprovalSchema = z.object({
  approvedAmount: z.coerce.number().min(1, "Approved amount is required for approval"),
  financeRemarks: z.string().optional(),
  action: z.enum(["APPROVE", "REJECT", "SEND_BACK"]),
});

export type FinanceApprovalSchema = z.infer<typeof financeApprovalSchema>;

// Purchase Order Creation
export const purchaseOrderSchema = z.object({
  poNumber: z.string().min(1, "PO number is required"),
  vendorId: z.string().min(1, "Vendor ID is required"),
  procurementRequestId: z.string().min(1, "Procurement Request is required"),
  date: z.string().min(1, "PO Date is required"),
  expectedDelivery: z.string().optional(),
  approvedAmount: z.coerce.number().min(1, "Order Amount is required"),
  paymentTerms: z.string().optional(),
});

export type PurchaseOrderSchema = z.infer<typeof purchaseOrderSchema>;

// Vendor Management
export const vendorSchema = z.object({
  name: z.string().min(1, "Vendor Name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  isPreferred: z.boolean().default(false),
});

export type VendorSchema = z.infer<typeof vendorSchema>;

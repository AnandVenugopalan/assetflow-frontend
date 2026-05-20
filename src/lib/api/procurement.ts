import api from "../api";
import { 
  CreateProcurementSchema, 
  ProcurementReviewSchema, 
  FinanceApprovalSchema 
} from "../validations/procurement";

export const ProcurementApi = {
  // Get all procurement requests
  getAll: async () => {
    const res = await api.get("/procurement/requests");
    return res.data;
  },

  // Get department user's requests
  getMyRequests: async () => {
    const res = await api.get("/procurement/requests/my-requests");
    return res.data;
  },

  // Get single request
  getOne: async (id: string) => {
    const res = await api.get(`/procurement/requests/${id}`);
    return res.data;
  },

  // Step 1: Create Draft/Submit Request
  create: async (data: CreateProcurementSchema) => {
    const res = await api.post("/procurement/requests", data);
    return res.data;
  },

  // Step 2: Procurement Manager Review
  review: async (id: string, data: ProcurementReviewSchema) => {
    const res = await api.patch(`/procurement/requests/${id}/review`, data);
    return res.data;
  },

  // Step 3: Finance Manager Approval
  financeApproval: async (id: string, data: FinanceApprovalSchema) => {
    const res = await api.patch(`/procurement/requests/${id}/finance-approval`, data);
    return res.data;
  },

  // Step 1 (rework): Submit Clarification
  submitClarification: async (id: string, data: any) => {
    const res = await api.patch(`/procurement/requests/${id}/submit-clarification`, data);
    return res.data;
  },

  // Uploads
  uploadQuotation: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/procurement/requests/${id}/quotation`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  uploadTechnicalEval: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/procurement/requests/${id}/technical-eval`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  // Get dashboard metrics
  getDashboardStats: async () => {
    const res = await api.get("/procurement/dashboard-stats");
    return res.data;
  }
};

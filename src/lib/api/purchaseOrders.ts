import api from "../api";

export const PurchaseOrdersApi = {
  getAll: async () => {
    const res = await api.get("/purchase-orders");
    return res.data;
  },

  getOne: async (id: string) => {
    const res = await api.get(`/purchase-orders/${id}`);
    return res.data;
  },

  create: async (data: {
    vendorId: string;
    procurementRequestId: string;
    approvedAmount?: number;
    paymentTerms?: string;
    expectedDelivery?: string;
  }) => {
    const res = await api.post("/purchase-orders", data);
    return res.data;
  },

  update: async (id: string, data: { status?: string; poFilePath?: string }) => {
    const res = await api.patch(`/purchase-orders/${id}`, data);
    return res.data;
  },

  markAsOrdered: async (id: string) => {
    const res = await api.patch(`/purchase-orders/${id}/ordered`);
    return res.data;
  },

  markAsCompleted: async (id: string) => {
    const res = await api.patch(`/purchase-orders/${id}/completed`);
    return res.data;
  }
};

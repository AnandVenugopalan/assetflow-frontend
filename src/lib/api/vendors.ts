import api from "../api";
import { VendorSchema } from "../validations/procurement";

export const VendorsApi = {
  getAll: async () => {
    const res = await api.get("/vendors");
    return res.data;
  },

  getOne: async (id: string) => {
    const res = await api.get(`/vendors/${id}`);
    return res.data;
  },

  create: async (data: VendorSchema) => {
    const res = await api.post("/vendors", data);
    return res.data;
  },

  update: async (id: string, data: Partial<VendorSchema> & { isActive?: boolean }) => {
    const res = await api.patch(`/vendors/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/vendors/${id}`);
    return res.data;
  }
};

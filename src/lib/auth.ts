import api from "../lib/api";

export const loginUser = (data: any) => api.post("/auth/login", data);
export const registerUser = (data: any) => api.post("/auth/register", data);
export const logoutUser = () => api.post("/auth/logout", {});

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ REQUEST LOGGER
api.interceptors.request.use(
  (config) => {
    console.log(
      "📡 API REQUEST →",
      config.method?.toUpperCase(),
      config.baseURL + config.url,
      "Payload:",
      config.data
    );

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ REQUEST ERROR:", error);
    return Promise.reject(error);
  }
);

// ✅ RESPONSE LOGGER
api.interceptors.response.use(
  (response) => {
    console.log("✅ API RESPONSE →", response.status, response.data);
    return response;
  },
  (error) => {
    console.error(
      "❌ API RESPONSE ERROR →",
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default api;

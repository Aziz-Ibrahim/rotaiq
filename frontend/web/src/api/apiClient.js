import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/", // Django API base URL
});

// Request interceptor to add the JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8084";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export default axiosInstance;

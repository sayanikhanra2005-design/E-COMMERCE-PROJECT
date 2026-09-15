import axios from "axios";

// Determine API base URL:
// 1. Explicit environment variable (e.g., VITE_API_URL from Vercel or .env)
// 2. Dynamically infer from the current browser host on port 8080
// 3. Fallback to http://16.16.78.80:8080
const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
    }
    if (typeof window !== "undefined" && window.location && window.location.hostname) {
        const protocol = window.location.protocol || "http:";
        const host = window.location.hostname;
        return `${protocol}//${host}:8080`;
    }
    return "http://16.16.78.80:8080";
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically send JWT with every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
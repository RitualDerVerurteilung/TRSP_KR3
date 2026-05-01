import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    }
});

apiClient.interceptors.request.use(
    (config) => {
        let accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        let accessToken = localStorage.getItem('accessToken');
        let refreshToken = localStorage.getItem('refreshToken');
        let originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            if (!accessToken || !refreshToken) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return Promise.reject(error);
            }
            try {
                let response = await api.refresh(refreshToken);
                let isRefreshExpired = response.data.refresh_expired;
                if (isRefreshExpired) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    return Promise.reject(error);
                }
                let newAccessToken = response.data.accessToken;
                let newRefreshToken = response.data.refreshToken;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                return apiClient(originalRequest);
            }
            catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error)
    }
);

export const api = {

    registerUser: async (user) => {
        let response = await apiClient.post("/auth/register", user);
        return response.data;
    },

    loginUser: async (loginData) => {
        let response = await apiClient.post("/auth/login", loginData);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return response.data;
    },

    meUser: async () => {
        let response = await apiClient.post("/auth/me");
        return response.data;
    },

    refreshUser: async (refreshToken) => {
        let response = await apiClient.post("/auth/refresh", refreshToken);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return response.data;
    },

    createProduct: async (product) => {
        let response = await apiClient.post("/products", product);
        return response.data;
    },
    getProducts: async () => {
        let response = await apiClient.get("/products");
        return response.data;
    },
    getProductById: async (id) => {
        let response = await apiClient.get(`/products/${id}`);
        return response.data;
    },
    updateProduct: async (id, product) => {
        let response = await apiClient.patch(`/products/${id}`, product);
        return response.data;
    },
    deleteProduct: async (id) => {
        let response = await apiClient.delete(`/products/${id}`);
        return response.data;
    }
}

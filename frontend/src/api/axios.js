import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;

        const skipRetry = ['/auth/me', '/auth/refresh', '/auth/login'];
        const isSkipped = skipRetry.some((path) => original.url?.includes(path));

        if (err.response?.status === 401 && !original._retry && !isSkipped) {
            original._retry = true;
            try {
                await api.post('/auth/refresh');
                return api(original);
            } catch {
                window.location.href = '/login';
            }
        }

        return Promise.reject(err);
    }
);

export default api;


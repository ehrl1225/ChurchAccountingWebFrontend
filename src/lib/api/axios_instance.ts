
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401){
            const currentPath = window.location.pathname;
            if (currentPath == "/"){
                window.location.href = '/auth/login'
            }
            else if (currentPath !== '/auth/login') {
                window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`
            }
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;
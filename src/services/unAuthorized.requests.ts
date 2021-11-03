import axios from "axios";

const unAuthorizedRequests = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL,
    withCredentials: false,
});

unAuthorizedRequests.interceptors.request.use(async config => {
    return {
        ...config,
    };
});

export default unAuthorizedRequests;

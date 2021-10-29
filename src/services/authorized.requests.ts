import axios from "axios";

const authorizedRequests = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  withCredentials: false
});

authorizedRequests.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  return {
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
      ...config.headers,
    },
  };
});

export default authorizedRequests;
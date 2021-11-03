import ENDPOINTS from "../endpoints";
import authorizedRequests from "../authorized.requests";

export const getUserDetailApi = () => {
    return authorizedRequests.get(ENDPOINTS.USER + "/detail");
};

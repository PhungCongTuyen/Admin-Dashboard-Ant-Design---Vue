import ENDPOINTS from "../endpoints";
import unAuthorizedRequests from "../unAuthorized.requests";

interface UserInfo {
  id: string,
  email: string,
  role: string,
  deleted: false,
  createdAt: string,
  updatedAt: string,
  token: string,
}

interface UserPayload {
  email: string,
  password: string,
}

export const logIn = (data: UserPayload) : Promise<UserInfo> => {
  return unAuthorizedRequests.post(ENDPOINTS.AUTH_LOGIN, data);
};

import ENDPOINTS from "../endpoints";
import authorizedRequests from "../authorized.requests";

export const getUserDetailApi = () => {
    return authorizedRequests.get(ENDPOINTS.USER + "/detail");
};

export const getListUserApi = ({
    page,
    pageSize,
    sort,
    search,
}: {
    page: number;
    pageSize: number;
    sort: string;
    search: string;
}) => {
    return authorizedRequests.get(ENDPOINTS.USER, {
        params: {
            page: page,
            pageSize: pageSize,
            sort: sort,
            search: search,
        },
    });
};

export const deleteUserApi = ({ id }: { id: string }) => {
    return authorizedRequests.delete(ENDPOINTS.USER + `/${id}`);
};

export const createUserApi = ({
    email,
    password,
    role,
}: {
    email: string;
    password: string;
    role: string;
}) => {
    return authorizedRequests.post(ENDPOINTS.USER, {
        email: email,
        password: password,
        role: role,
    });
};

export const editUserApi = ({
    id,
    password,
    role,
}: {
    id: string;
    password?: string;
    role: string;
}) => {
    return authorizedRequests.patch(ENDPOINTS.USER + `/${id}`, {
        password: password,
        role: role,
    });
};

import authorizedRequests from "@/services/authorized.requests";
import ENDPOINTS from "@/services/endpoints";

export const getListAwardsApi = ({
    page,
    pageSize,
    sort,
    search,
}: {
    page?: number;
    pageSize?: number;
    sort?: string;
    search?: string;
}) => {
    return authorizedRequests.get(ENDPOINTS.AWARD, {
        params: {
            page: page,
            pageSize: pageSize,
            sort: sort,
            search: search,
        },
    });
};

export const createAwardApi = (data: FormData) => {
    return authorizedRequests.post(ENDPOINTS.AWARD, data);
};

export const deleteAwardApi = ({ id }: { id: string }) => {
    return authorizedRequests.delete(ENDPOINTS.AWARD + `/${id}`);
};

export const editAwardApi = (data: FormData, id: string) => {
    return authorizedRequests.put(ENDPOINTS.AWARD + `/${id}`, data);
};

export const assignAward = ({
    awardId,
    imageId,
}: {
    awardId: string;
    imageId: string;
}) => {
    return authorizedRequests.patch(ENDPOINTS.ASSIGN_AWARD, {
        awardId: awardId,
        imageId: imageId,
    });
};

export const unassignedAward = (id: string) => {
    return authorizedRequests.patch(ENDPOINTS.UNASSIGN_AWARD(id));
};

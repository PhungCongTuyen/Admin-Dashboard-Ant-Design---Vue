import authorizedRequests from "@/services/authorized.requests";
import ENDPOINTS from "@/services/endpoints";

export const getListImageApi = ({
    page,
    pageSize,
    sort,
    status,
}: {
    page: number;
    pageSize: number;
    sort: string;
    status?: string;
}) => {
    return authorizedRequests.get(ENDPOINTS.IMAGES, {
        params: {
            page: page,
            pageSize: pageSize,
            sort: sort,
            status: status,
        },
    });
};

export const getListImageAwardApi = ({
    page,
    pageSize,
    sort,
    awarded,
}: {
    page: number;
    pageSize: number;
    sort: string;
    awarded: string;
}) => {
    return authorizedRequests.get(ENDPOINTS.IMAGES_AWARD, {
        params: {
            page: page,
            pageSize: pageSize,
            sort: sort,
            awarded: awarded,
        },
    });
};

export const updateStatusImageApi = ({
    imageId,
    status,
}: {
    imageId: string;
    status: string;
}) => {
    return authorizedRequests.patch(ENDPOINTS.IMAGES_UPDATE, {
        imageId: imageId,
        status: status,
    });
};

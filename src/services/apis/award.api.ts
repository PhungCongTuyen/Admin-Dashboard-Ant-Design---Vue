import authorizedRequests from "@/services/authorized.requests";
import ENDPOINTS from "@/services/endpoints";

const getListAwardsApi = ({
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
    return authorizedRequests.get(ENDPOINTS.AWARD, {
        params: {
            page: page,
            pageSize: pageSize,
            sort: sort,
            search: search,
        },
    });
};

const createAwardApi = ({
    name,
    description,
    image,
}: {
    name: string;
    description: string;
    image: BinaryType;
}) => {
    return authorizedRequests.post(ENDPOINTS.AWARD, {
        name: name,
        description: description,
        image: image,
    });
};

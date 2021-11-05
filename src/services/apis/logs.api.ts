import authorizedRequests from "@/services/authorized.requests";
import ENDPOINTS from "@/services/endpoints";

export const getListLogsApi = ({
    page,
    pageSize,
    dateStart,
    dateEnd,
    userEmail,
}: {
    page: number;
    pageSize: number;
    dateStart: number;
    dateEnd: number;
    userEmail: string;
}) => {
    return authorizedRequests.get(ENDPOINTS.LOGS, {
        params: {
            page: page,
            pageSize: pageSize,
            dateStart: dateStart,
            dateEnd: dateEnd,
            userEmail: userEmail,
        },
    });
};

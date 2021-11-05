const ENDPOINTS = {
    HEALTH_STARTUP: "/health/kube-startup",
    HEALTH_LIVENESS: "/health/kube-liveness",
    HEALTH_READINESS: "/health/kube-readiness",
    AUTH_LOGIN: "/auth/login",
    USER: "/user",
    CUSTOMER: "/customer",
    IMAGES: "/image",
    IMAGE_UPLOAD: "/image/upload",
    IMAGE_UPLOAD_FROM_URL: "/image/upload-from-url",
    IMAGE_LIKE: "/image/like",
    IMAGE: (imageId: string) => `/image/${imageId}`,
    IMAGE_UPDATE_STATUS: "/image/update-status",
    IMAGE_ASSIGN_AWARD: "/image/assign-award",
    IMAGE_UNASSIGNED_AWARD: (imageId: string) =>
        `/image/${imageId}/unassign-award`,
    AWARD: "/award",
    AWARD_ACTIONS: (awardId: string) => `/award/${awardId}`,
    LOGS: "/log",
};

export default ENDPOINTS;

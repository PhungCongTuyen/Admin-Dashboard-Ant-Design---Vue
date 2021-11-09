const ENDPOINTS = {
    HEALTH_STARTUP: "/health/kube-startup",
    HEALTH_LIVENESS: "/health/kube-liveness",
    HEALTH_READINESS: "/health/kube-readiness",
    AUTH_LOGIN: "/auth/login",
    USER: "/user",
    CUSTOMER: "/customer",
    IMAGES: "/image/images-by-admin",
    IMAGES_AWARD: "/image/images-with-award",
    IMAGES_UPDATE: "/image/update-status",
    AWARD: "/award",
    LOGS: "/log",
};

export default ENDPOINTS;

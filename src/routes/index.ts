import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/login",
            name: "LogIn",
            meta: {
                layout: "auth",
            },
            component: () => import("../pages/SignIn.vue"),
        },
        {
            // will match everything
            path: "/:pathMatch(.*)*",
            name: "NotFound",
            meta: {
                layout: "dashboard",
                acceptedRole: ["admin", "moderator"],
            },
            component: () => import("../pages/404.vue"),
        },
        {
            path: "/home",
            name: "Home",
            component: () => import("../pages/Home.vue"),
            meta: {
                acceptedRole: ["admin", "moderator"],
                layout: "dashboard",
            },
        },
        {
            path: "/images-management",
            name: "ImagesManagement",
            meta: {
                acceptedRole: ["admin", "moderator"],
                layout: "dashboard",
            },
            component: () => import("../pages/ImagesManagement.vue"),
        },
        {
            path: "/awards-management",
            name: "AwardsManagement",
            meta: {
                acceptedRole: ["admin"],
                layout: "dashboard",
            },
            component: () => import("../pages/AwardsManagement.vue"),
        },
        {
            path: "/award-settings",
            name: "AwardSettings",
            meta: {
                acceptedRole: ["admin"],
                layout: "dashboard",
            },
            component: () => import("../pages/AwardSettings.vue"),
        },
        {
            path: "/account-management",
            name: "AccountManagement",
            meta: {
                acceptedRole: ["admin"],
                layout: "dashboard",
            },
            component: () => import("../pages/AccountManagement.vue"),
        },
        {
            path: "/logs",
            name: "Logs",
            meta: {
                acceptedRole: ["admin"],
                layout: "dashboard",
            },
            component: () => import("../pages/Logs.vue"),
        },
        {
            path: "/unauthorized",
            name: "Unauthorized",
            meta: {
                layout: "dashboard",
                acceptedRole: ["admin", "moderator"],
            },
            component: () => import("../pages/Unauthorized.vue"),
        },
    ],
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const listRole = to.meta.acceptedRole as string[];

    if (!isAuthenticated && to.path !== "/login") {
        next("/login");
    } else if (isAuthenticated) {
        if (to.path === "/login" || to.path === "/") {
            next({ path: "images-management" });
        } else if (role) {
            if (to.path !== "images-management") {
                if (listRole.includes(role)) {
                    next();
                } else next({ path: "/unauthorized" });
            } else next();
        } else next({ path: "/unauthorized" });
    } else next();
});

export default router;

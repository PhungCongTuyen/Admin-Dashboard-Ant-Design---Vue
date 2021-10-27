import Vue from 'vue';
import VueRouter from 'vue-router';
import store from "@/store";

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/sign-in',
            name: 'Sign In',
            meta: {
                requiresAuth: false,
                layout: "auth",
            },
            component: () => import('../pages/Sign-In.vue'),
        },
        {
            // will match everything
            path: '*',
            name: 'Not Found',
            meta: {
                requiresAuth: true,
                layout: "dashboard",
            },
            component: () => import('../pages/404.vue'),

        },
        {
            path: '/',
            name: 'Home',
            component: () => import('../pages/Home.vue'),
            meta: {
                requiresAuth: true,
                layout: 'dashboard',
            }
        },
        {
            path: '/images-management',
            name: 'Images Management',
            meta: {
                requiresAuth: true,
                layout: 'dashboard',
            },
            component: () => import('../pages/ImagesManagement.vue')
        },
        {
            path: '/award-settings',
            name: 'Award Settings',
            meta: {
                requiresAuth: true,
                isAdmin: true,
                layout: 'dashboard',
            },
            component: () => import('../pages/AwardSettings.vue')
        },
        {
            path: '/account-managment',
            name: 'Account Management',
            meta: {
                requiresAuth: true,
                isAdmin: true,
                layout: 'dashboard',
            },
            component: () => import('../pages/ImagesManagement.vue')
        },
        {
            path: '/logs',
            name: 'Logs',
            meta: {
                requiresAuth: true,
                isAdmin: true,
                layout: 'dashboard',
            },
            component: () => import('../pages/Logs.vue')
        }
    ]
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated && to.path !== '/sign-in') {
        console.log(isAuthenticated, to.path);
        next({path: '/sign-in'})
    }
    if (isAuthenticated && to.path === '/sign-in') {
        next({path: '/'})
    }
    else if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            next({path: '/sign-in'})
        } else if (to.matched.some(record => record.meta.isAdmin)) {
            next()
        } else next()
    } else next()
});

export default router

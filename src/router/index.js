// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import HospitalCharges from '../components/HospitalCharges.vue';
import ComprehendMedicalApp from '../components/ComprehendMedicalApp.vue';
import Login from '../components/Loginpage.vue';
import RegisterPage from "../components/RegisterPage.vue";
import Loginpage from "../components/Loginpage.vue";
import store from "../store/index.js";
const routes = [
    {
        path: '/', component: ComprehendMedicalApp,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/hospital-charges', component: HospitalCharges,
        meta: {
            requiresAuth: true
        }
    },
    { path: '/login', component: Loginpage },
    { path: '/register', component: RegisterPage }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const currentUser = store.getters.currentUser;

    if (requiresAuth && !currentUser) {
        next('/login');
    } else {
        next();
    }
});

export default router;

// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import HospitalCharges from '../components/HospitalCharges.vue';
import ComprehendMedicalApp from '../components/ComprehendMedicalApp.vue';
import Login from '../components/Loginpage.vue';
import RegisterPage from "../components/RegisterPage.vue";
import Loginpage from "../components/Loginpage.vue";
const routes = [
    { path: '/', component: ComprehendMedicalApp },
    { path: '/hospital-charges', component: HospitalCharges },
    { path: '/login', component: Loginpage },
    { path: '/register', component: RegisterPage }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import HospitalCharges from '../components/HospitalCharges.vue';
import ComprehendMedicalApp from '../components/ComprehendMedicalApp.vue';

const routes = [
    { path: '/', component: ComprehendMedicalApp },
    { path: '/hospital-charges', component: HospitalCharges },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/tinyElitedangerous',
    name: 'Scene',
    component: () => import('../views/Scene.vue')
  },
  {
    path: '/demo',
    name: 'Demo',
    component: () => import('../views/Demo.vue')
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router
import { createRouter, createWebHashHistory } from 'vue-router'
import LoginPage from '@/components/LoginPage.vue'
import MessagesDashboard from '@/components/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/dashboard/:email',
    name: 'dashboard',
    component: MessagesDashboard
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

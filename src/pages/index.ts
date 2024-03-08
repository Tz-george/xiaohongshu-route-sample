import {createRouter, createWebHistory} from "vue-router";
import { routes } from './routes.ts'
export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  if (to.name === 'Detail') {
    if (from.name === 'Home') {
      return true
    } else {
      return { name: 'DetailId', params: to.params }
    }
  }
})

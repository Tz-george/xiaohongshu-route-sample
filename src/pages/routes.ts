import { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
  path: "/",
  redirect: '/home'
}, {
  path: "/home",
  name: "Home",
  component: () => import("./Home.vue"),
  children: [
    {
      path: ':id',
      name: "Detail",
      component: () => import('./Detail.vue'),
    }
  ]
}, {
  path: '/home/:id',
    name: "DetailId",
    component: () => import('./Detail.vue')
  }
]

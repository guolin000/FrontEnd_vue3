import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Layout",
    component: () => import("../layout"), // 布局组件
    redirect: "/index",
    children: [
      {
        path: "index", // 注意：子路由路径不需要前缀斜杠
        name: "首页",
        component: () => import("../views/index/index.vue"),
      },
      {
        path: "userCenter",
        name: "个人中心",
        component: () => import("../views/userCenter/index.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

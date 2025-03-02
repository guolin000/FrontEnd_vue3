// 路由守卫实现
import store from "@/store";
import router from "@/router/index";
import {ref} from "vue";

router.beforeEach((to, from, next) => {
    let token = sessionStorage.getItem("token")
    // let token=ref(sessionStorage.getItem("token"))
    console.log("token=" + token);
    let hasRoutes = store.state.hasRoutes;
    // let menuList=ref(sessionStorage.getItem("menuList"))
    let menuList = JSON.parse(sessionStorage.getItem("menuList") || "[]")
    // console.log("to.path="+to.path);
    console.log("menuList=" + menuList)
    console.log("hasRoutes=" + hasRoutes)
    const whiteList = ['/login'] // 白名单
    if (token) {
        if (!hasRoutes && menuList.length > 0) {
            bindRoute(menuList);
            store.commit("SET_ROUTES_STATE", true);
            // 动态路由加载后，重定向到目标路径
            next(to.fullPath); // 使用 fullPath 确保 hash 模式正确跳转
        } else if (hasRoutes) {
            next();
        } else {
            // 有 token 但无 menuList，跳转登录页重新获取
            next("/login");
        }
    } else {
        if (whiteList.includes(to.path)) {
            next();
        } else {
            next("/login");
        }
    }
})

// 动态绑定路由
const bindRoute = (menuList) => {
    let newRoutes = router.options.routes;
    menuList.forEach(menu => {
        if (menu.children) {
            menu.children.forEach(m => {
                // 菜单转成路由
                let route = menuToRoute(m, menu.name);
                if (route) {
                    newRoutes[0].children.push(route); // 添加到路由管理
                }
            })
        }
    })
    // 重新添加到路由
    newRoutes.forEach(route => {
        router.addRoute(route);
    })
    // 添加兜底路由，防止未匹配路径出错
    router.addRoute({path: "/:pathMatch(.*)", redirect: "/index"});
}

// 菜单转成路由
const menuToRoute = (menu, parentName) => {

    if (!menu.component) {
        return null
    } else {
        let route = {
            name: menu.name,
            path: menu.path,
            meta: {
                parentName: parentName
            }
        }
        route.component = () => import('@/views/' + menu.component + '.vue')

        return route
    }
}

// const menuList=JSON.parse(sessionStorage.getItem("menuList"))
// const token=sessionStorage.getItem("token")
//
// console.log(typeof menuList);
// if(token){
//     console.log("动态绑定路由")
//     bindRoute(menuList); // 动态绑定路由
// }

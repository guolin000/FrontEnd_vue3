import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import '@/router/permission.js'
import 'element-plus/dist/index.css'
import '@/assets/styles/border.css'
import '@/assets/styles/reset.css'

import SvgIcon from '@/icons'

// 国际化中文
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {post} from "axios";

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css'; // 使用 Ant Design 的 reset.css


const app=createApp(App)

app.use(ElementPlus, {
    locale: zhCn,
})

SvgIcon(app);
app.use(Antd);
app.use(store)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

// 定时刷新 Token（每 4 分钟）
setInterval(async () => {
    const token = window.sessionStorage.getItem('token');
    if (token) {
        try {
            const res = await post('/api-token-refresh/', { token });
            window.sessionStorage.setItem('token', res.token);
            console.log('Token refreshed:', res.token);
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
    }
}, 240000);  // 4 分钟 = 240秒

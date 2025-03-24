// 引入axios
import axios from 'axios';
import store from '@/store'
import {ElMessage} from 'element-plus';
//使用 axios 库封装了常见的 HTTP 请求方法（GET、POST、DELETE 和文件上传），并配置了请求和响应拦截器。
// 为前端提供一个统一的网络请求接口，封装了 axios

// 根据环境变量动态设置 baseUrl
const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.VUE_APP_API_BASE_URL // 需在 .env 文件中定义 VUE_APP_API_BASE_URL
    : 'http://localhost:8000/'; // 默认本地开发地址（Django 服务器）
// let baseUrl="http://localhost:8000/";  //Django服务器地址
// 创建axios实例
const httpService = axios.create({
    // url前缀-'http:xxx.xxx'
    // baseURL: process.env.BASE_API, // 生产环境可以通过环境变量（如 process.env.BASE_API）动态替换 baseUrl
    baseURL: baseUrl,  //所有请求的 URL 都会拼接在这个基础地址后。
    // 请求超时时间
    timeout: 4000 // 需自定义  //请求超时时间为 3000 毫秒（3 秒），超时后会触发错误
});

// 刷新 Token 的函数
async function refreshToken() {
    const oldToken = window.sessionStorage.getItem('token');
    if (!oldToken) {
        throw new Error('No token available');
    }
    try {
        const response = await httpService.post('/api-token-refresh/', {token: oldToken});
        const newToken = response.data.token;
        window.sessionStorage.setItem('token', newToken);
        return newToken;
    } catch (error) {
        ElMessage.error('登录已过期，请重新登录');
        window.sessionStorage.removeItem('token');
        window.location.href = '/login';
        throw error;
    }
}

// 响应拦截器
let isRefreshing = false;  // 防止并发刷新
let failedQueue = [];      // 存储因 Token 过期而失败的请求

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

//添加请求和响应拦截器
// 添加请求拦截器
httpService.interceptors.request.use(function (config) {
    // 每次请求发送前执行，用于修改请求配置
    // 将存储在 sessionStorage 中的 token 添加到请求头中，用于后端认证
    config.headers.AUTHORIZATION = window.sessionStorage.getItem('token') || store.getters.GET_TOKEN;
    //console.log("store="+store.getters.GET_TOKEN)
    //config.headers.TOKEN=store.getters.GET_TOKEN
    return config;
}, function (error) {
    //请求准备阶段出错（如网络断开）
    console.error('Request Error:', error);
    ElMessage.error('请求发送失败，请检查连接');
    return Promise.reject(error);
});

// 添加响应拦截器
httpService.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});

/**
 * 封装 HTTP 请求的通用方法
 * @param {string} method - 请求方法（get、post、delete 等）
 * @param {string} url - 请求地址（相对路径）
 * @param {Object} data - 请求参数（GET 用 params，其他用 data）
 * @param {Object} customConfig - 自定义配置（可选）
 * @returns {Promise} - 返回 Promise 对象
 */
function request(method, url, data = {}, customConfig = {}) {
    const config = {
        url,
        method,
        ...customConfig,
    };
    if (method.toLowerCase() === 'get') {
        config.params = data;
    } else {
        config.data = data;
    }

    return new Promise((resolve, reject) => {
        httpService(config)
            .then((response) => {
                console.log(`${method.toUpperCase()} ${url} Success:`, response);
                resolve(response);
            })
            .catch((error) => {
                console.error(`${method.toUpperCase()} ${url} Error:`, error);
                reject(error);
            });
    });
}

/* 网络请求部分 */

/**
 * GET 请求
 * @param {string} url - 请求地址
 * @param {Object} params - 查询参数
 */
export function get(url, params = {}) {
    return request('get', url, params);
}

/**
 * POST 请求
 * @param {string} url - 请求地址
 * @param {Object} params - 请求体参数
 */
export function post(url, params = {}) {
    return request('post', url, params);
}

/**
 * DELETE 请求
 * @param {string} url - 请求地址
 * @param {Object} params - 请求体参数
 */
export function del(url, params = {}) {
    return request('delete', url, params);
}

/**
 * 文件上传请求
 * @param {string} url - 请求地址
 * @param {FormData} params - 文件数据（FormData 对象）
 */
export function fileUpload(url, params = {}) {
    return request('post', url, params, {
        headers: {'Content-Type': 'multipart/form-data'},
    });
}

/**
 * 获取服务器基础地址
 * @returns {string} - 当前 baseUrl
 */
export function getServerUrl() {
    return baseUrl;
}


/**
 * PUT 请求
 * @param {string} url - 请求地址
 * @param {Object} params - 请求体参数
 */
export function put(url, params = {}) {
    return request('put', url, params, {
        headers: {'Content-Type': 'multipart/form-data'},  // 支持文件上传
    });
}

// 默认导出
export default {
    get,
    post,
    del,
    put,
    fileUpload,
    getServerUrl,
};

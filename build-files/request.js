import axios from 'axios';
import axiosConfig from '%%axiosConfig%%';

/**
 * baseURl
 */
const baseURL = process.env['BASE_API'];
/**
 * 超时时间
 */
const timeout = "%%timeout%%";

/** 创建axios请求 */
const service = axios.create({
    baseURL: baseURL,
    timeout: timeout
});

/** 请求拦截请求前 */
service.interceptors.request.use(axiosConfig.requestInterceptors);

/** 请求拦截请求后 */
service.interceptors.response.use(axiosConfig.success, axiosConfig.error);

const sendService = (url, type, data) => {
    let params = {
        url: url,
        method: type
    };
    type === 'GET' ? (params.params = data) : (params.data = data);
    return service(params);
}

/** GET 请求 */
export function get(url, data) {
    return sendService(url, "GET", data);
}

/** POST 请求 */
export function post(url, data) {
    return sendService(url, "POST", data);
}

/** PUT 请求 */
export function put(url, data) {
    return sendService(url, "PUT", data);
}

/** PUT 请求 */
export function del(url, data) {
    return sendService(url, "DELETE", data);
}

/**
 * 多接口请求
 */
export function muiti(data) {
    return axios.all(data);
}

/** 自定义 */
export function custom(params) {
    return service(params);
}

export default {
    get,
    post,
    put,
    del,
    muiti,
    custom
}
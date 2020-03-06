import * as fs from 'fs';
import * as path from 'path';
const storeConfig = fs.readFileSync(path.resolve(__dirname,'../../build-files/store.js'),'utf-8');
const filterConfig = fs.readFileSync(path.resolve(__dirname,'../../build-files/filter.js'),'utf-8');
const axiosConfig = fs.readFileSync(path.resolve(__dirname,'../../build-files/axios.js'),'utf-8');
const VueMainConfig = fs.readFileSync(path.resolve(__dirname,'../../build-files/main.vue'),'utf-8');
/** vuex 状态管理数据 */
export const store = storeConfig;
/** vue 过滤器数据 */
export const filter = filterConfig;
/** axios 请求配置和拦截器配置 */
export const axios = axiosConfig;
export const main = VueMainConfig;
export default {
    store,
    filter,
    axios,
    main
}
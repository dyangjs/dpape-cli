import Vue from 'vue';
import { DateFormat, StringToFixed } from 'vue-dyangui/@library/utils';
import selfFilter from "%%selfFilter%%";
let filterObj = {
    /** 日期格式化 */
    dateFormat(val, format) {
        return val ? DateFormat(val, format) : ''
    },
    /** 数字补小数位 */
    toFixed(value, n) {
        return StringToFixed(value, n);
    }
}

/** 注册基础过滤器 */
for (let key in filterObj) {
    Vue.filter(key, filterObj[key]);
}

/** 注册自定义过滤器 */
for (let key in selfFilter) {
    Vue.filter(key, selfFilter[key]);
}

export default filterObj;
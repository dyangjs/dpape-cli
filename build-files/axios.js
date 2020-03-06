import { GetItem, SetItem, RemoveItem } from 'vue-dyangui/@library/cookie';
import { Toast, Dialog, Loader } from 'vue-dyangui';
import filter from './filter';
export default {
    /** 请求拦截请求前 */
    requestInterceptors(axiosData) {
        const headers = () => {
            let result = {
                lang: GetItem('lang') || 'zh_cn'
            }
            if (GetItem('token')) result.authorization = `Bearer ${GetItem('token')}`;
            return result;
        }
        axiosData.headers = headers();
        return axiosData;
    },
    /** 请求成功返回 */
    success(response) {
        const data = response.data || new Object();
        if (data['access_token']) {
            SetItem('token', data['access_token']);
            return {
                success: true
            }
        }
        if (data.code != 20000) {
            const statusHeight = window['plus'] ? plus.navigator.getStatusbarHeight() : 0;
            Toast.show({
                message: data.message || filter.t('服务器开小差啦'),
                type: 'error',
                top: statusHeight
            });
            return Promise.reject({
                success: false,
                message: "Exception Service Error!",
                data: data
            })
        }
        const result = {
            success: true,
            data: data
        }
        return result.data;
    },
    /** 请求失败返回 */
    error(error) {
        const statusHeight = window['plus'] ? plus.navigator.getStatusbarHeight() : 0;
        const data = error.response || new Object();
        if (error.message === 'Network Error') {
            Loader.hide();
            Toast.show({
                message: filter.t('服务器链接错误'),
                type: 'error',
                top: statusHeight
            });
            return Promise.reject({
                success: false,
                message: `Request System Service Error`
            });
        }
        if (data && data.status == 501) {
            Loader.hide();
            Toast.show({
                message: filter.t('系统维护中'),
                type: 'error',
                top: statusHeight
            });
            return Promise.reject({
                success: false,
                message: `Request System Maintain`
            });
        }
        /**
         * 请求超时逻辑
         */
        if (error && error.code == 'ECONNABORTED' && (error.message || '').indexOf('timeout') >= 0) {
            Toast.show({
                message: filter.t('请求超时'),
                type: 'error',
                top: statusHeight
            });
            Loader.hide();
            return Promise.reject({
                success: false,
                message: `Request Timeout ${timeout}`
            });
        }
        const result = data.data || new Object();
        if (!data || data.status != 401) {
            Toast.show({
                message: result.message || result.error_description || filter.t('服务器开小差啦'),
                type: 'error',
                top: statusHeight
            });
            Loader.hide();
            return Promise.reject({
                success: false,
                message: !data ? "No Response!" : "Business Service Error"
            });
        }
        if (GetItem('token')) {
            RemoveItem('token');
        }
        Dialog.alert({
            title: filter.t("系统提示"),
            content: filter.t("登陆已过期或其他设备登陆")
        })
        return Promise.reject({
            success: false,
            message: "Login States Has Expired!"
        })
    }
}
import routerConfig from './router-config.json';
import Vue from 'vue';
/** 获取URL值 */
const GetUrlValue = (params) => {
    const value = typeof params === 'string' ? params : (params.path || params.name);
    let result = undefined;
    for (const i in routerConfig) {
        const v = routerConfig[i];
        if (v.name !== value && v.path !== value) continue;
        result = v;
    }
    if (result === undefined) {
        result = {
            name: "404",
            path: "/404"
        }
    }
    return result;
}
const router = {
    /** 页面跳转 */
    push(params) {
        const data = GetUrlValue(params);
        if (data === undefined) {
            console.log("Illegal Params");
            return;
        }
        const url = data.path;
        const query = typeof params === 'string' ? new Object() : params.qeury || params.params;
        //#IF H5PLUS
        if (window['plus']) {
            const hasLocal = window.location.origin.indexOf('file') >= 0;
            const pageURL = hasLocal ? `${url}.html` : `${window.location.origin}${url}.html`;
            let wobj = plus.webview.getWebviewById(data.name);
            if (!wobj) {
                wobj = plus.webview.create(pageURL, data.name, {
                    progress: 'red',
                    popGesture: 'none'
                });
            }
            plus.webview.show(data.name, 'slide-in-right', '600ms', () => {
                console.log('加载完成');
            }, query);
        }
        //#IF
        //#IF H5
        if (window['plus']) return;
        window.location.href = `${data.path}.html`;
        //#IF
    },
    /** 页面返回 */
    back() {
        //#IF H5PLUS
        if (window['plus']) plus.webview.currentWebview().close('slide-out-right');
        //#IF
        //#IF H5
        if (window['plus']) return;
        window.history.go(-1);
        //#IF
    }
    //#IF H5PLUS
    /** 预加载页面 */
    ,
    load(params) {
        if (!window['plus']) return;
        const data = GetUrlValue(params);
        if (data === undefined) {
            console.log("Illegal Params");
            return;
        }
        const url = data.path;
        const id = data.name;
        const query = data.qeury || data.params;
        const hasLocal = window.location.origin.indexOf('file') >= 0;
        const pageURL = hasLocal ? `${url}.html` : `${window.location.origin}${url}.html`;
        plus.webview.create(pageURL, id, {
            progress: 'red',
            popGesture: 'none'
        }, query);
    }
    //#IF
};

Vue.use({
    install(v) {
        //缓存
        v.prototype.$router = router;
    }
});
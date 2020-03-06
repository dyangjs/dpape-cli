import Vue from 'vue';
import App from '%%vueMainPath%%';
import router from './routers';
import store from '%%storePath%%';
import '%%mainCssPath%%';
import '%%componentPath%%';
import './filter';
//#IF DEV
import vConsole from 'vconsole';
new vConsole();
//#IF
//#IF MOBILE
import { GetRemUnit } from 'vue-dyangui/@library/utils';
const FastClick = require('fastclick');
FastClick.prototype.focus = function(targetElement) {
    targetElement.focus();
};
const SetFontSize = () => {
    let remNum = GetRemUnit();
    document.documentElement.style.fontSize = remNum + 'px';
}
window.addEventListener('resize', SetFontSize);
SetFontSize();
//#IF
const vm = new Vue({
    el: "%%elementId%%",
    render: h => h(App),
    router,
    store
});
//#IF H5PLUS
document.addEventListener('plusready', () => {
        plus.navigator.closeSplashscreen();
        plus.key.addEventListener('backbutton', () => {
            window.back && typeof window.back === 'function' ? window.back() : router.back();
        }, false);
        const immersedHight = plus.navigator.getStatusbarHeight();
        vm.$store.commit('SET_IMMERSED_HIGHT', immersedHight);
    })
    //IF
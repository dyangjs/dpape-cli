import Vue from 'vue';
import App from './index.vue';
import '@css/main.scss';
import 'dyang-filter';
import 'dyang-router';
import { Button } from 'vue-dyangui';
Vue.use(Button);
new Vue({
    el: "#app",
    render: h => h(App)
});
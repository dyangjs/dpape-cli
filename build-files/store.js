import Vue from 'vue';
import vuex from 'vuex';

Vue.use(vuex);

const modulesVux = {
    state: {
        translate: null,
        immersedHight: 0
    },
    mutations: {
        SET_DICT: (state, data) => {
            state.translate = data;
        },
        SET_IMMERSED_HIGHT: (state, data) => {
            state.immersedHight = data;
        }
    },
    actions: {}
}

const store = new vuex.Store({
    modules: {
        app: modulesVux
    },
    getters: {
        app: state => state.app
    }
})

export default store;
import { ReplacePlaceholder } from "vue-dyangui/@library/utils";
import store from './store';
let filterObj = {
    t(key, nonMacth = false) {
        if (!key) return '';
        const translate = store.getters.translate || new Object();
        return ReplacePlaceholder(key, translate, nonMacth)
    }
};

export default filterObj;
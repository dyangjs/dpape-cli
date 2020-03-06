import { ReplacePlaceholder } from "vue-dyangui/@library/utils";
import { GetItem } from 'vue-dyangui/@library/cookie';
let filterObj = {
    t(key, nonMacth = false) {
        if (!key) return '';
        const translate = GetItem('translate') || new Object();
        return ReplacePlaceholder(key, translate, nonMacth)
    }
};

export default filterObj;
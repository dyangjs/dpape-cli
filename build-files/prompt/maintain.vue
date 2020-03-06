<template>
    <div class="dyang-maintain">
        <span class="bg-icon icon"></span>
        <div>系统正在维护中</div>
        <div class="btns">
            <Button type="primary" text="重新加载"/>
        </div>
    </div>
</template>
<script>
import './index.scss';
import { Button } from 'vue-dyangui';
export default {
    components:{ Button }
}
</script>
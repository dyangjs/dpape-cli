<template>
    <div class="dyang-404">
        <span class="bg-icon icon"></span>
        <span>404 Not Found</span>
        <div>您访问的页面不存在啦</div>
        <div class="btns">
            <Button type="primary" @click="$router.push('/home')" text="返回首页"/>
            <Button type="success" @click="$router.back()" text="返回上一级"/>
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
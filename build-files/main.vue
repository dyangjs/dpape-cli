<template>
    <div id="app" :class="{menu:$route.meta.menu}">
        <keep-alive>
            <router-view v-if="$route.meta.keepAlive"></router-view>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"></router-view>
    </div>
</template>
<script>
export default {
    data(){
        return {}
    }
}
</script>
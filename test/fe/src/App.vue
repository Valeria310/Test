<template>
    <div id="app" class="container">
        <header class="header">Реестр НСИ</header>
        <MainView class="main" />
        <footer class="footer">&copy; 2024</footer>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import MainView from "@/views/MainView.vue";
export default Vue.extend({
    components: {
        MainView,
    },
});
</script>

<style lang="scss">
* {
    box-sizing: border-box;
    font-family: sans-serif;
}

body {
    margin: 0;
}

.container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
}

.header {
    height: 60px;
    background: #64788e;
    font-size: 24px;
    padding: 20px 40px;
    color: #fcf8f3;
    display: flex;
    align-items: center;
}

.main {
    flex: 1 1 0%;
    padding: 40px;
}

.footer {
    height: 60px;
    background: #546e7a;
    font-size: 20px;
    padding: 20px 40px;
    color: #fcf8f3;
}

.btn {
    border-radius: 6px;
    background: #b8b7b7;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;
    transition: all 0.3s;
    font-weight: bold;

    &:hover {
        background: #afaeae;
    }

    &:active {
        background: #94aeb0;
    }
}

input[type="checkbox"] {
    cursor: pointer;
}
</style>

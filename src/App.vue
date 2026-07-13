<template>
  <!-- 主容器：这里直接渲染你的 freecode 核心业务页面 -->
  <main class="app-container">
    <freecode />
  </main>
</template>

<script setup>
// 引入你写好的核心兑奖组件
import freecode from './components/freecode.vue';
</script>

<style>
/* 简单全局重置样式，保证你的页面在中间好看 */
body {
  margin: 0;
  padding: 0;
  background-color: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.app-container {
  min-height: 100vh;
  padding: 20px 0;
}
</style>
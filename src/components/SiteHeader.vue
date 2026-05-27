<template>
  <header class="site-header reveal is-visible" style="--delay: 60ms">
    <BrandLogo as="a" :href="isHome ? '#top' : '/'" variant="compact" />
    <nav class="site-nav" aria-label="页面导航">
      <a :href="isHome ? '#abilities' : '/#abilities'">能力</a>
      <a :href="isHome ? '#workbench' : '/#workbench'">工作台</a>
      <a :href="isHome ? '#method' : '/#method'">工作方式</a>
      <a :href="isHome ? '#memory' : '/#memory'">记忆</a>
      <a :href="isHome ? '#trust' : '/#trust'">边界</a>
      <a href="/design" :class="{ 'is-active': activePage === 'design' }">产品设计</a>
      <a href="/download" :class="{ 'is-active': activePage === 'download' }">下载中心</a>
    </nav>
  </header>
</template>

<script setup lang="ts">
import BrandLogo from './BrandLogo.vue';

withDefaults(
  defineProps<{
    isHome?: boolean;
    activePage?: 'home' | 'design' | 'download';
  }>(),
  {
    isHome: false,
    activePage: 'home',
  }
);
</script>

<style scoped>
.site-nav a.is-active {
  background: rgba(59, 98, 184, 0.08);
  color: var(--primary);
  font-weight: 700;
}
</style>

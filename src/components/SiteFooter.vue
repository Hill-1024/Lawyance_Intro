<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <BrandLogo as="a" href="/" variant="compact" />
        <p>
          面向中文法律场景的 AI 工作台，把法律检索、卷宗处理、模拟法庭与输出审查收在同一套应用里。
        </p>
      </div>

      <nav class="site-footer__columns" aria-label="页脚导航">
        <div class="site-footer__column">
          <span>产品</span>
          <a href="/#abilities">能力介绍</a>
          <a href="/#workbench">应用工作台</a>
          <a href="/#method">工作方式</a>
          <a href="/#memory">注意力与记忆</a>
          <a href="/#trust">信任与边界</a>
        </div>

        <div class="site-footer__column">
          <span>页面</span>
          <a href="/">产品首页</a>
          <a href="/design">产品设计</a>
          <a href="/download">下载中心</a>
        </div>

        <div class="site-footer__column">
          <span>访问</span>
          <a href="https://law.mutsumi.moe" target="_blank" rel="noopener noreferrer">Web 工作台</a>
          <a href="/download">Android 客户端</a>
          <a href="https://github.com/Hill-1024/Lawyance" target="_blank" rel="noopener noreferrer">GitHub 仓库</a>
        </div>
      </nav>
    </div>

    <div class="site-footer__base">
      <p>&copy; {{ year }} Lawver，工大法智团队。</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import BrandLogo from './BrandLogo.vue';

const year = new Date().getFullYear();
</script>

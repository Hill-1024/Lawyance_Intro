<template>
  <main id="top" class="page">
    <SiteHeader :is-home="false" active-page="download" />

    <!-- Hero Section -->
    <section class="hero download-hero" aria-labelledby="download-hero-title">
      <div class="hero__content">
        <span class="hero__tag reveal is-visible" style="--delay: 80ms">DOWNLOAD CENTER</span>
        <h1 id="download-hero-title" class="reveal is-visible" style="--delay: 160ms">下载中心</h1>
        <p class="hero__lead reveal is-visible" style="--delay: 240ms">
          体验 Lawver 法律 AI 工作台的全部潜力。支持网页版直接访问及原生 Android 客户端下载。
        </p>
        <dl class="hero-facts reveal is-visible" style="--delay: 320ms">
          <div v-for="fact in releaseFacts" :key="fact.label">
            <dt>{{ fact.label }}</dt>
            <dd>{{ fact.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Download Options Section -->
    <section class="section section--download" aria-labelledby="options-title">
      <div class="section__heading reveal">
        <p>客户端下载与访问</p>
        <h2 id="options-title">多端联动，即刻开启法律工作流程。</h2>
      </div>

      <div class="download-content reveal">
        <div class="cards-layout">
          <!-- Web Entrance Card -->
          <div class="download-card highlight-card">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3>Web 网页版</h3>
            <p>无需安装，支持全功能会话、文件沙箱上传以及完整的模拟法庭推演工作流，自适应现代桌面级及平板浏览器。</p>
            <div class="download-action-group">
              <a href="https://lawver.dev/cn" target="_blank" rel="noopener noreferrer" class="primary-cta">
                立即进入 Web 端
              </a>
              <p class="card-meta">推荐 Chrome / Safari / Edge 桌面浏览器</p>
            </div>
          </div>

          <!-- Android Download Card -->
          <div class="download-card">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <h3>Android 客户端</h3>
            <p>基于 Capacitor 深度原生化打包，支持流畅的手势操作、本地持久化数据库及离线缓存隔离文件服务。</p>

            <div class="download-action-group">
              <div class="cta-actions">
                <a :href="releaseInfo.apkUrl" class="primary-cta">
                  <span>直接下载最新 APK</span>
                </a>
                <a :href="releaseInfo.htmlUrl" target="_blank" rel="noopener noreferrer" class="secondary-cta">
                  <span>查看 GitHub Release</span>
                </a>
              </div>
              <p class="card-meta">侧载安装，首次安装需在系统设置中允许未知来源。</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final Section -->
    <section class="final download-final">
      <h2 class="reveal">让严肃的法律计算，以极速、优雅的多端体验呈现在您的工作流中。</h2>
      <div class="final__cta-group reveal" style="--delay: 160ms">
        <a href="/" class="primary-cta">返回产品首页</a>
        <a href="/design" class="secondary-cta">了解系统设计</a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import SiteHeader from './SiteHeader.vue';
import type { ReleaseInfo } from '../utils/github';

const props = defineProps<{
  releaseInfo: ReleaseInfo;
}>();

const formatDate = (isoString: string) => {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const publishedLabel = formatDate(props.releaseInfo.publishedAt);

const releaseFacts = [
  { label: '最新版本', value: props.releaseInfo.tagName },
  { label: '安装包大小', value: props.releaseInfo.apkSize },
  { label: '发布时间', value: publishedLabel || '以 Release 页为准' },
  { label: '支持平台', value: 'Web / Android' },
];
</script>

<style scoped>
.section--download {
  padding: 96px 0;
}

.download-content {
  margin-top: 56px;
}

.cards-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.download-card {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  align-content: start;
  min-height: 440px;
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  background: var(--surface);
  padding: 40px;
  transition: border-color 240ms var(--ease-out);
}

.download-card:hover {
  border-color: rgba(20, 23, 31, 0.14);
}

.highlight-card {
  border-color: rgba(59, 98, 184, 0.2);
  background: linear-gradient(180deg, rgba(59, 98, 184, 0.025), rgba(59, 98, 184, 0));
}

.highlight-card:hover {
  border-color: rgba(59, 98, 184, 0.3);
}

.card-icon {
  width: 40px;
  height: 40px;
  color: var(--primary);
  margin-bottom: 24px;
  stroke-width: 1.5;
}

.download-card h3 {
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 500;
  margin: 0 0 14px;
  color: var(--ink);
}

.download-card > p {
  margin: 0 0 24px;
  color: var(--muted);
  font-size: 15px;
  line-height: 27px;
}

.download-action-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.download-action-group .primary-cta {
  min-width: 180px;
  justify-content: center;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  align-items: center;
}

.cta-actions .primary-cta,
.cta-actions .secondary-cta {
  flex: 1;
  min-width: 150px;
  justify-content: center;
  white-space: nowrap;
}

.card-meta {
  margin: 0;
  color: var(--quiet);
  font-size: 12.5px;
  font-weight: 500;
  line-height: 20px;
}

.download-final {
  padding-top: 88px !important;
  padding-bottom: 88px !important;
}

/* Responsive queries */
@media (max-width: 980px) {
  .cards-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .download-card {
    min-height: 0;
  }
}
</style>

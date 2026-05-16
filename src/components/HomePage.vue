<template>
  <main id="top" ref="pageRef" class="page">
    <header class="site-header reveal is-visible" style="--delay: 60ms">
      <BrandLogo as="a" href="#top" variant="compact" />
      <nav class="site-nav" aria-label="页面导航">
        <a href="#abilities">能力</a>
        <a href="#method">工作方式</a>
        <a href="#memory">记忆</a>
        <a href="#trust">边界</a>
      </nav>
    </header>

    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__content">
        <div class="hero__mark reveal is-visible" style="--delay: 120ms" aria-hidden="true">
          <BrandLogo variant="mark-only" />
        </div>
        <h1 id="hero-title" class="reveal is-visible" style="--delay: 200ms">Lawver</h1>
        <p class="hero__lead reveal is-visible" style="--delay: 280ms">
          由工大法智团队开发的中文法律 AI 助手。Lawver 面向法律检索、案例分析、合同审查与专业咨询，
          用安静的界面和可核验的工作流，把复杂问题整理为清晰的法律研究路径。
        </p>
        <div class="hero__action reveal is-visible" style="--delay: 360ms">
          <a href="https://law.mutsumi.moe" class="primary-cta" aria-label="进入 Lawver 对话">进入对话</a>
        </div>
      </div>

    </section>

    <section id="abilities" class="section section--abilities" aria-labelledby="abilities-title">
      <div class="section__heading reveal">
        <p>能力介绍</p>
        <h2 id="abilities-title">从真实法律工作出发，先处理事实，再组织依据。</h2>
      </div>

      <div class="text-rows" aria-label="Lawver 能力">
        <article v-for="item in abilities" :key="item.title" class="text-row reveal">
          <span>{{ item.no }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>

    <section
      id="method"
      ref="methodRef"
      class="section method"
      aria-labelledby="method-title"
      :style="{ '--workflow-count': workflow.length }"
    >
      <div class="method__sticky">
        <div class="method__copy reveal">
          <p>Agent 范式</p>
          <h2 id="method-title">从直接回答，到规划、行动与校验。</h2>
          <p>
            Lawver 在不同任务复杂度下切换推理范式。简单咨询保持直接，复杂问题先规划，再通过工具行动收集依据，
            最后进入输出校验，把答复收束到可阅读、可引用、可继续追问的法律表达。
          </p>

          <div class="method__progress" aria-hidden="true">
            <span
              v-for="(_, index) in workflow"
              :key="index"
              :class="{ 'is-current': index === activeWorkflowIndex }"
            />
          </div>
        </div>

        <div class="agent-stack" aria-label="Lawver Agent 范式">
          <article
            v-for="(step, index) in workflow"
            :key="step.title"
            class="agent-card"
            :class="{
              'is-active': index === activeWorkflowIndex,
              'is-before': index < activeWorkflowIndex,
              'is-after': index > activeWorkflowIndex,
            }"
            :style="{ '--card-index': index, '--card-offset': index - activeWorkflowIndex }"
          >
            <div class="agent-card__meta">
              <span>{{ step.no }}</span>
              <span>{{ step.phase }}</span>
            </div>
            <div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.body }}</p>
            </div>
            <dl class="agent-card__details">
              <div v-for="detail in step.details" :key="detail.label">
                <dt>{{ detail.label }}</dt>
                <dd>{{ detail.value }}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>

    <section id="memory" class="section memory" aria-labelledby="memory-title">
      <div class="section__heading reveal">
        <p>注意力与记忆</p>
        <h2 id="memory-title">注意力处理当下，记忆保留边界。</h2>
      </div>

      <div class="memory__body">
        <p class="memory__lead reveal">
          Lawver 不把所有历史都压进当前上下文，也不把记忆做成用户画像。系统先让当前问题、文档片段与工具结果进入注意力，
          再把对话级记忆中稳定的目标、约束与案件事实作为边界补入。
        </p>

        <div class="memory__balance reveal" aria-label="注意力与记忆的平衡">
          <article class="memory-pane">
            <span>Attention</span>
            <h3>当前注意力</h3>
            <p>聚焦本轮问题、用户最新修正、检索结果和正在审查的文档，让回答先对齐眼前事实。</p>
          </article>

          <div class="memory__bridge" aria-hidden="true">
            <span></span>
            <strong>Balance</strong>
            <span></span>
          </div>

          <article class="memory-pane memory-pane--teal">
            <span>Memory</span>
            <h3>对话级记忆</h3>
            <p>保留稳定目标、高优先级约束、案件事实和工作边界，在需要时帮助模型回到已确认的信息。</p>
          </article>
        </div>

        <div class="memory__rows">
          <article v-for="item in memoryItems" :key="item.title" class="memory-row reveal">
            <span>{{ item.no }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="trust" ref="trustRef" class="trust" aria-labelledby="trust-title">
      <div class="trust__inner">
        <div class="trust__heading reveal">
          <p>信任与边界</p>
          <h2 id="trust-title">数据边界先于产品承诺。</h2>
        </div>

        <div class="trust__items">
          <article v-for="item in trustItems" :key="item.title" class="trust-item reveal">
            <span>{{ item.no }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="consultation" class="final" aria-labelledby="final-title">
      <div class="final__brand reveal">
        <BrandLogo variant="full" />
      </div>
      <h2 id="final-title" class="reveal">让法律咨询回到事实、条文与可验证的表达。</h2>
      <p class="reveal">Lawver 保持安静的界面和谨慎的语言，只在必要处提供结构、依据与下一步。</p>
      <a href="https://law.mutsumi.moe" class="primary-cta reveal" aria-label="进入 Lawver 对话">进入对话</a>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import BrandLogo from './BrandLogo.vue';

const pageRef = ref<HTMLElement | null>(null);
const trustRef = ref<HTMLElement | null>(null);
const methodRef = ref<HTMLElement | null>(null);
const activeWorkflowIndex = ref(0);

const abilities = [
  {
    no: '01',
    title: '法律检索',
    body: '查询法律法规条文、司法解释及经典判例，围绕争议事实保留可追溯的检索脉络。',
  },
  {
    no: '02',
    title: '案例分析',
    body: '基于事实进行民事、行政、刑事等多维分析，提取争议焦点、裁判要点与适用条件。',
  },
  {
    no: '03',
    title: '合同审查',
    body: '支持 PDF 与 Word 文档的批注、修改及风险识别，保留上传文档与生成结果的工作区。',
  },
  {
    no: '04',
    title: '专业咨询',
    body: '为律师及法律从业者提供客观、严谨的法律分析意见，不以迎合用户预设为目标。',
  },
];

const workflow = [
  {
    no: 'Default',
    phase: 'Direct',
    title: '直接咨询与工具调用',
    body: '默认模式接收问题、调用工具、形成答复，并可在输出前进入 OCP 审查。',
    details: [
      { label: '适用', value: '明确、边界清晰的法律问题' },
      { label: '动作', value: '理解问题后直接组织答复' },
    ],
  },
  {
    no: 'Plan',
    phase: 'Plan & Solve',
    title: 'Plan & Solve',
    body: '复杂任务先拆成有序步骤，再逐步执行。适合劳动仲裁、民间借贷、房屋质量等长流程问题。',
    details: [
      { label: '适用', value: '多事实、多请求、长链路分析' },
      { label: '动作', value: '先形成步骤，再逐项推进' },
    ],
  },
  {
    no: 'ReAct',
    phase: 'Reason + Act',
    title: 'Reasoning + Acting',
    body: '在推理和行动之间循环，直到收集到足够信息，再输出最终答案。',
    details: [
      { label: '适用', value: '需要检索、比对与补充事实的任务' },
      { label: '动作', value: '边推理边调用工具验证依据' },
    ],
  },
  {
    no: 'OCP',
    phase: 'Review',
    title: 'Output Check Process',
    body: '审查正文结构、引用角标和 Markdown 表格，必要时补充法规信源并应用修正版。',
    details: [
      { label: '适用', value: '输出前的结构与信源校验' },
      { label: '动作', value: '检查引用、表格与表达一致性' },
    ],
  },
];

const trustItems = [
  {
    no: 'A',
    title: '本地化存储',
    body: '对话、附件缓存与记忆快照优先保存在用户浏览器的 IndexedDB 中，本地持久化与导入导出由用户侧控制。',
  },
  {
    no: 'B',
    title: '活跃同步',
    body: '咨询时仅同步当前请求需要的历史、文件与记忆快照，服务端用于工具调用、生成与输出校验。',
  },
  {
    no: 'C',
    title: '不做长期留存',
    body: '服务端只维护活跃会话缓存与临时工作区，超时后清理，不持久化存储用户对话和文档数据。',
  },
];

const memoryItems = [
  {
    no: '01',
    title: '自动注入',
    body: '当前焦点和高优先级约束会在每轮生成前进入上下文，避免依赖模型主动想起。',
  },
  {
    no: '02',
    title: '深查召回',
    body: '当问题依赖早先事实且当前上下文不足时，通过对话级记忆按关键词、实体、语义标签、时序与优先级召回。',
  },
  {
    no: '03',
    title: '用户侧持久',
    body: '记忆快照随对话保存在浏览器 IndexedDB 中，服务端只在活跃咨询时使用缓存参与同步和生成。',
  },
];

let revealObserver: IntersectionObserver | null = null;
let scrollFrame = 0;
let methodFrame = 0;
let hashFrame = 0;
let animationFrame = 0;
let targetDarkProgress = 0;
let renderedDarkProgress = 0;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const smoothstep = (value: number, start: number, end: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

const paintAmbientBackground = (progress: number) => {
  const page = pageRef.value;

  if (!page) {
    return;
  }

  const eased = smoothstep(progress, 0, 1);
  const light = [246, 248, 251];
  const dark = [11, 13, 20];

  page.style.setProperty('--ambient-progress', eased.toFixed(4));
  page.style.setProperty('--ambient-r', mix(light[0], dark[0], eased).toFixed(2));
  page.style.setProperty('--ambient-g', mix(light[1], dark[1], eased).toFixed(2));
  page.style.setProperty('--ambient-b', mix(light[2], dark[2], eased).toFixed(2));
  page.style.setProperty('--ambient-light-wash', (0.88 * (1 - eased)).toFixed(4));
  page.style.setProperty('--ambient-dark-wash', (0.2 + 0.46 * eased).toFixed(4));
};

const measureDarkProgress = () => {
  const trust = trustRef.value;

  if (!trust) {
    return 0;
  }

  const rect = trust.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const enter = smoothstep(rect.top, viewportHeight * 0.58, viewportHeight * 0.08);
  const leave = smoothstep(rect.bottom, viewportHeight * 1.04, viewportHeight * 0.34);

  return clamp(enter * (1 - leave));
};

const animateAmbientBackground = () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const velocity = reducedMotion ? 1 : 0.24;

  renderedDarkProgress += (targetDarkProgress - renderedDarkProgress) * velocity;

  if (Math.abs(targetDarkProgress - renderedDarkProgress) < 0.001) {
    renderedDarkProgress = targetDarkProgress;
    paintAmbientBackground(renderedDarkProgress);
    animationFrame = 0;
    return;
  }

  paintAmbientBackground(renderedDarkProgress);
  animationFrame = window.requestAnimationFrame(animateAmbientBackground);
};

const updateAmbientBackground = () => {
  if (scrollFrame) {
    return;
  }

  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0;
    targetDarkProgress = measureDarkProgress();

    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(animateAmbientBackground);
    }
  });
};

const measureWorkflowIndex = () => {
  const method = methodRef.value;

  if (!method) {
    return 0;
  }

  const rect = method.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const scrollable = Math.max(1, rect.height - viewportHeight);
  const progress = clamp((viewportHeight * 0.18 - rect.top) / scrollable);

  return Math.min(workflow.length - 1, Math.floor(progress * workflow.length));
};

const updateWorkflowStack = () => {
  if (methodFrame) {
    return;
  }

  methodFrame = window.requestAnimationFrame(() => {
    methodFrame = 0;
    activeWorkflowIndex.value = measureWorkflowIndex();
  });
};

const scrollToHashTarget = () => {
  const id = window.location.hash.replace('#', '');

  if (!id) {
    return;
  }

  document.getElementById(id)?.scrollIntoView({ block: 'start' });
};

onMounted(() => {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)'));
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  targets.forEach((target, index) => {
    target.style.setProperty('--delay', `${Math.min(index * 45, 220)}ms`);
    revealObserver?.observe(target);
  });

  updateAmbientBackground();
  updateWorkflowStack();
  hashFrame = window.requestAnimationFrame(scrollToHashTarget);
  window.addEventListener('scroll', updateAmbientBackground, { passive: true });
  window.addEventListener('scroll', updateWorkflowStack, { passive: true });
  window.addEventListener('hashchange', scrollToHashTarget);
  window.addEventListener('resize', updateAmbientBackground);
  window.addEventListener('resize', updateWorkflowStack);
});

onUnmounted(() => {
  revealObserver?.disconnect();
  window.removeEventListener('scroll', updateAmbientBackground);
  window.removeEventListener('scroll', updateWorkflowStack);
  window.removeEventListener('hashchange', scrollToHashTarget);
  window.removeEventListener('resize', updateAmbientBackground);
  window.removeEventListener('resize', updateWorkflowStack);

  if (scrollFrame) {
    window.cancelAnimationFrame(scrollFrame);
  }

  if (methodFrame) {
    window.cancelAnimationFrame(methodFrame);
  }

  if (hashFrame) {
    window.cancelAnimationFrame(hashFrame);
  }

  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
  }
});
</script>

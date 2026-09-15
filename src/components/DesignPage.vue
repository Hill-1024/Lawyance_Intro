<template>
  <main id="top" class="page">
    <SiteHeader :is-home="false" active-page="design" />

    <!-- Hero Section -->
    <section class="hero design-hero" aria-labelledby="design-hero-title">
      <div class="hero__content">
        <span class="hero__tag reveal is-visible" style="--delay: 80ms">ARCHITECTURAL DESIGN</span>
        <h1 id="design-hero-title" class="reveal is-visible" style="--delay: 160ms">系统架构与设计</h1>
        <p class="hero__lead reveal is-visible" style="--delay: 240ms">
          Lawver 绝非不可追溯结论的「黑盒对话框」，而是一套将法律推理、分步规划、独立记忆、隔离沙箱与输出校验收束在同一物理边界内的专业级工作台。
        </p>
        <nav class="hero-index reveal is-visible" style="--delay: 320ms" aria-label="本页章节">
          <a href="#topology"><span>01</span>整体拓扑</a>
          <a href="#pipeline"><span>02</span>编排管线</a>
          <a href="#court"><span>03</span>模拟法庭</a>
          <a href="#memory"><span>04</span>记忆系统</a>
          <a href="#security"><span>05</span>沙箱边界</a>
        </nav>
      </div>
    </section>

    <!-- Component 1: Overall Topology & MCPS -->
    <section id="topology" class="section section--design" aria-labelledby="topo-title">
      <div class="section__heading reveal">
        <p>01 / 整体拓扑与工具隔离</p>
        <h2 id="topo-title">统一网关转发，工具可见性严格控制。</h2>
      </div>

      <div class="design-content reveal">
        <p class="section-lead-paragraph">
          Lawver 采用分层的微服务架构。前端基于 React 19 / Vite 提供沉浸式聊天、模拟法庭和工作区控制；后端使用 FastAPI 构建，通过统一的 <code>mcps.py</code> 工具转发层，将所有底层能力以 Model Context Protocol (MCP) 规约暴露给 Agent 编排层。
        </p>

        <!-- Premium Architecture Diagram -->
        <div class="topo-stack reveal">
          <article class="topo-row">
            <div class="topo-row__head">
              <span>01</span>
              <h4>UI 展现层</h4>
              <p>React 19 / Tailwind / Capacitor</p>
            </div>
            <div class="topo-row__nodes">
              <span class="node-chip">主聊天工作台</span>
              <span class="node-chip">模拟法庭控制</span>
              <span class="node-chip">文件沙箱管理器</span>
            </div>
          </article>

          <p class="topo-connector">REST API / SSE Streams / File Transfer</p>

          <article class="topo-row">
            <div class="topo-row__head">
              <span>02</span>
              <h4>应用服务层</h4>
              <p>FastAPI Application &amp; App Factory</p>
            </div>
            <div class="topo-row__nodes">
              <span class="node-chip">会话生命周期</span>
              <span class="node-chip">记忆同步引擎</span>
              <span class="node-chip">OCP 格式审查器</span>
            </div>
          </article>

          <p class="topo-connector">Agent 任务分发（Orchestrator）</p>

          <article class="topo-row topo-row--accent">
            <div class="topo-row__head">
              <span>03</span>
              <h4>统一工具转发层</h4>
              <p>MCPS Core Protocol</p>
            </div>
            <div class="topo-row__nodes">
              <span class="node-chip">agent（主问答）</span>
              <span class="node-chip">court（庭审专属）</span>
              <span class="node-chip">ocp_reviewer（审查）</span>
              <span class="node-chip">internal（内部调用）</span>
            </div>
          </article>

          <p class="topo-connector">底层协议适配器（MCP Client Adapters）</p>

          <article class="topo-row">
            <div class="topo-row__head">
              <span>04</span>
              <h4>底层引擎与信源</h4>
              <p>Local / Remote Engine Services</p>
            </div>
            <div class="topo-row__nodes">
              <span class="node-chip">法库 RAG</span>
              <span class="node-chip">SearXNG 联网</span>
              <span class="node-chip">企业工商查询</span>
              <span class="node-chip">文档批注处理器</span>
            </div>
          </article>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <h3>统一网关 (MCPS Gateway)</h3>
            <p>业务工具（无论是本地数据库还是远程第三方接口）统一通过 <code>mcps.py</code> 转发，严禁 Agent 或接口层绕过网关直接调用，从而确保完整的权限审计和隔离能力。</p>
          </div>
          <div class="feature-card">
            <h3>工具可见性隔离 (Exposure Settings)</h3>
            <p>每个工具都声明其 <code>exposure</code>。如企业工商和法条检索仅在 <code>agent</code> 或 <code>court</code> 可见；而高权限系统控制仅在 <code>internal</code> 或 <code>plan_and_solve</code> 可见，限制了越权风险。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Component 2: Dual-Track Pipelines -->
    <section id="pipeline" class="section section--design" aria-labelledby="pipeline-title">
      <div class="section__heading reveal">
        <p>02 / 智能体编排与输出审查</p>
        <h2 id="pipeline-title">双轨决策，输出多级审查净化。</h2>
      </div>

      <div class="design-content reveal">
        <p class="section-lead-paragraph">
          Lawver 支持 <strong>Direct Mode（默认问答）</strong> 和 <strong>Plan-and-Solve（规划求解）</strong> 两套决策管线，分别应对日常即时咨询与多请求、长链路深度案件分析。
        </p>

        <div class="pipeline-flow">
          <div class="pipeline-track">
            <div class="track-header">管线 A：Direct Mode (默认咨询)</div>
            <div class="track-step">1. 接收请求与当前对话上下文</div>
            <div class="track-step">2. 注入对话记忆、焦点提示词与可用工具元数据</div>
            <div class="track-step">3. 循环调用工具进行信息确认 (RAG/工商/搜索)</div>
            <div class="track-step">4. 组织事实与法律依据生成初稿</div>
          </div>
          
          <div class="pipeline-track pipeline-track--solve">
            <div class="track-header">管线 B：Plan &amp; Solve (规划求解)</div>
            <div class="track-step">1. 输入复杂复合型诉求 / 长篇案卷</div>
            <div class="track-step">2. 编排器拆解生成结构化步骤计划 (Plan)</div>
            <div class="track-step">3. 逐项推进，每步调用特定子工具并生成中间结果</div>
            <div class="track-step">4. 汇总多步报告，避免超长逻辑中途偏离焦点</div>
          </div>
        </div>

        <!-- Output Checking Process -->
        <div class="ocp-section reveal">
          <div class="ocp-banner">
            <div class="ocp-badge">OCP</div>
            <h3>Output Check Process (输出审查流水线)</h3>
          </div>
          <p>
            当主生成模型生成法律文书或意见后，回复不直接投递给前端，而是拦截并进入独立的 <strong>Output Check Process (OCP)</strong>：
          </p>
          <div class="ocp-steps">
            <div class="ocp-step-card">
              <span class="step-no">01</span>
              <h4>合规性与引用审查</h4>
              <p>由独立的 OCP 审查器读取原始输出，调用 <code>ocp_reviewer</code> 级别只读信源工具，逐一核验正文引用的法条和案例是否真实存在，并在正文追加带有链接的核准角标。</p>
            </div>
            <div class="ocp-step-card">
              <span class="step-no">02</span>
              <h4>格式与渲染审查</h4>
              <p>强制检查 Markdown 表格格式、引用角标格式及输出结构一致性，对破损或不规范的格式进行纠错。</p>
            </div>
            <div class="ocp-step-card">
              <span class="step-no">03</span>
              <h4>Sanitizer 容错保护</h4>
              <p>若审查模型发生超时、网络或逻辑异常，系统将自动触发 <strong>Deterministic Sanitizer Fallback</strong>。该机制采用确定性纯正则表达式和解析器对正文进行安全净化，抛弃异常，保留主模型原始输出，确保链路高可用。</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Component 3: Mock Court -->
    <section id="court" class="section section--design" aria-labelledby="court-title">
      <div class="section__heading reveal">
        <p>03 / 多智能体模拟法庭</p>
        <h2 id="court-title">有限状态机编排，四角色物理隔离记忆。</h2>
      </div>

      <div class="design-content reveal">
        <p class="section-lead-paragraph">
          模拟法庭是 Lawver 的一项核心工程突破。它不仅是一个简单的多人对话，而是一个由 <strong>有限状态机 (FSM)</strong> 驱动、严格隔离各方信息差的模拟庭审对抗环境。
        </p>

        <!-- FSM Stage visualization -->
        <div class="fsm-visual reveal">
          <h4>庭审有限状态机流程 (FSM States)</h4>
          <div class="fsm-rail">
            <div class="fsm-stage"><span>01</span><strong>开庭准备</strong></div>
            <div class="fsm-stage"><span>02</span><strong>诉辩陈述</strong></div>
            <div class="fsm-stage"><span>03</span><strong>法庭调查</strong></div>
            <div class="fsm-stage"><span>04</span><strong>举证质证</strong></div>
            <div class="fsm-stage"><span>05</span><strong>法庭辩论</strong></div>
            <div class="fsm-stage"><span>06</span><strong>庭审复盘</strong></div>
          </div>
          <p class="fsm-meta">支持 <strong>民事、行政、刑事</strong> 三类基础案由状态流转，各阶段拥有明确的进入和退出条件。</p>
        </div>

        <div class="court-roles reveal">
          <div class="role-grid">
            <div class="role-card">
              <div class="role-icon font-serif">审</div>
              <h4>审判长 (Judge)</h4>
              <p>维持庭审秩序，引导诉辩双方推进状态机，主持举证和辩论，并最终出具中立客观的法庭裁判意见。</p>
            </div>
            <div class="role-card">
              <div class="role-icon font-serif">诉</div>
              <h4>对方代理人 (Opponent)</h4>
              <p>扮演模拟庭审中的抗辩对手，根据其私有 Brief 发掘漏洞，提出假设抗辩点，对用户进行压力测试。</p>
            </div>
            <div class="role-card">
              <div class="role-icon font-serif">助</div>
              <h4>我方 AI 助手 (User Agent)</h4>
              <p>辅助用户进行分析，提供实时的法条依据和策略参考，引导用户有针对性地发言。</p>
            </div>
            <div class="role-card">
              <div class="role-icon font-serif">评</div>
              <h4>庭后复盘员 (Reviewer)</h4>
              <p>在庭审结束后，全盘审视所有发言，结合各方底牌分析得失，生成多维度复盘与改进建议。</p>
            </div>
          </div>
        </div>

        <div class="trust-grid reveal">
          <div class="trust-card">
            <h4>四角色私有记忆隔离</h4>
            <p>为防止 AI 角色在生成回复时「作弊」，系统为 Judge、Opponent、Reviewer 和 User Agent 分配了独立的记忆作用域 (Memory Scopes)。公开案卷和庭审笔录写入共享存储，而各自的诉讼策略、底牌 brief 隔离在各自私有空间，不可跨域读取。</p>
          </div>
          <div class="trust-card">
            <h4>回退与派生分支 (Branching &amp; Rollback)</h4>
            <p>系统记录了庭审的完整事件链。用户可以随时将状态机回退到任意已发生的发言节点，清空该节点之后的 AI 私有记忆，重新推进；也可以从当前节点派生出一条全新的平行会话分支，进行多套策略对比测试。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Component 4: Context & Memory System -->
    <section id="memory" class="section section--design" aria-labelledby="memory-title-design">
      <div class="section__heading reveal">
        <p>04 / 多路召回记忆系统</p>
        <h2 id="memory-title-design">拒绝暴力拼接历史，通过语义多路融合提取关键。</h2>
      </div>

      <div class="design-content reveal">
        <p class="section-lead-paragraph">
          传统的 AI 助手往往通过暴力拼接全部对话历史来保持记忆，这不仅导致上下文极度臃肿，且容易引入过期和矛盾的事实。Lawver 设计了基于多路召回排序的<strong>对话级结构化记忆系统</strong>。
        </p>

        <div class="memory-retrieval">
          <div class="retrieval-channels">
            <div class="channel-card">
              <span>Channel 1</span>
              <h4>关键词精准匹配</h4>
              <p>捕获当前问题中核心法律术语及事实要素的硬字词频率。</p>
            </div>
            <div class="channel-card">
              <span>Channel 2</span>
              <h4>实体与语义标签</h4>
              <p>通过 NER 技术抽取出当事人、主体、争议标的物等稳定标签关系。</p>
            </div>
            <div class="channel-card">
              <span>Channel 3</span>
              <h4>时序与动态衰减</h4>
              <p>根据记忆产生的时间戳，对历史交互事实应用平滑衰减，优先保障新鲜度。</p>
            </div>
            <div class="channel-card">
              <span>Channel 4</span>
              <h4>向量 Embedding 相似度</h4>
              <p>可按需配置启用基于 Dense Vector 的语义距离相似度计算，作为 RAG 排序的召回因子之一。</p>
            </div>
          </div>
          
          <div class="retrieval-fusion">
            <div class="fusion-box">
              <span>融合排序引擎 (RAG Multi-Route Fusion &amp; Reranking)</span>
              <p>各路召回信号通过预设的超参权重矩阵合并，输出当前最迫切需要关注的「目标、约束与事实边界」，并在每轮请求前动态注入 System Message，保持上下文的轻量与高效。</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Component 5: Sandbox & Security -->
    <section id="security" class="section section--design band--dark" aria-labelledby="sec-title">
      <div class="section__heading reveal">
        <p>05 / 沙箱边界与系统安全</p>
        <h2 id="sec-title">事实先于承诺，数据逻辑物理强隔离。</h2>
      </div>

      <div class="design-content reveal">
        <p class="section-lead-paragraph">
          我们秉持「安全边界先于产品承诺」的原则，为涉案敏感材料、上传文件与代码执行环境构筑了严密的底层护城河。
        </p>

        <div class="security-features">
          <div class="sec-card">
            <div class="sec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h4>工作区物理强隔离</h4>
            <p>所有上传的文件卷宗和生成的报告文书，严格按照用户 ID 及会话 Session ID 隔离存放在 <code>TEMP</code> 与 <code>Result</code> 文件夹中。通过 <code>workspace.py</code> 校验核心读写路径，从根本上防止跨会话的目录遍历漏洞（Path Traversal）。</p>
          </div>

          <div class="sec-card">
            <div class="sec-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                <line x1="12" y1="22" x2="12" y2="15.5" />
                <line x1="12" y1="15.5" x2="22" y2="8.5" />
                <line x1="12" y1="15.5" x2="2" y2="8.5" />
              </svg>
            </div>
            <h4>可信源控制与输入审查</h4>
            <p>联网检索工具 SearXNG 及网页文本阅读器对抓取内容做只读与「不可信」标记，禁止对抓取的内容进行代码级运行与指令执行。同时对外部 REST 接口启用 CORS 回环验证和 IP 限流保护。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer / CTA -->
    <section class="final design-final">
      <h2 class="reveal">致力于构建严谨、可追溯且高度安全的法律科技。</h2>
      <p class="reveal">Lawver 持续优化其编排流程，努力在专业法律场景中为您提供最坚实的决策辅助支持。</p>
      <div class="final__cta-group reveal" style="--delay: 160ms">
        <a href="/" class="primary-cta">返回产品首页</a>
        <a href="/download" class="secondary-cta">前往下载中心</a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import SiteHeader from './SiteHeader.vue';
</script>

<style scoped>
.section--design {
  padding: 96px 0;
}

.section--design + .section--design {
  border-top: 1px solid var(--line-soft);
}

.design-content {
  margin-top: 56px;
}

.section-lead-paragraph {
  font-size: 17px;
  line-height: 32px;
  color: var(--muted);
  max-width: 760px;
  margin-bottom: 56px;
}

/* Topology: one row per layer instead of nested bordered boxes, so the stack
   reads as a spec table and the gateway layer can carry the accent. */
.topo-stack {
  display: grid;
  margin-bottom: 48px;
}

.topo-row {
  display: grid;
  grid-template-columns: minmax(0, 232px) minmax(0, 1fr);
  gap: 20px 40px;
  align-items: center;
  border-top: 1px solid var(--line-soft);
  padding: 26px 0 26px 22px;
}

.topo-row--accent {
  position: relative;
  border-top-color: rgba(59, 98, 184, 0.22);
  border-bottom: 1px solid rgba(59, 98, 184, 0.22);
  background: linear-gradient(90deg, rgba(59, 98, 184, 0.07), rgba(59, 98, 184, 0));
}

.topo-row--accent::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  background: var(--primary);
  content: "";
}

.topo-row__head span {
  display: block;
  color: var(--primary);
  font-family: var(--font-display);
  font-size: 18px;
  font-style: italic;
  line-height: 1;
}

.topo-row__head h4 {
  margin: 14px 0 0;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 19px;
  font-weight: 500;
  line-height: 28px;
}

.topo-row__head p {
  margin: 6px 0 0;
  color: var(--quiet);
  font-size: 12.5px;
  line-height: 20px;
}

.topo-row__nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.node-chip {
  border: 1px solid var(--line-soft);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  padding: 8px 14px;
}

.topo-row--accent .node-chip {
  border-color: rgba(59, 98, 184, 0.2);
  color: var(--primary-dark);
}

/* The connector rides in the head gutter so the vertical hairline lands on the
   same x as the layer titles above and below it. */
.topo-connector {
  display: grid;
  grid-template-columns: minmax(0, 232px) minmax(0, 1fr);
  gap: 40px;
  align-items: center;
  margin: 0;
  color: var(--quiet);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  line-height: 18px;
  text-transform: uppercase;
  padding-left: 22px;
}

.topo-connector::before {
  justify-self: end;
  width: 1px;
  height: 30px;
  background: linear-gradient(180deg, var(--line-soft), rgba(20, 23, 31, 0.26), var(--line-soft));
  content: "";
}

/* Feature grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.feature-card {
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  padding: 28px;
}

.feature-card h3 {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 12px;
  color: var(--ink);
}

.feature-card p {
  margin: 0;
  font-size: 14.5px;
  line-height: 26px;
  color: var(--muted);
}

/* Pipeline Track styling */
.pipeline-flow {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-bottom: 56px;
}

.pipeline-track {
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  padding: 32px;
}

.track-header {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 500;
  margin-bottom: 22px;
  color: var(--ink);
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.track-header::before {
  content: "";
  display: inline-block;
  width: 18px;
  height: 1px;
  background: var(--teal);
  transform: translateY(-5px);
}

.pipeline-track--solve .track-header::before {
  background: var(--primary);
}

.track-step {
  position: relative;
  padding: 10px 0 10px 22px;
  font-size: 14px;
  color: var(--muted);
  border-left: 1px solid var(--line-soft);
  margin-left: 4px;
  line-height: 24px;
}

.track-step::before {
  content: "";
  position: absolute;
  left: -3px;
  top: 18px;
  width: 5px;
  height: 5px;
  border-radius: 99px;
  background: var(--quiet);
}

/* OCP block */
.ocp-section {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 44px;
  margin-top: 48px;
}

.ocp-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.ocp-badge {
  background: var(--ink);
  color: var(--surface);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  padding: 4px 10px;
  border-radius: 4px;
}

.ocp-banner h3 {
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 500;
  margin: 0;
  color: var(--ink);
}

.ocp-section > p {
  color: var(--muted);
  font-size: 15.5px;
  line-height: 28px;
  max-width: 760px;
  margin: 0 0 32px;
}

.ocp-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  border-top: 1px solid var(--line-soft);
}

.ocp-step-card {
  padding: 26px 24px 6px;
  border-right: 1px solid var(--line-soft);
}

.ocp-step-card:last-child {
  border-right: none;
}

.step-no {
  display: block;
  font-family: var(--font-display);
  font-size: 22px;
  font-style: italic;
  color: var(--primary);
  margin-bottom: 10px;
}

.ocp-step-card h4 {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 10px;
  color: var(--ink);
}

.ocp-step-card p {
  margin: 0;
  font-size: 13.5px;
  line-height: 24px;
  color: var(--muted);
}

/* FSM Stage rail */
.fsm-visual {
  margin-bottom: 56px;
}

.fsm-visual h4 {
  font-family: var(--font-display);
  font-size: 16px;
  font-style: italic;
  font-weight: 500;
  margin: 0 0 24px;
  color: var(--teal);
  letter-spacing: 0.02em;
}

.fsm-rail {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.fsm-stage {
  border-left: 1px solid var(--line-soft);
  padding: 24px 20px 26px;
}

.fsm-stage:first-child {
  border-left: none;
}

.fsm-stage span {
  display: block;
  color: var(--primary);
  font-family: var(--font-display);
  font-size: 18px;
  font-style: italic;
  line-height: 1;
}

.fsm-stage strong {
  display: block;
  margin-top: 28px;
  color: var(--ink);
  font-size: 15px;
  font-weight: 600;
  line-height: 24px;
}

.fsm-meta {
  margin: 22px 0 0;
  font-size: 13.5px;
  line-height: 24px;
  color: var(--quiet);
}

/* Court Roles */
.court-roles {
  margin-bottom: 56px;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface);
}

.role-card {
  padding: 28px 24px;
  border-right: 1px solid var(--line-soft);
}

.role-card:last-child {
  border-right: none;
}

.role-icon {
  display: inline-block;
  color: var(--primary);
  font-size: 28px;
  font-weight: 400;
  font-family: var(--font-serif);
  margin-bottom: 18px;
  line-height: 1;
}

.role-card h4 {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 10px;
  color: var(--ink);
}

.role-card p {
  margin: 0;
  font-size: 13.5px;
  line-height: 24px;
  color: var(--muted);
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.trust-card {
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  padding: 28px;
}

.trust-card h4 {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 500;
  margin: 0 0 10px;
  color: var(--ink);
}

.trust-card p {
  margin: 0;
  font-size: 14.5px;
  line-height: 26px;
  color: var(--muted);
}

/* Memory systems */
.memory-retrieval {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.retrieval-channels {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface);
}

.channel-card {
  padding: 26px 22px;
  border-right: 1px solid var(--line-soft);
}

.channel-card:last-child {
  border-right: none;
}

.channel-card span {
  display: block;
  font-family: var(--font-display);
  font-size: 18px;
  font-style: italic;
  font-weight: 400;
  color: var(--teal);
  letter-spacing: 0;
  margin-bottom: 14px;
  line-height: 1;
}

.channel-card h4 {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 10px;
  color: var(--ink);
}

.channel-card p {
  margin: 0;
  font-size: 13.5px;
  line-height: 24px;
  color: var(--muted);
}

.retrieval-fusion {
  background: var(--paper);
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  padding: 32px;
  text-align: center;
}

.fusion-box span {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 500;
  color: var(--ink);
  display: block;
  margin-bottom: 10px;
}

.fusion-box p {
  margin: 0 auto;
  font-size: 14.5px;
  line-height: 27px;
  color: var(--muted);
  max-width: 720px;
}

/* Security design */
.security-features {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.sec-card {
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  padding: 32px;
}

/* The security section is the page's single dark band. */
.band--dark .section-lead-paragraph,
.band--dark .sec-card p {
  color: #aeb5c5;
}

/* `.sec-card h4` is scoped and outranks the global `.band--dark h4` rule, so the
   card titles need an explicit light value here. */
.band--dark .sec-card h4 {
  color: #f3f5f9;
}

.band--dark .sec-card {
  border-color: rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.045);
}

.band--dark .sec-icon {
  color: #8ecdc7;
}

.sec-icon {
  width: 36px;
  height: 36px;
  color: var(--teal);
  margin-bottom: 22px;
  stroke-width: 1.5;
}

.sec-card h4 {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 12px;
  color: var(--ink);
}

.sec-card p {
  margin: 0;
  font-size: 14.5px;
  line-height: 27px;
  color: var(--muted);
}

.design-final {
  padding-top: 88px !important;
  padding-bottom: 88px !important;
}

/* Responsive adjustments */
@media (max-width: 980px) {
  .features-grid, .pipeline-flow, .trust-grid, .security-features {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .ocp-steps, .role-grid, .retrieval-channels {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ocp-step-card:nth-child(-n+2),
  .role-card:nth-child(-n+2),
  .channel-card:nth-child(-n+2) {
    border-bottom: 1px solid var(--line-soft);
  }

  .ocp-step-card:nth-child(2n),
  .role-card:nth-child(2n),
  .channel-card:nth-child(2n) {
    border-right: none;
  }

  .topo-row {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .topo-connector {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .topo-connector::before {
    justify-self: start;
    width: 34px;
    height: 1px;
  }

  .fsm-rail {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .fsm-stage:nth-child(3n + 1) {
    border-left: none;
  }

  .fsm-stage:nth-child(-n + 3) {
    border-bottom: 1px solid var(--line-soft);
  }
}

@media (max-width: 640px) {
  .ocp-steps, .role-grid, .retrieval-channels {
    grid-template-columns: 1fr;
  }

  .ocp-step-card,
  .role-card,
  .channel-card {
    border-right: none;
    border-bottom: 1px solid var(--line-soft);
  }

  .ocp-step-card:last-child,
  .role-card:last-child,
  .channel-card:last-child {
    border-bottom: none;
  }

  .ocp-section {
    padding: 28px 22px;
  }

  .topo-row {
    padding: 22px 0 22px 16px;
  }

  .topo-connector {
    padding-left: 16px;
  }

  .node-chip {
    font-size: 12.5px;
    padding: 7px 12px;
  }

  .fsm-rail {
    grid-template-columns: 1fr;
  }

  .fsm-stage {
    border-top: 1px solid var(--line-soft);
    border-bottom: none;
    border-left: none;
    padding: 20px 0 22px;
  }

  .fsm-stage:first-child {
    border-top: none;
  }

  .fsm-stage strong {
    margin-top: 16px;
  }
}
</style>

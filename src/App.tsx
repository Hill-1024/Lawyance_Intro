/*
 * 模块描述：介绍页路由。
 * 介绍页与功能页同域不同进程：/、/design、/download、/pricing 属于这里，/home、/login、
 * /settings、/admin、/business、/court 属于功能页。跨到功能页的链接必须是真实跳转，
 * 交给分流核心按路径分派；用 react-router 的客户端路由会落到本站的 * 兜底上。
 *
 * 旧版首页深链（/?project|conversation|court=…）由本站转发到功能页对应路径，
 * 老书签不至于全废。
 *
 * 进入侧连续性（不做退出动画）：路由容器按 pathname keyed 淡入
 * （.intro-route，200-300ms，尊重 reduced-motion），布局头尾保持连续；
 * 懒加载结构（lazy + Suspense）不动，只把 fallback 从 60vh 空白+小 spinner
 * 换成与目标页骨架同宽的灰块骨架 + 内容淡入。
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import IntroLayout from './intro/IntroLayout';
import HomePage from './intro/HomePage';
import type { ReactNode } from 'react';
import { fetchSession, type AccountSession } from './services/api';

// 首页随初始包下发；其余三页按需加载，首屏不为它们付出体积。
const DesignPage = lazy(() => import('./intro/DesignPage'));
const DownloadPage = lazy(() => import('./intro/DownloadPage'));
const PricingPage = lazy(() => import('./intro/PricingPage'));

/**
 * 次级页加载态：与目标页骨架同宽的灰块（hero 标题行 + 三栏卡片行），
 * 头尾已在，不再用 60vh 空白；内容落定后走 .intro-route 淡入。
 */
const PageFallback = () => (
  <div className="intro-loading" role="status" aria-label="正在加载页面">
    <div className="intro-loading__hero" aria-hidden="true">
      <span className="intro-loading__line intro-loading__line--title" />
      <span className="intro-loading__line intro-loading__line--lead" />
      <span className="intro-loading__line intro-loading__line--lead-short" />
    </div>
    <div className="intro-loading__grid" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  </div>
);

const withLayout = (
  activePage: 'design' | 'download' | 'pricing',
  page: ReactNode,
  account: AccountSession | null | undefined,
  onAccountChange: (session: AccountSession | null) => void,
) => (
  <IntroLayout activePage={activePage} account={account} onAccountChange={onAccountChange}>
    <Suspense fallback={<PageFallback />}>
      {/* 外层 .intro-route（IntroLayout，keyed by pathname）负责「旧页→骨架」的淡入；
          这里再包一层 keyed 容器负责「骨架→新页」：懒加载解析后本 div 才挂载，
          动画在此时触发，新页不再瞬间弹入。 */}
      <div key={activePage} className="intro-route">
        {page}
      </div>
    </Suspense>
  </IntroLayout>
);

export default function App() {
  // undefined = 探测中（账户位先出骨架）；null = 未登录；对象 = 已登录。
  const [account, setAccount] = useState<AccountSession | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void fetchSession().then((session) => {
      if (!cancelled) setAccount(session.authenticated ? session : null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomeRoute account={account} onAccountChange={setAccount} />} />
      <Route path="/design" element={withLayout('design', <DesignPage />, account, setAccount)} />
      <Route
        path="/pricing"
        element={
          <IntroLayout activePage="pricing" account={account} onAccountChange={setAccount}>
            <Suspense fallback={<PageFallback />}>
              <div key="pricing" className="intro-route">
                <PricingPage account={account} onAccountChange={setAccount} />
              </div>
            </Suspense>
          </IntroLayout>
        }
      />
      <Route path="/download" element={withLayout('download', <DownloadPage />, account, setAccount)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** 首页：带旧版 query 深链时先整页跳到功能页路径，其余情况渲染首页。 */
function HomeRoute({
  account,
  onAccountChange,
}: {
  account: AccountSession | null | undefined;
  onAccountChange: (session: AccountSession | null) => void;
}) {
  const [params] = useSearchParams();
  const conversation = params.get('conversation');
  const court = params.get('court');
  const project = params.get('project');

  const target = conversation
    ? `/conversation/${encodeURIComponent(conversation)}`
    : court
      ? `/court/${encodeURIComponent(court)}${project ? `?project=${encodeURIComponent(project)}` : ''}`
      : project
        ? `/project/${encodeURIComponent(project)}`
        : '';

  useEffect(() => {
    if (target) window.location.replace(target);
  }, [target]);

  if (target) return null;

  return (
    <IntroLayout activePage="home" account={account} onAccountChange={onAccountChange}>
      <HomePage isAuthenticated={Boolean(account)} />
    </IntroLayout>
  );
}

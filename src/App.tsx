/*
 * 模块描述：介绍页路由。
 * 介绍页与功能页同域不同进程：/、/design、/download、/pricing 属于这里，/home、/login、
 * /settings、/admin、/business、/court 属于功能页。跨到功能页的链接必须是真实跳转，
 * 交给分流核心按路径分派；用 react-router 的客户端路由会落到本站的 * 兜底上。
 *
 * 旧版首页深链（/?project|conversation|court=…）由本站转发到功能页对应路径，
 * 老书签不至于全废。
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import IntroLayout from './intro/IntroLayout';
import HomePage from './intro/HomePage';
import type { ReactNode } from 'react';
import { fetchSession } from './services/api';

// 首页随初始包下发；其余三页按需加载，首屏不为它们付出体积。
const DesignPage = lazy(() => import('./intro/DesignPage'));
const DownloadPage = lazy(() => import('./intro/DownloadPage'));
const PricingPage = lazy(() => import('./intro/PricingPage'));

/** 次级页加载态：布局（头尾）已在，内容区留一块安静的占位。 */
const PageFallback = () => (
  <div className="intro-loading" role="status" aria-label="正在加载页面">
    <span />
  </div>
);

const withLayout = (
  activePage: 'design' | 'download' | 'pricing',
  page: ReactNode,
  isAuthenticated: boolean,
) => (
  <IntroLayout activePage={activePage} isAuthenticated={isAuthenticated}>
    <Suspense fallback={<PageFallback />}>{page}</Suspense>
  </IntroLayout>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchSession().then((authenticated) => {
      if (!cancelled) setIsAuthenticated(authenticated);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomeRoute isAuthenticated={isAuthenticated} />} />
      <Route path="/design" element={withLayout('design', <DesignPage />, isAuthenticated)} />
      <Route path="/pricing" element={withLayout('pricing', <PricingPage />, isAuthenticated)} />
      <Route path="/download" element={withLayout('download', <DownloadPage />, isAuthenticated)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** 首页：带旧版 query 深链时先整页跳到功能页路径，其余情况渲染首页。 */
function HomeRoute({ isAuthenticated }: { isAuthenticated: boolean }) {
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
    <IntroLayout activePage="home" isAuthenticated={isAuthenticated}>
      <HomePage isAuthenticated={isAuthenticated} />
    </IntroLayout>
  );
}

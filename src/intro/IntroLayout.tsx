/*
 * 模块描述：介绍页布局（首页/产品设计/下载中心共用）。
 * 头部学 quote.law：首屏融入纸面，滚动后变白色圆角悬浮条；右侧常驻「进入工作台」，
 * 按登录态落 /home 或 /login。页脚为固定深色表面。
 * 环境光背景与锚点定位由 effects.ts 提供；内容不做滚动浮现（见 effects 头注）。
 *
 * /home、/login 属于功能页（同域不同进程）：这些入口必须是真实跳转（<a>），
 * 交给分流核心按路径分派；用 react-router 的 <Link> 会落到本站的 * 兜底上。
 *
 * 顶部导航分两组：同一 <nav> 内「本页章节」（首页 6 锚点）与「页面」
 * （/design、/pricing、/download 跨页）用 role="group" + aria-label 分组，
 * 中间以视觉分隔线区分。非首页的锚点走客户端路由 <Link to="/#…">，
 * 由下方的挂载后定位平滑滚动到首页对应章节，不走原生 <a href="/#…"> 整页重载。
 * 品牌回顶统一走 effects.ts 的 scrollToTop（尊重 reduced-motion）。
 */

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import { BrandMark } from "../components/Brand";
import {
  MotionProvider,
  prefersReducedMotion,
  restoreScrollPosition,
  scrollToHashTarget,
  scrollToHashWhenReady,
  scrollToTop,
  useMotion,
  useScrollEffects,
  useScrollSpy,
} from "./effects";
import "./intro-base.css";

const SECTION_ANCHORS = [
  { hash: "#document-demo", label: "交互体验" },
  { hash: "#abilities", label: "能力" },
  { hash: "#workbench", label: "工作台" },
  { hash: "#method", label: "工作方式" },
  { hash: "#memory", label: "记忆" },
  { hash: "#trust", label: "边界" },
];

const SECTION_HASHES = SECTION_ANCHORS.map(({ hash }) => hash);

const DESIGN_HASHES = ["#topology", "#pipeline", "#court", "#memory", "#security"];

interface IntroLayoutProps {
  activePage: "home" | "design" | "download" | "pricing";
  isAuthenticated: boolean;
  children: React.ReactNode;
}

export default function IntroLayout(props: IntroLayoutProps) {
  return (
    <MotionProvider>
      <IntroShell {...props} />
    </MotionProvider>
  );
}

function IntroShell({ activePage, isAuthenticated, children }: IntroLayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const isHome = activePage === "home";
  const { paused: motionPaused, toggle: toggleMotion } = useMotion();

  // scrollspy：首页跟 6 个章节锚点，设计页跟本页 5 个目录；结果复用
  // is-active / aria-current 语义（与跨页激活态同一样式）。
  const spyHashes = activePage === "home" ? SECTION_HASHES : activePage === "design" ? DESIGN_HASHES : [];
  const spyActive = useScrollSpy(spyHashes, spyHashes.length > 0);

  useScrollEffects();

  // 浏览器恢复语义：PUSH 切页默认回顶（Suspense 落定后再顶，避免高度不足时误顶），
  // POP 用内存记的 scrollY 恢复。history.scrollRestoration 设为 manual 一次。
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // 介绍页是长滚动页：锚点落点需要为悬浮头部预留空间；离开时还原，避免影响工作台。
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollPaddingTop = "104px";
    if (!prefersReducedMotion()) root.style.scrollBehavior = "smooth";
    return () => {
      root.style.scrollPaddingTop = "";
      root.style.scrollBehavior = "";
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 路由切换：带 hash 的跳转等目标挂载后平滑定位（scrollPaddingTop 104px 保留）；
  // 无 hash 的 PUSH 回顶（双 rAF：让 Suspense fallback 先落定、高度就位后再顶，
  // 避免高度不足时误顶）；POP 恢复历史位置（内容未就位时由 restoreScrollPosition
  // 落定后补齐）。navigationType 区分 PUSH/POP。
  const pathname = location.pathname;
  const hash = location.hash;
  const navKey = location.key;
  useEffect(() => {
    if (hash) {
      const cancel = scrollToHashWhenReady(hash);
      return cancel;
    }
    const savedY = navigationType === "POP" ? sessionScrollY.current.get(navKey) : undefined;
    let frame = 0;
    let frame2 = 0;
    let cancelRestore: (() => void) | undefined;
    if (savedY !== undefined) {
      cancelRestore = restoreScrollPosition(savedY);
    } else {
      frame = window.requestAnimationFrame(() => {
        frame2 = window.requestAnimationFrame(() => window.scrollTo(0, 0));
      });
    }
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(frame2);
      cancelRestore?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash, navKey, navigationType]);

  // POP 前把当前位置记下来，后退时恢复。SPA 内的离开不触发 pagehide，
  // 所以 effect 清理（navKey 变化、卸载）时也记一次：清理先于新页的回顶
  // rAF 执行，此刻 window.scrollY 仍是离开前的值。
  useEffect(() => {
    const record = () => {
      // 同一 key 下离开前的位置：POP 回来时按 key 取回。
      // pagehide 覆盖真实跳转/标签关闭/BFCache；visibilitychange 兜底后台切走。
      sessionScrollY.current.set(navKey, window.scrollY);
    };
    window.addEventListener("pagehide", record);
    document.addEventListener("visibilitychange", record);
    return () => {
      record();
      window.removeEventListener("pagehide", record);
      document.removeEventListener("visibilitychange", record);
    };
  }, [navKey]);

  const workbenchPath = "/home";

  // 首页点本页锚点：同页内平滑滚动，不经过路由（避免同路径 hash 跳转触发回顶 effect）。
  const scrollHomeSection = (anchorHash: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    // 保留 history.state：react-router 的 key/idx 在里面，置 null 会丢 POP/PUSH 判定。
    window.history.replaceState(window.history.state, "", anchorHash);
    scrollToHashTarget(anchorHash);
  };

  return (
    <div className={"lawver-intro" + (motionPaused ? " motion-paused" : "")}>
      <header className={"site-header" + (scrolled ? " is-scrolled" : "")}>
        <button
          type="button"
          className="intro-brand intro-brand--button"
          aria-label="Lawver"
          onClick={() => {
            if (isHome) {
              scrollToTop();
            } else {
              navigate("/");
            }
          }}
        >
          <BrandMark className="h-7 w-7 shrink-0" />
          <span className="brand-wordmark">
            <span className="brand-wordmark-swash">L</span>awver
          </span>
        </button>
        <nav className="site-nav" aria-label="页面导航">
          <div className="site-nav__group" role="group" aria-label="本页章节">
            <span className="site-nav__group-title" aria-hidden="true">本页章节</span>
            {isHome
              ? SECTION_ANCHORS.map(({ hash: anchorHash, label }) => (
                  <a
                    key={anchorHash}
                    className={
                      "site-nav__anchor" + (spyActive === anchorHash ? " is-active" : "")
                    }
                    aria-current={spyActive === anchorHash ? "true" : undefined}
                    href={anchorHash}
                    onClick={scrollHomeSection(anchorHash)}
                  >
                    {label}
                  </a>
                ))
              : SECTION_ANCHORS.map(({ hash: anchorHash, label }) => (
                  // 非首页锚点走客户端路由 <Link>，挂载后定位（见上方 effect），
                  // 不用原生 <a href="/#…"> 整页重载。
                  <Link key={anchorHash} className="site-nav__anchor" to={`/${anchorHash}`}>
                    {label}
                  </Link>
                ))}
          </div>
          <span className="site-nav__divider" aria-hidden="true" />
          <div className="site-nav__group" role="group" aria-label="页面">
            <span className="site-nav__group-title" aria-hidden="true">页面</span>
            <Link to="/design" className={activePage === "design" ? "is-active" : ""} aria-current={activePage === "design" ? "page" : undefined}>
              产品设计
            </Link>
            <Link to="/pricing" className={activePage === "pricing" ? "is-active" : ""} aria-current={activePage === "pricing" ? "page" : undefined}>
              定价
            </Link>
            <Link to="/download" className={activePage === "download" ? "is-active" : ""} aria-current={activePage === "download" ? "page" : undefined}>
              下载中心
            </Link>
          </div>
        </nav>
        <div className="site-header__actions">
          <button
            type="button"
            className="motion-toggle motion-toggle--header"
            aria-pressed={motionPaused}
            aria-label={motionPaused ? "启用动效" : "暂停动效"}
            title={motionPaused ? "启用动效" : "暂停动效"}
            onClick={toggleMotion}
          >
            {motionPaused ? (
              <Play size={14} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Pause size={14} strokeWidth={2} aria-hidden="true" />
            )}
            <span aria-hidden="true">{motionPaused ? "动效已暂停" : "动效开"}</span>
          </button>
          <a href={isAuthenticated ? workbenchPath : "/login"} className="site-header__cta">
            进入工作台
          </a>
        </div>
      </header>
      <div key={pathname} className="intro-route">
        {children}
      </div>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <Link to="/" className="intro-brand" aria-label="Lawver">
              <BrandMark className="h-8 w-8 shrink-0" />
              <span className="brand-wordmark">
                <span className="brand-wordmark-swash">L</span>awver
              </span>
            </Link>
            <p>面向中文法律场景的 AI 工作台，把法律检索、卷宗处理、模拟法庭与输出审查收在同一套应用里。</p>
            {/* 移动端章节入口：640px 下顶部药丸只留跨页链接，首页章节从这里可达。 */}
            <nav className="site-footer__sections" aria-label="首页章节">
              <span>首页章节</span>
              <div>
                {SECTION_ANCHORS.map(({ hash: anchorHash, label }) => (
                  <Link key={anchorHash} to={`/${anchorHash}`}>
                    {label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
          <nav className="site-footer__columns" aria-label="页脚导航">
            <div className="site-footer__column">
              <span>产品</span>
              <Link to="/#abilities">能力介绍</Link>
              <Link to="/#workbench">应用工作台</Link>
              <Link to="/#method">工作方式</Link>
              <Link to="/#memory">注意力与记忆</Link>
              <Link to="/#trust">信任与边界</Link>
            </div>
            <div className="site-footer__column">
              <span>页面</span>
              <Link to="/">产品首页</Link>
              <Link to="/design">产品设计</Link>
              <Link to="/pricing">定价</Link>
              <Link to="/download">下载中心</Link>
            </div>
            <div className="site-footer__column">
              <span>访问</span>
              <a href={isAuthenticated ? workbenchPath : "/login"}>打开工作台</a>
              <Link to="/download">Android 客户端</Link>
              <a href="https://github.com/Hill-1024/Lawyance" target="_blank" rel="noopener noreferrer">
                GitHub 仓库
              </a>
            </div>
          </nav>
        </div>
        <div className="site-footer__base">
          <p>&copy; {new Date().getFullYear()} Lawver，工大法智团队。</p>
        </div>
      </footer>
    </div>
  );
}

// POP 恢复用的内存表：key 是 react-router 的 location.key，值是离开时的 scrollY。
// 同一标签页内有效；跨标签/刷新不恢复（回顶），这是刻意取舍。
const sessionScrollY = { current: new Map<string, number>() };

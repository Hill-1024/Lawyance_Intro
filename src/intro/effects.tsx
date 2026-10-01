/*
 * 模块描述：介绍页的滚动效果 hooks。
 * useScrollEffects：hash 定位（唯一保留的滚动副作用）；
 * useScrollSpy：导航当前节高亮；useMotion/MotionProvider：动效总开关；
 * useAmbientBackground：深色横幅淡入时整页背景随之变暗。
 *
 * 设计约定（quote.law 基准）：内容不做滚动浮现动画——页面切换有 intro-route-in，
 * 章节内容直接在场；动效只服务于导航反馈与状态过渡。
 */

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/** 锚点滚动补偿。介绍页布局组件挂载时调用一次；不再注册任何滚动监听。 */
export function useScrollEffects() {
  useEffect(() => {
    // 直接落地带 hash 的 URL（如刷新 /design#security）：等目标挂载后定位。
    // hashchange 统一走平滑定位（scrollPaddingTop 104px 由布局保留）。
    const onHashChange = () => {
      if (window.location.hash) scrollToHashTarget(window.location.hash);
    };
    let cancelLateHash: (() => void) | undefined;
    let hashFrame = 0;
    if (window.location.hash) {
      hashFrame = window.requestAnimationFrame(() => {
        cancelLateHash = scrollToHashWhenReady(window.location.hash);
      });
    }
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.cancelAnimationFrame(hashFrame);
      cancelLateHash?.();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);
}

// ---- reduced-motion：缓存 matchMedia，不在逐帧循环里查 ----

let motionMediaQuery: MediaQueryList | null = null;
let motionMediaMatches = false;

function ensureMotionMediaCache() {
  if (typeof window === "undefined" || motionMediaQuery) return;
  motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionMediaMatches = motionMediaQuery.matches;
  motionMediaQuery.addEventListener("change", (event) => {
    motionMediaMatches = event.matches;
  });
}

/** 是否偏好减少动效。读缓存值，逐帧调用无开销。 */
export function prefersReducedMotion(): boolean {
  ensureMotionMediaCache();
  return motionMediaMatches;
}

// ---- hash / 回顶：全站唯一的滚动定位入口，统一尊重 reduced-motion ----

/** 把 hash 对应的元素滚入视口（scrollPaddingTop 104px 由布局保留）。 */
export function scrollToHashTarget(hash: string): boolean {
  let id = "";
  try {
    id = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return false;
  }
  if (!id) return false;
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({
    block: "start",
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  return true;
}

/**
 * 目标可能尚未挂载（懒加载页）：先试一次，找不到就观察 DOM，
 * 等它出现再定位，最多等 timeoutMs。返回取消函数。
 */
export function scrollToHashWhenReady(hash: string, timeoutMs = 2500): () => void {
  if (scrollToHashTarget(hash)) return () => undefined;
  const pending = new MutationObserver(() => {
    if (scrollToHashTarget(hash)) pending.disconnect();
  });
  pending.observe(document.documentElement, { childList: true, subtree: true });
  const timer = window.setTimeout(() => pending.disconnect(), timeoutMs);
  return () => {
    pending.disconnect();
    window.clearTimeout(timer);
  };
}

/** 回顶：首页品牌用，与路由回顶同一套机制。 */
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/**
 * POP 恢复历史位置：先直接落一次；若懒加载内容未就位、页面还不够高，
 * 观察 DOM 落定后补一次（最多等 timeoutMs）。用户已手动滚开就不再抢滚动。
 */
export function restoreScrollPosition(y: number, timeoutMs = 1500): () => void {
  let lastApplied = -1;
  const apply = () => {
    lastApplied = y;
    window.scrollTo(0, y);
  };
  apply();
  const settled = () => document.documentElement.scrollHeight >= y + window.innerHeight;
  if (settled()) return () => undefined;
  const pending = new MutationObserver(() => {
    if (settled() && Math.abs(window.scrollY - lastApplied) < 4) {
      apply();
      pending.disconnect();
    }
  });
  pending.observe(document.documentElement, { childList: true, subtree: true });
  const timer = window.setTimeout(() => pending.disconnect(), timeoutMs);
  return () => {
    pending.disconnect();
    window.clearTimeout(timer);
  };
}

// ---- scrollspy：与 reveal 不同的 observer，按 section 中线判定 ----

/**
 * 跟踪一组 hash 锚点当前可见的 section，返回激活中的 hash。
 * 与 reveal 不同的 observer：只跟“位置”，不碰 .reveal/.is-visible 类
 * （reveal 入场后 unobserve，scrollspy 必须常驻，两者不可共用）。
 * rootMargin 取视口中线附近窄带，同屏通常只命中一个 section。
 * 懒加载页挂载滞后：初次扫描后 800ms 再扫一次补齐。
 */
export function useScrollSpy(hashes: string[], enabled = true): string {
  const key = hashes.join("|");
  const [active, setActive] = useState("");
  useEffect(() => {
    if (!enabled || hashes.length === 0) {
      setActive("");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-38% 0px -55% 0px", threshold: 0 },
    );
    const scan = () => {
      hashes.forEach((hash) => {
        const section = document.getElementById(hash.slice(1));
        if (section) observer.observe(section);
      });
    };
    scan();
    const retry = window.setTimeout(scan, 800);
    return () => {
      window.clearTimeout(retry);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);
  return active;
}

// ---- 动效总开关：状态提升到布局级，首页按钮与各页环境光共用 ----

interface MotionState {
  paused: boolean;
  toggle: () => void;
}

const MotionContext = createContext<MotionState>({ paused: false, toggle: () => undefined });

/** 读取全局动效开关（布局的 MotionProvider 提供）。 */
export function useMotion(): MotionState {
  return useContext(MotionContext);
}

/**
 * 动效上下文：初始跟随系统 prefers-reduced-motion（读缓存，不直查 media）。
 * 页内的暂停开关已移除，当前没有 UI 会把 paused 置 true——上下文保留，
 * 环境光/卡堆等消费方仍以 paused=false 常态运行；无障碍降级走系统 media。
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(() =>
    typeof window !== "undefined" ? prefersReducedMotion() : false,
  );
  const toggle = () => setPaused((value) => !value);
  return <MotionContext.Provider value={{ paused, toggle }}>{children}</MotionContext.Provider>;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number, start: number, end: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

// 与官网一致的纸面→深色端点；写死是因为背景合成层独立于主题 token。
const PAPER: [number, number, number] = [246, 248, 251];
const DARK: [number, number, number] = [11, 13, 20];

/**
 * 滚动驱动的整页背景：section 充满视口时，.page::before 固定层从纸面交叉淡化到
 * 深色，白色顶光褪去，--ambient-dark-wash 抬升（深色节的透明边缘依赖它）。
 * enabled=false（用户暂停了动效）时只按当前位置画一帧静态结果，不挂滚动监听。
 */
export function useAmbientBackground(
  sectionRef: React.RefObject<HTMLElement | null>,
  enabled = true,
) {
  const teardownRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const page = section?.closest<HTMLElement>(".page");
    if (!section || !page) return;

    let scrollFrame = 0;
    let animationFrame = 0;
    let targetProgress = 0;
    let renderedProgress = 0;

    const paint = (progress: number) => {
      const eased = smoothstep(progress, 0, 1);
      page.style.setProperty("--ambient-progress", eased.toFixed(4));
      page.style.setProperty("--ambient-r", mix(PAPER[0], DARK[0], eased).toFixed(2));
      page.style.setProperty("--ambient-g", mix(PAPER[1], DARK[1], eased).toFixed(2));
      page.style.setProperty("--ambient-b", mix(PAPER[2], DARK[2], eased).toFixed(2));
      page.style.setProperty("--ambient-light-wash", (0.88 * (1 - eased)).toFixed(4));
      page.style.setProperty("--ambient-dark-wash", (0.2 + 0.46 * eased).toFixed(4));
    };

    // 用可见覆盖率而非原始偏移，矮于视口的节也能在充满屏幕时达到全暗。
    const measure = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0),
      );
      const maxVisibleHeight = Math.max(1, Math.min(rect.height, viewportHeight));
      return smoothstep(visibleHeight / maxVisibleHeight, 0.08, 0.88);
    };

    // 暂停动效：按当前位置落一帧静态结果，不插值、不挂滚动监听。
    if (!enabled) {
      paint(measure());
      return;
    }

    // 始终插值、阈值内吸附：快滚时端点也不直接瞬移，避免背景跳变。
    // reduced-motion 读缓存值，不在逐帧里查 matchMedia。
    const animate = () => {
      const velocity = prefersReducedMotion() ? 1 : targetProgress > renderedProgress ? 0.42 : 0.3;
      renderedProgress += (targetProgress - renderedProgress) * velocity;
      if (Math.abs(targetProgress - renderedProgress) < 0.001) {
        renderedProgress = targetProgress;
        paint(renderedProgress);
        animationFrame = 0;
        return;
      }
      paint(renderedProgress);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const update = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        targetProgress = measure();
        if (!animationFrame) animationFrame = window.requestAnimationFrame(animate);
      });
    };

    // 同步先画一帧：直接落到页中部的加载（如刷新 /design#security）不会闪纸面底。
    // paint 仍逐帧写 6 个 CSS 变量驱动 .page::before 整视口三层渐变
    // （intro-base.css:58-76），本轮不动合成层结构（见 deferred）。
    targetProgress = measure();
    renderedProgress = targetProgress;
    paint(renderedProgress);

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    teardownRef.current = () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
    return () => {
      teardownRef.current?.();
      teardownRef.current = null;
    };
  }, [sectionRef, enabled]);
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const smoothstep = (value: number, start: number, end: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

const PAPER: [number, number, number] = [246, 248, 251];
const DARK: [number, number, number] = [11, 13, 20];

/**
 * Scroll-driven page background. As `section` fills the viewport the fixed
 * `.page::before` layer crossfades from paper to the band colour, the white top
 * wash drains away, and `--ambient-dark-wash` — which the dark section uses for
 * its own transparent edges — climbs. The section therefore dissolves into the
 * page instead of sitting on it.
 *
 * Both the home and design pages feed this their single dark section. The
 * easing loop is hand-rolled rather than a CSS transition because the wash
 * variables are untyped and would not interpolate.
 *
 * Returns a teardown function for callers that own a component lifecycle.
 */
export function setupAmbientBackground(section: Element | null): () => void {
  const page = section?.closest<HTMLElement>('.page');

  if (!section || !page) {
    return () => {};
  }

  let scrollFrame = 0;
  let animationFrame = 0;
  let targetProgress = 0;
  let renderedProgress = 0;

  const paint = (progress: number) => {
    const eased = smoothstep(progress, 0, 1);

    page.style.setProperty('--ambient-progress', eased.toFixed(4));
    page.style.setProperty('--ambient-r', mix(PAPER[0], DARK[0], eased).toFixed(2));
    page.style.setProperty('--ambient-g', mix(PAPER[1], DARK[1], eased).toFixed(2));
    page.style.setProperty('--ambient-b', mix(PAPER[2], DARK[2], eased).toFixed(2));
    page.style.setProperty('--ambient-light-wash', (0.88 * (1 - eased)).toFixed(4));
    page.style.setProperty('--ambient-dark-wash', (0.2 + 0.46 * eased).toFixed(4));
  };

  // Coverage rather than raw offset, so a section shorter than the viewport
  // still reaches full darkness once it fully fills the screen.
  const measure = () => {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
    const maxVisibleHeight = Math.max(1, Math.min(rect.height, viewportHeight));

    return smoothstep(visibleHeight / maxVisibleHeight, 0.08, 0.88);
  };

  const animate = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const velocity = reducedMotion ? 1 : targetProgress > renderedProgress ? 0.42 : 0.3;

    if (targetProgress >= 0.999 || targetProgress <= 0.001) {
      renderedProgress = targetProgress;
      paint(renderedProgress);
      animationFrame = 0;
      return;
    }

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
    if (scrollFrame) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      targetProgress = measure();

      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    });
  };

  // Paint once synchronously. The eased loop needs an animation frame, and a
  // load that lands mid-page (a reload of `/design/#security`, say) would
  // otherwise show the paper background until that frame runs.
  targetProgress = measure();
  renderedProgress = targetProgress;
  paint(renderedProgress);

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);

    if (scrollFrame) {
      window.cancelAnimationFrame(scrollFrame);
    }

    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }
  };
}

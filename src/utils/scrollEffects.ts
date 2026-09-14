const revealSelector = '.reveal:not(.is-visible)';
const revealStaggerMs = 40;
const revealStaggerCapMs = 200;

/**
 * Progressive enhancement shared by every page: scroll-triggered reveals plus
 * hash navigation that accounts for the fixed header. It lives outside the Vue
 * components so the static pages can use it without shipping a framework runtime.
 *
 * Returns a teardown function for callers that own a component lifecycle.
 */
export function setupScrollEffects(): () => void {
  document.documentElement.dataset.revealReady = 'true';

  // `threshold: 0` keeps blocks taller than the viewport revealable; a ratio
  // threshold would never be reached by a tall section and strand it hidden.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: '0px 0px -6% 0px' },
  );

  Array.from(document.querySelectorAll<HTMLElement>(revealSelector)).forEach((target, index) => {
    target.style.setProperty('--delay', `${Math.min(index * revealStaggerMs, revealStaggerCapMs)}ms`);
    observer.observe(target);
  });

  const scrollToHashTarget = () => {
    const id = window.location.hash.slice(1);

    if (!id) {
      return;
    }

    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  };

  const hashFrame = window.requestAnimationFrame(scrollToHashTarget);
  window.addEventListener('hashchange', scrollToHashTarget);

  return () => {
    observer.disconnect();
    window.cancelAnimationFrame(hashFrame);
    window.removeEventListener('hashchange', scrollToHashTarget);
  };
}

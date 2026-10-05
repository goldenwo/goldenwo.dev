// Blur to focus: cards start soft and sharpen as they scroll into view.
// Progressive enhancement: the page ships sharp, and nothing blurs unless this
// script runs and the visitor has not asked for reduced motion.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isOnScreen = (el: Element) => {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
};

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
  );
  // Already-visible elements stay sharp (no blur-then-unblur flicker on load);
  // only off-screen ones wait to come into focus.
  document.querySelectorAll('.reveal').forEach((el) => {
    if (isOnScreen(el)) el.classList.add('in-view');
    else observer.observe(el);
  });
  document.documentElement.classList.add('focus-ready');
}

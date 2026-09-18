/**
 * One shared scroll pass drives every .reveal block on the page: a single
 * passive listener and a single requestAnimationFrame, rather than an observer
 * each. It reveals anything whose top has crossed the trigger line, which
 * includes blocks already scrolled past (an anchor jump can move a block from
 * below the viewport to above it without ever intersecting).
 */
const TRIGGER_INSET = 40;

const html = document.documentElement;
// Tells the layout's failsafe that this script is alive and will reveal.
html.setAttribute('data-reveal-ready', '');

if (html.classList.contains('js-reveal')) {
  const pending = new Set<HTMLElement>(document.querySelectorAll<HTMLElement>('.reveal'));
  let frame = 0;

  const stop = () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  };
  const flush = () => {
    frame = 0;
    const line = window.innerHeight - TRIGGER_INSET;
    for (const el of pending) {
      if (el.getBoundingClientRect().top < line) {
        pending.delete(el);
        el.classList.add('is-visible');
      }
    }
    if (pending.size === 0) stop();
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(flush);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  schedule();
}

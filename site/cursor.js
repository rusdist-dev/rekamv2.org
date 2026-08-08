/* Follower cursor — a soft disc that trails the pointer and reveals an arrow
 * over anything clickable. Adapted from the Cursor component on stationabt.com.
 *
 * Self-gating: only builds itself when the active nav variant declares
 * --nav-cursor: on, so the same script tag can sit on every page while the
 * other variants simply ignore it. Never builds on touch-only devices, or
 * when the visitor has asked for reduced motion.
 */

(() => {
  'use strict';

  const enabled = getComputedStyle(document.documentElement)
    .getPropertyValue('--nav-cursor').trim() === 'on';
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!enabled || !finePointer || reducedMotion) return;

  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none">' +
    '<path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.75"' +
    ' stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(el);
  document.body.classList.add('has-cursor');

  /* ---- Keep the disc above modal dialogs ----
     A dialog opened with showModal() renders in the top layer, which sits above
     every z-index in the document — z-index: 300 cannot compete, and because the
     native cursor is hidden too the pointer disappeared entirely over the panel.
     Marking the disc as a popover is the one way to put an ordinary element in
     the top layer as well. "manual" so it never steals focus and never closes on
     Escape; it stays up for the life of the page.

     Top-layer paint order is promotion order, so a dialog opening later lands on
     top of us — hence the re-promotion below. */
  const promote = () => {
    if (!('showPopover' in el)) return;
    try { el.hidePopover(); } catch { /* was not showing */ }
    try { el.showPopover(); } catch { /* not connected yet */ }
  };

  if ('showPopover' in el) {
    el.popover = 'manual';
    promote();

    new MutationObserver((records) => {
      for (const record of records) {
        if (record.target.tagName === 'DIALOG' && record.target.open) {
          promote();
          return;
        }
      }
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['open'],
      subtree: true,
    });
  }

  // Anything the disc should grow over. The hero stage is excluded on purpose:
  // it has its own grab/grabbing cursor and dragging it is the whole point.
  const CLICKABLE = 'a[href], button, summary, [role="button"]';
  const NATIVE = 'input, textarea, select, .hero__stage';

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let visible = false;
  let frame = null;

  const EASE = 0.18;   // higher follows more tightly

  const tick = () => {
    x += (targetX - x) * EASE;
    y += (targetY - y) * EASE;
    el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;

    // Park the loop once it has caught up, and restart on the next move.
    if (Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1) {
      x = targetX;
      y = targetY;
      el.style.translate = `${x}px ${y}px`;
      frame = null;
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (frame === null) frame = requestAnimationFrame(tick);
  };

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    targetX = event.clientX;
    targetY = event.clientY;

    if (!visible) {
      visible = true;
      // Jump rather than glide in from wherever it was parked.
      x = targetX;
      y = targetY;
      el.style.translate = `${x}px ${y}px`;
      el.classList.add('is-active');
    }

    const over = event.target instanceof Element ? event.target : null;
    const onNative = over ? over.closest(NATIVE) : null;
    el.classList.toggle('is-active', !onNative);
    el.classList.toggle('is-over-link', !onNative && !!(over && over.closest(CLICKABLE)));

    wake();
  }, { passive: true });

  // Leaving the window, or a context where the pointer is gone, hides it.
  const hide = () => {
    visible = false;
    el.classList.remove('is-active', 'is-over-link');
  };
  document.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
})();

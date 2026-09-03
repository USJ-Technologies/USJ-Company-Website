import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// The public Layout lets the window scroll, but AdminLayout and PartnerLayout put
// overflow-y-auto on their own <main>, so window.scrollTo is a no-op inside the
// dashboards. Those elements carry data-scroll-container.
const getScroller = () => document.querySelector('[data-scroll-container]');

const scrollTo = (el, top) => {
  // index.css sets `html { scroll-behavior: smooth }`. On a route change that would
  // glide down the freshly rendered page, so force an immediate jump instead.
  const options = { top, left: 0, behavior: 'instant' };
  if (el) el.scrollTo(options);
  else window.scrollTo(options);
};

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map());
  const isFirstRender = useRef(true);

  // Remember where each history entry was left so back/forward can restore it,
  // rather than dumping the user at the top of a 726-product grid.
  useEffect(() => {
    const el = getScroller();
    const target = el ?? window;
    const record = () => positions.current.set(key, el ? el.scrollTop : window.scrollY);

    target.addEventListener('scroll', record, { passive: true });
    return () => target.removeEventListener('scroll', record);
  }, [key]);

  useLayoutEffect(() => {
    // On the very first render the browser has already restored the scroll offset
    // (reload) or resolved a deep link's #anchor — don't fight it.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (hash) {
      const anchor = document.getElementById(hash.slice(1));
      if (anchor) {
        anchor.scrollIntoView();
        return;
      }
    }

    const restored = navigationType === 'POP' ? positions.current.get(key) : undefined;
    scrollTo(getScroller(), restored ?? 0);
  }, [pathname, hash, key, navigationType]);

  return null;
}

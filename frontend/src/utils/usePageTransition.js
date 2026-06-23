import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * usePageTransition — runs a clean entrance animation for any page.
 * Returns a ref to attach to the page's root element.
 * 
 * Usage:
 *   const pageRef = usePageTransition();
 *   return <div ref={pageRef}>...</div>;
 */
export function usePageTransition() {
  const ref = useRef(null);

  useGSAP(() => {
    if (!ref.current) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(ref.current, {
        autoAlpha: 0,
        y: 18,
        duration: 0.5,
        ease: 'power2.out',
        clearProps: 'transform,opacity,visibility',
      });
    });

    return () => mm.revert();
  }, { scope: ref });

  return ref;
}

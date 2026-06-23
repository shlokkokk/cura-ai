import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

/**
 * AnimationWrapper — scroll-reveal container using ScrollTrigger.batch()
 * Wraps children and staggers them in as they enter the viewport.
 *
 * Props:
 *   selector  — CSS class selector for batch targets (default: '.anim-child')
 *   y         — start y offset (default: 50)
 *   stagger   — seconds between each child (default: 0.1)
 *   start     — ScrollTrigger start string (default: 'top 88%')
 *   once      — kill trigger after first play (default: true)
 *   className — wrapper className
 *   style     — wrapper style
 */
export default function AnimationWrapper({
  selector = '.anim-child',
  y = 50,
  stagger = 0.1,
  start = 'top 88%',
  once = true,
  className = '',
  style = {},
  children,
}) {
  const containerRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Respect prefers-reduced-motion
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (ctx) => {
        const { motion } = ctx.conditions;

        if (motion) {
          // Set initial state for all children
          const targets = containerRef.current?.querySelectorAll(selector);
          if (!targets || targets.length === 0) return;

          gsap.set(targets, { autoAlpha: 0, y });

          ScrollTrigger.batch(targets, {
            start,
            onEnter: (batch) =>
              gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                stagger,
                ease: 'power3.out',
                duration: 0.8,
                overwrite: true,
              }),
            once,
          });
        }
      }
    );

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
    </div>
  );
}

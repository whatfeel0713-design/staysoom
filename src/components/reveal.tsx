"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger step: 0 (default) to 3. */
  delay?: 0 | 1 | 2 | 3;
  as?: "div" | "section" | "p" | "h2" | "h3" | "figure" | "li";
}

/**
 * Fades content up once it scrolls into view (Apple-style easing,
 * defined in globals.css). Renders visible immediately if
 * IntersectionObserver is unavailable or reduced motion is preferred.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay > 0 ? ` reveal-delay-${delay}` : "";

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`reveal${delayClass} ${className}`}>
      {children}
    </Tag>
  );
}

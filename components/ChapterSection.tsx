"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type ChapterSectionProps = {
  id: string;
  chapter: string;
  eyebrow: string;
  title: string;
  summary: string;
  reducedMotion: boolean;
  children: ReactNode;
  className?: string;
};

export default function ChapterSection({
  id,
  chapter,
  eyebrow,
  title,
  summary,
  reducedMotion,
  children,
  className = "",
}: ChapterSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsActive(entry.isIntersecting);
        });
      },
      {
        threshold: 0.12,
      },
    );

    observer.observe(section);

    let rafId = 0;

    const smoothstep = (edge0: number, edge1: number, value: number) => {
      const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    };

    const updateScrollPhase = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const range = rect.height + vh;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / range));

      if (reducedMotion) {
        section.style.setProperty("--chapter-progress", "1");
        section.style.setProperty("--chapter-alpha", "1");
        section.style.setProperty("--chapter-shift", "0px");
        section.style.setProperty("--chapter-scale", "1");
      } else {
        const focusWindow = 1 - Math.min(1, Math.abs(progress - 0.5) * 2);
        const easedFocus = smoothstep(0, 1, focusWindow);

        const alpha = 0.22 + easedFocus * 0.78;
        const shift = (0.5 - progress) * 80;
        const scale = 0.94 + easedFocus * 0.06;

        section.style.setProperty("--chapter-progress", progress.toFixed(4));
        section.style.setProperty("--chapter-alpha", alpha.toFixed(4));
        section.style.setProperty("--chapter-shift", `${shift.toFixed(2)}px`);
        section.style.setProperty("--chapter-scale", scale.toFixed(4));
      }
    };

    const tick = () => {
      updateScrollPhase();
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`story-chapter ${isActive ? "is-active" : ""} ${className}`.trim()}
    >
      <div className="story-sticky">
        <aside className="story-rail" aria-hidden="true">
          <span className="story-rail-dot" />
          <span className="story-rail-line" />
          <span className="story-rail-fill" />
        </aside>

        <article className="story-shell">
          <header className="story-heading">
            <p className="story-index">{chapter}</p>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p className="story-summary">{summary}</p>
          </header>
          <div className="story-content">{children}</div>
        </article>
      </div>
    </section>
  );
}

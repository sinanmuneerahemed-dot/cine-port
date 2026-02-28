"use client";

import { useEffect, useMemo, useState } from "react";
import AuroraFogBackground from "@/components/AuroraFogBackground";
import ChapterSection from "@/components/ChapterSection";
import IntroScrambleLock from "@/components/IntroScrambleLock";

type MotionMode = "auto" | "reduced" | "full";

export default function PortfolioPage() {
  const [introDone, setIntroDone] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [motionMode, setMotionMode] = useState<MotionMode>("auto");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      setSystemReducedMotion(mediaQuery.matches);
    };

    applyPreference();
    mediaQuery.addEventListener("change", applyPreference);

    return () => {
      mediaQuery.removeEventListener("change", applyPreference);
    };
  }, []);

  const reducedMotion = useMemo(() => {
    if (motionMode === "reduced") {
      return true;
    }

    if (motionMode === "full") {
      return false;
    }

    return systemReducedMotion;
  }, [motionMode, systemReducedMotion]);

  const motionLabel =
    motionMode === "auto"
      ? `Motion: Auto (${systemReducedMotion ? "Reduced" : "Full"})`
      : motionMode === "reduced"
        ? "Motion: Reduced"
        : "Motion: Full";

  const cycleMotionMode = () => {
    setMotionMode((currentMode) => {
      if (currentMode === "auto") {
        return "reduced";
      }

      if (currentMode === "reduced") {
        return "full";
      }

      return "auto";
    });
  };

  return (
    <>
      <AuroraFogBackground reducedMotion={reducedMotion} />

      {!introDone && (
        <IntroScrambleLock
          reducedMotion={reducedMotion}
          onDone={() => setIntroDone(true)}
        />
      )}

      <button
        className="motion-toggle"
        type="button"
        onClick={cycleMotionMode}
        aria-label="Cycle motion mode"
      >
        {motionLabel}
      </button>

      <main className={`site-main ${introDone ? "is-active" : "is-muted"}`}>
        <header className="story-intro">
          <p className="story-intro-label">SINAN / Interactive Portfolio</p>
          <h1>Stories built with code, motion, and restraint.</h1>
          <p>
            Scroll through a narrative build process. Each chapter reveals how
            atmosphere becomes product, and product becomes measurable impact.
          </p>
        </header>

        <ChapterSection
          id="act-01"
          chapter="Act 01"
          eyebrow="Opening Signal"
          title="A quiet frame before the first interaction."
          summary="The story starts in low contrast and slow tempo. Users enter without pressure, then the interface gradually reveals direction."
          reducedMotion={reducedMotion}
          className="chapter-hero"
        >
          <blockquote className="quote-panel">
            Luxury on the web is not noise. It is confidence in pacing,
            typography, and technical execution.
          </blockquote>
          <div className="metric-strip">
            <article className="metric-chip">
              <p>Tempo</p>
              <strong>Slow Breath</strong>
            </article>
            <article className="metric-chip">
              <p>Intent</p>
              <strong>Clarity First</strong>
            </article>
            <article className="metric-chip">
              <p>Mode</p>
              <strong>Scroll Narrative</strong>
            </article>
          </div>
        </ChapterSection>

        <ChapterSection
          id="act-02"
          chapter="Act 02"
          eyebrow="System Rise"
          title="The interface transitions from emotion to structure."
          summary="This chapter introduces architecture decisions. Every motion choice is connected to readability, hierarchy, and device constraints."
          reducedMotion={reducedMotion}
        >
          <ol className="beat-list">
            <li className="beat-item">
              <h3>Scene Mapping</h3>
              <p>
                Break the experience into clear chapters with scroll checkpoints
                and predictable state changes.
              </p>
            </li>
            <li className="beat-item">
              <h3>Interaction Weight</h3>
              <p>
                Motion intensity scales with user input speed, then dampens to a
                calm baseline.
              </p>
            </li>
            <li className="beat-item">
              <h3>Readability Guardrails</h3>
              <p>
                Glass layers and controlled contrast keep copy legible above
                complex WebGL movement.
              </p>
            </li>
            <li className="beat-item">
              <h3>Adaptive Quality</h3>
              <p>
                Reduced effects on low-power devices preserve fluidity while
                keeping the same visual language.
              </p>
            </li>
          </ol>
        </ChapterSection>

        <ChapterSection
          id="act-03"
          chapter="Act 03"
          eyebrow="Proof"
          title="Moments that convert story into business outcomes."
          summary="The strongest chapters are where visual drama serves concrete product goals: retention, trust, and conversion."
          reducedMotion={reducedMotion}
        >
          <div className="scene-grid">
            <article className="scene-card">
              <p className="scene-meta">2025 / Immersive Commerce</p>
              <h3>Atelier Spectra</h3>
              <p>
                Increased average session depth by framing each product reveal
                as a guided camera chapter instead of a static catalog.
              </p>
            </article>
            <article className="scene-card">
              <p className="scene-meta">2024 / Brand Platform</p>
              <h3>Northline Systems</h3>
              <p>
                Converted a dense service website into a scroll story where
                complex offerings are introduced in staged, digestible sequences.
              </p>
            </article>
            <article className="scene-card">
              <p className="scene-meta">2024 / Product Narrative</p>
              <h3>Halcyon Labs</h3>
              <p>
                Built a calm launch narrative where each scroll segment aligns
                with one product promise and one measurable KPI.
              </p>
            </article>
          </div>
        </ChapterSection>

        <ChapterSection
          id="act-04"
          chapter="Act 04"
          eyebrow="Finale"
          title="From first brief to launch, one continuous storyline."
          summary="Collaboration is run like production: short loops, visible milestones, and decisions tied to user outcomes."
          reducedMotion={reducedMotion}
          className="chapter-outro"
        >
          <div className="outro-layout">
            <div className="outro-note">
              <h3>Collaboration cadence</h3>
              <p>Week 1: Direction lock and narrative map.</p>
              <p>Week 2-3: Interaction and shader implementation.</p>
              <p>Week 4: Performance tuning and launch handoff.</p>
            </div>
            <div className="outro-actions">
              <a
                className="cta-button cta-primary"
                href="mailto:hello@sinan.dev"
              >
                Start a project
              </a>
              <a className="cta-button cta-ghost" href="#">
                View capability deck
              </a>
            </div>
          </div>
          <div className="signature-line">
            <span>SINAN</span>
            <span>Dynamic Web Architect</span>
            <span>Available for selected collaborations</span>
          </div>
          <div className="cta-row">
            <a className="cta-button cta-primary" href="mailto:hello@sinan.dev">
              hello@sinan.dev
            </a>
            <a className="cta-button cta-ghost" href="#">
              Download project brief
            </a>
          </div>
        </ChapterSection>
      </main>
    </>
  );
}

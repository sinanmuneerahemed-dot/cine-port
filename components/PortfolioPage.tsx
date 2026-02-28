"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import AuroraFogBackground from "@/components/AuroraFogBackground";
import ChapterSection from "@/components/ChapterSection";
import IntroScrambleLock from "@/components/IntroScrambleLock";

type MotionMode = "auto" | "reduced" | "full";

const assemblyCards = [
  {
    slot: 0.16,
    phase: "Layer 01",
    title: "Structure",
    body: "Information architecture appears first: spacing, hierarchy, and rhythm.",
  },
  {
    slot: 0.3,
    phase: "Layer 02",
    title: "Surface",
    body: "Visual tone sharpens: glass, type contrast, and cinematic depth alignment.",
  },
  {
    slot: 0.44,
    phase: "Layer 03",
    title: "Behavior",
    body: "Motion becomes logic: scroll, velocity, and response mapped to intent.",
  },
  {
    slot: 0.58,
    phase: "Layer 04",
    title: "Stability",
    body: "Performance tuning locks the experience so elegance stays smooth.",
  },
];

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
        <ChapterSection
          id="act-01"
          chapter="Act 1"
          eyebrow="Silence"
          title="Before code, there is intention."
          summary="Scroll..."
          reducedMotion={reducedMotion}
          className="chapter-silence"
        >
          <div className="silence-stage">
            <p className="silence-line silence-line-one">
              Before code,
              <br />
              there is intention.
            </p>
            <p className="silence-line silence-line-two">
              Before design,
              <br />
              there is clarity.
            </p>
          </div>
        </ChapterSection>

        <ChapterSection
          id="act-02"
          chapter="Act 2"
          eyebrow="The Realization"
          title="Most websites just sit there. I build systems that respond."
          summary="Motion is not decoration. It is communication."
          reducedMotion={reducedMotion}
          className="chapter-realization"
        >
          <div className="realization-stage">
            <p className="realization-line realization-line-one">
              Most websites just sit there.
              <br />
              I build systems that respond.
            </p>
            <p className="realization-line realization-line-two">
              Motion is not decoration.
              <br />
              It is communication.
            </p>
          </div>
        </ChapterSection>

        <ChapterSection
          id="act-03"
          chapter="Act 3"
          eyebrow="Assembly"
          title="Structure. Surface. Behavior."
          summary="Cards materialize from fog, sharpen, and lock as you scroll."
          reducedMotion={reducedMotion}
          className="chapter-assembly"
        >
          <div className="assembly-stack">
            {assemblyCards.map((card) => (
              <article
                key={card.title}
                className="assembly-card"
                style={{ "--slot": card.slot } as CSSProperties}
              >
                <p className="assembly-phase">{card.phase}</p>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </ChapterSection>

        <ChapterSection
          id="act-04"
          chapter="Act 4"
          eyebrow="Proof"
          title="Systems I've Built"
          summary="Each one built to feel alive, but engineered to stay usable and fast."
          reducedMotion={reducedMotion}
          className="chapter-proof"
        >
          <div className="proof-list">
            <article className="proof-item">
              <h3>Atlas Commerce</h3>
              <p>A narrative storefront that raised session depth with guided motion.</p>
              <a href="#" className="proof-link">
                View case
              </a>
            </article>
            <article className="proof-item">
              <h3>Northline Platform</h3>
              <p>Complex service architecture transformed into a clear scroll journey.</p>
              <a href="#" className="proof-link">
                View case
              </a>
            </article>
            <article className="proof-item">
              <h3>Halcyon Launch</h3>
              <p>Product narrative where timing and depth drove trust and conversion.</p>
              <a href="#" className="proof-link">
                View case
              </a>
            </article>
          </div>
        </ChapterSection>

        <ChapterSection
          id="act-05"
          chapter="Act 5"
          eyebrow="Final Shot"
          title="If this feels alive... imagine what we can build together."
          summary="Pause."
          reducedMotion={reducedMotion}
          className="chapter-finale"
        >
          <div className="finale-stage">
            <p className="finale-signature">- Sinan Muneer</p>
            <a className="finale-contact" href="mailto:hello@sinan.dev">
              hello@sinan.dev
            </a>
          </div>
        </ChapterSection>
      </main>
    </>
  );
}

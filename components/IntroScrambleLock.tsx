"use client";

import { useEffect, useRef, useState } from "react";

const TARGET = "SINAN";
const CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*";

type IntroScrambleLockProps = {
  onDone: () => void;
  reducedMotion: boolean;
};

function buildScrambledText(lockedCount: number) {
  return TARGET.split("")
    .map((char, index) => {
      if (index < lockedCount) {
        return char;
      }

      const randomIndex = Math.floor(Math.random() * CHAR_POOL.length);
      return CHAR_POOL[randomIndex];
    })
    .join("");
}

export default function IntroScrambleLock({
  onDone,
  reducedMotion,
}: IntroScrambleLockProps) {
  const [label, setLabel] = useState(TARGET);
  const [phase, setPhase] = useState<"running" | "locked" | "fading">(
    "running",
  );
  const doneRef = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    let scrambleTimer = 0;
    let lockTimer = 0;
    let fadeTimer = 0;
    let doneTimer = 0;
    let resetTimer = 0;
    let lockFrame = 0;
    let lockedCount = 0;

    const finish = () => {
      if (doneRef.current) {
        return;
      }

      doneRef.current = true;
      onDone();
    };

    if (reducedMotion) {
      lockFrame = window.requestAnimationFrame(() => {
        setLabel(TARGET);
        setPhase("locked");
      });

      fadeTimer = window.setTimeout(() => setPhase("fading"), 280);
      doneTimer = window.setTimeout(finish, 900);

      return () => {
        window.cancelAnimationFrame(lockFrame);
        window.clearTimeout(fadeTimer);
        window.clearTimeout(doneTimer);
      };
    }

    resetTimer = window.setTimeout(() => {
      setPhase("running");
      setLabel(buildScrambledText(0));
    }, 0);

    scrambleTimer = window.setInterval(() => {
      setLabel(buildScrambledText(lockedCount));
    }, 60);

    lockTimer = window.setInterval(() => {
      lockedCount += 1;

      if (lockedCount >= TARGET.length) {
        lockedCount = TARGET.length;
        setLabel(TARGET);
        setPhase("locked");
        window.clearInterval(scrambleTimer);
        window.clearInterval(lockTimer);

        fadeTimer = window.setTimeout(() => setPhase("fading"), 340);
        doneTimer = window.setTimeout(finish, 1000);
      }
    }, 360);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearInterval(scrambleTimer);
      window.clearInterval(lockTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone, reducedMotion]);

  return (
    <div
      className={`intro-overlay ${phase === "locked" ? "is-locked" : ""} ${
        phase === "fading" ? "is-fading" : ""
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="intro-content">
        <p className="intro-subtitle">Dynamic Web Architect</p>
        <h1 className="intro-title">{label}</h1>
        <p className="intro-hint">SCROLL TO ENTER v</p>
      </div>
    </div>
  );
}

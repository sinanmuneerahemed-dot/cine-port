"use client";

import { useEffect, useMemo, useState } from "react";
import AuroraFogBackground from "@/components/AuroraFogBackground";
import MapGamePortfolio from "@/components/MapGamePortfolio";

type MotionMode = "auto" | "reduced" | "full";

export default function HomePage() {
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
      <MapGamePortfolio
        reducedMotion={reducedMotion}
        motionLabel={motionLabel}
        onCycleMotion={cycleMotionMode}
      />
    </>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AuroraFogBackground from "@/components/AuroraFogBackground";

type MotionMode = "auto" | "reduced" | "full";

type Vector2 = {
  x: number;
  y: number;
};

type ZoneLinks = {
  open?: string;
  demo?: string;
  github?: string;
};

type PortfolioZone = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  position: Vector2;
  radius: number;
  tags: string[];
  accent: string;
  links: ZoneLinks;
};

type IslandBlob = {
  x: number;
  y: number;
  radius: number;
  tint: string;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftY: number;
  phase: number;
};

const WORLD_HALF = 3000;
const WORLD_SIZE = WORLD_HALF * 2;
const XP_PER_ZONE = 20;
const INTERACT_RANGE_PAD = 92;

const zones: PortfolioZone[] = [
  {
    id: "home",
    title: "SINAN (Home / Spawn)",
    subtitle: "Starting Point",
    description:
      "This is the command center. Every project starts from clarity, then expands into interaction and systems.",
    position: { x: 0, y: 0 },
    radius: 240,
    tags: ["Spawn", "Direction", "Identity"],
    accent: "#89c7ff",
    links: {
      open: "https://cine-port.vercel.app",
      demo: "https://cine-port.vercel.app",
      github: "https://github.com/sinanmuneerahemed-dot/cine-port",
    },
  },
  {
    id: "becoming",
    title: "BECOMING",
    subtitle: "Narrative Build",
    description:
      "A personal narrative system exploring motion-led storytelling, identity, and cinematic pacing across scroll chapters.",
    position: { x: -1160, y: -760 },
    radius: 220,
    tags: ["Storytelling", "Motion", "Narrative"],
    accent: "#b39dff",
    links: {},
  },
  {
    id: "cinematic-websites",
    title: "Cinematic Websites",
    subtitle: "Interactive Web Experiences",
    description:
      "Production-grade experiences where shaders, transitions, and information architecture align for performance and impact.",
    position: { x: 1520, y: -440 },
    radius: 230,
    tags: ["WebGL", "Next.js", "Performance"],
    accent: "#7cd9cb",
    links: {
      open: "https://cine-port.vercel.app",
      demo: "https://cine-port.vercel.app",
      github: "https://github.com/sinanmuneerahemed-dot/cine-port",
    },
  },
  {
    id: "design-posters",
    title: "Design / Posters",
    subtitle: "Visual Direction",
    description:
      "Typography and composition studies translated into digital surfaces, balancing editorial clarity with atmospheric depth.",
    position: { x: -930, y: 1220 },
    radius: 220,
    tags: ["Poster Design", "Typography", "Art Direction"],
    accent: "#8ec6ff",
    links: {},
  },
  {
    id: "contact",
    title: "Contact / Hire Me",
    subtitle: "Collaboration",
    description:
      "For selected collaborations on premium product narratives, immersive launches, and high-performance interactive websites.",
    position: { x: 1360, y: 1300 },
    radius: 235,
    tags: ["Freelance", "Consulting", "Build Partner"],
    accent: "#83d5bf",
    links: {
      open: "mailto:hello@sinan.dev",
      github: "https://github.com/sinanmuneerahemed-dot",
    },
  },
];

const islands: IslandBlob[] = [
  { x: -1550, y: -1100, radius: 760, tint: "rgba(120, 160, 225, 0.14)" },
  { x: 1460, y: -980, radius: 810, tint: "rgba(140, 126, 198, 0.13)" },
  { x: -1080, y: 1480, radius: 720, tint: "rgba(118, 191, 181, 0.14)" },
  { x: 1700, y: 1300, radius: 760, tint: "rgba(145, 172, 225, 0.13)" },
  { x: 220, y: 310, radius: 980, tint: "rgba(130, 150, 210, 0.1)" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function length(v: Vector2) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function createParticles(count: number): Particle[] {
  const list: Particle[] = [];

  for (let i = 0; i < count; i += 1) {
    list.push({
      x: Math.random() * WORLD_SIZE - WORLD_HALF,
      y: Math.random() * WORLD_SIZE - WORLD_HALF,
      size: 0.8 + Math.random() * 1.6,
      driftX: (Math.random() - 0.5) * 6,
      driftY: (Math.random() - 0.5) * 6,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return list;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width * 0.5, height * 0.5);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function linkLabel(kind: keyof ZoneLinks) {
  if (kind === "open") {
    return "Open";
  }

  if (kind === "demo") {
    return "Demo";
  }

  return "GitHub";
}

export default function MapGamePortfolio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<HTMLDivElement | null>(null);

  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [motionMode, setMotionMode] = useState<MotionMode>("auto");
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [nearbyZoneId, setNearbyZoneId] = useState<string | null>(null);
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [joystickKnob, setJoystickKnob] = useState<Vector2>({ x: 0, y: 0 });

  const reducedMotion = useMemo(() => {
    if (motionMode === "reduced") {
      return true;
    }

    if (motionMode === "full") {
      return false;
    }

    return systemReducedMotion;
  }, [motionMode, systemReducedMotion]);

  const activeZone = useMemo(
    () => zones.find((zone) => zone.id === activeZoneId) ?? null,
    [activeZoneId],
  );
  const nearbyZone = useMemo(
    () => zones.find((zone) => zone.id === nearbyZoneId) ?? null,
    [nearbyZoneId],
  );

  const discoveredRef = useRef<Set<string>>(new Set());
  const nearbyZoneRef = useRef<string | null>(null);
  const interactionRequestRef = useRef(false);

  const inputRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const joystickRef = useRef<Vector2>({ x: 0, y: 0 });
  const joystickPointerRef = useRef<number | null>(null);

  const carRef = useRef({
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    heading: 0,
  });
  const cameraRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const targetZoomRef = useRef(1);

  const particlesRef = useRef<Particle[]>([]);
  const toastTimeoutRef = useRef<number | null>(null);

  const modalOpenRef = useRef(false);
  useEffect(() => {
    modalOpenRef.current = activeZoneId !== null;
    targetZoomRef.current = activeZoneId ? 1.12 : 1;
  }, [activeZoneId]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");

    const applyPreference = () => {
      setSystemReducedMotion(mediaQuery.matches);
    };

    const applyPointerType = () => {
      setIsTouchDevice(coarseQuery.matches);
    };

    applyPreference();
    applyPointerType();

    mediaQuery.addEventListener("change", applyPreference);
    coarseQuery.addEventListener("change", applyPointerType);

    return () => {
      mediaQuery.removeEventListener("change", applyPreference);
      coarseQuery.removeEventListener("change", applyPointerType);
    };
  }, []);

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
    particlesRef.current = createParticles(reducedMotion ? 48 : 110);
  }, [reducedMotion]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const trackable =
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright" ||
        key === "w" ||
        key === "a" ||
        key === "s" ||
        key === "d" ||
        key === "e" ||
        key === "escape";

      if (!trackable) {
        return;
      }

      event.preventDefault();

      if (key === "arrowup" || key === "w") {
        inputRef.current.up = true;
      } else if (key === "arrowdown" || key === "s") {
        inputRef.current.down = true;
      } else if (key === "arrowleft" || key === "a") {
        inputRef.current.left = true;
      } else if (key === "arrowright" || key === "d") {
        inputRef.current.right = true;
      } else if (key === "e") {
        interactionRequestRef.current = true;
      } else if (key === "escape") {
        setActiveZoneId(null);
      }
    };

    const up = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === "arrowup" || key === "w") {
        inputRef.current.up = false;
      } else if (key === "arrowdown" || key === "s") {
        inputRef.current.down = false;
      } else if (key === "arrowleft" || key === "a") {
        inputRef.current.left = false;
      } else if (key === "arrowright" || key === "d") {
        inputRef.current.right = false;
      }
    };

    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });

    if (!ctx) {
      return;
    }

    let frameId = 0;
    let lastTime = performance.now();
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = clamp(window.devicePixelRatio || 1, 1, 1.5);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = clamp(window.devicePixelRatio || 1, 1, 1.5);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const showToast = (message: string) => {
      setToast(message);

      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = window.setTimeout(() => {
        setToast(null);
      }, 1350);
    };

    const discoverZone = (zone: PortfolioZone) => {
      if (discoveredRef.current.has(zone.id)) {
        return;
      }

      discoveredRef.current.add(zone.id);
      setDiscovered(Array.from(discoveredRef.current));
      showToast(`XP +${XP_PER_ZONE}  ${zone.title}`);
    };

    const worldToScreen = (point: Vector2) => {
      return {
        x: (point.x - cameraRef.current.x) * zoomRef.current + width * 0.5,
        y: (point.y - cameraRef.current.y) * zoomRef.current + height * 0.5,
      };
    };

    const drawWorld = (seconds: number) => {
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      islands.forEach((island) => {
        const screen = worldToScreen(island);
        const radius = island.radius * zoomRef.current;

        if (
          screen.x + radius < -180 ||
          screen.x - radius > width + 180 ||
          screen.y + radius < -180 ||
          screen.y - radius > height + 180
        ) {
          return;
        }

        const gradient = ctx.createRadialGradient(
          screen.x,
          screen.y,
          radius * 0.12,
          screen.x,
          screen.y,
          radius,
        );

        gradient.addColorStop(0, island.tint);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!reducedMotion) {
        particlesRef.current.forEach((particle) => {
          const drifted = {
            x: particle.x + Math.sin(seconds * 0.2 + particle.phase) * particle.driftX,
            y: particle.y + Math.cos(seconds * 0.25 + particle.phase) * particle.driftY,
          };
          const screen = worldToScreen(drifted);

          if (
            screen.x < -20 ||
            screen.x > width + 20 ||
            screen.y < -20 ||
            screen.y > height + 20
          ) {
            return;
          }

          const pulse = 0.3 + 0.3 * Math.sin(seconds + particle.phase);
          ctx.globalAlpha = 0.08 + pulse * 0.18;
          ctx.fillStyle = "rgba(214, 230, 255, 0.95)";
          ctx.beginPath();
          ctx.arc(screen.x, screen.y, particle.size * zoomRef.current, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalAlpha = 1;
      }

      ctx.restore();
    };

    const drawZones = (seconds: number, activeZoneForFrame: string | null) => {
      zones.forEach((zone, index) => {
        const screen = worldToScreen(zone.position);
        const radius = zone.radius * zoomRef.current;

        if (
          screen.x + radius < -200 ||
          screen.x - radius > width + 200 ||
          screen.y + radius < -200 ||
          screen.y - radius > height + 200
        ) {
          return;
        }

        const pulse = reducedMotion
          ? 1
          : 0.92 + Math.sin(seconds * 1.8 + index * 0.7) * 0.08;
        const glowRadius = radius * (1.1 + pulse * 0.07);
        const glow = ctx.createRadialGradient(
          screen.x,
          screen.y,
          radius * 0.22,
          screen.x,
          screen.y,
          glowRadius,
        );
        glow.addColorStop(0, `${zone.accent}66`);
        glow.addColorStop(1, `${zone.accent}00`);

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        const discoveredZone = discoveredRef.current.has(zone.id);
        ctx.strokeStyle =
          zone.id === activeZoneForFrame
            ? `${zone.accent}`
            : discoveredZone
              ? `${zone.accent}bb`
              : `${zone.accent}8a`;
        ctx.lineWidth = zone.id === activeZoneForFrame ? 2.4 : 1.6;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius * (0.78 + pulse * 0.04), 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = zone.accent;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 5.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "600 13px Manrope";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(244, 241, 232, 0.9)";
        ctx.fillText(zone.title, screen.x, screen.y + radius + 22);

        if (zone.id === activeZoneForFrame && !modalOpenRef.current) {
          const hintWidth = 106;
          const hintHeight = 28;

          ctx.fillStyle = "rgba(8, 13, 23, 0.74)";
          drawRoundedRect(
            ctx,
            screen.x - hintWidth * 0.5,
            screen.y - radius - 46,
            hintWidth,
            hintHeight,
            13,
          );
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = 1;
          drawRoundedRect(
            ctx,
            screen.x - hintWidth * 0.5,
            screen.y - radius - 46,
            hintWidth,
            hintHeight,
            13,
          );
          ctx.stroke();

          ctx.font = "600 12px Manrope";
          ctx.fillStyle = "rgba(244, 241, 232, 0.95)";
          ctx.fillText("Press E", screen.x, screen.y - radius - 27);
        }
      });
    };

    const drawCar = () => {
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const heading = carRef.current.heading;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(heading);

      const headlight = ctx.createRadialGradient(16, 0, 6, 128, 0, 165);
      headlight.addColorStop(0, "rgba(207, 232, 255, 0.55)");
      headlight.addColorStop(1, "rgba(207, 232, 255, 0)");
      ctx.fillStyle = headlight;
      ctx.beginPath();
      ctx.moveTo(8, -18);
      ctx.quadraticCurveTo(132, 0, 8, 18);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = "rgba(8, 13, 20, 0.7)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "rgba(10, 18, 30, 0.82)";
      drawRoundedRect(ctx, -16, -9, 32, 18, 8);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "rgba(189, 218, 255, 0.8)";
      ctx.lineWidth = 1.2;
      drawRoundedRect(ctx, -16, -9, 32, 18, 8);
      ctx.stroke();

      ctx.fillStyle = "rgba(240, 249, 255, 0.95)";
      ctx.fillRect(7, -4, 6, 8);

      ctx.restore();
    };

    const tick = (time: number) => {
      const dt = Math.min(0.033, (time - lastTime) / 1000);
      lastTime = time;

      const car = carRef.current;
      const camera = cameraRef.current;

      const keyboardInput = {
        x: (inputRef.current.right ? 1 : 0) - (inputRef.current.left ? 1 : 0),
        y: (inputRef.current.down ? 1 : 0) - (inputRef.current.up ? 1 : 0),
      };

      const moveInput = {
        x: keyboardInput.x + joystickRef.current.x,
        y: keyboardInput.y + joystickRef.current.y,
      };

      const moveLength = length(moveInput);
      if (moveLength > 1) {
        moveInput.x /= moveLength;
        moveInput.y /= moveLength;
      }

      if (!modalOpenRef.current) {
        const acceleration = 1820;
        const drag = moveLength > 0.04 ? 1.18 : 2.45;
        const maxSpeed = 620;

        car.velocity.x += moveInput.x * acceleration * dt;
        car.velocity.y += moveInput.y * acceleration * dt;

        const damp = Math.exp(-drag * dt);
        car.velocity.x *= damp;
        car.velocity.y *= damp;

        const speed = length(car.velocity);
        if (speed > maxSpeed) {
          const ratio = maxSpeed / speed;
          car.velocity.x *= ratio;
          car.velocity.y *= ratio;
        }

        car.position.x += car.velocity.x * dt;
        car.position.y += car.velocity.y * dt;

        car.position.x = clamp(car.position.x, -WORLD_HALF + 70, WORLD_HALF - 70);
        car.position.y = clamp(car.position.y, -WORLD_HALF + 70, WORLD_HALF - 70);

        if (speed > 8) {
          const nextHeading = Math.atan2(car.velocity.y, car.velocity.x);
          const deltaHeading =
            Math.atan2(
              Math.sin(nextHeading - car.heading),
              Math.cos(nextHeading - car.heading),
            ) * 0.2;
          car.heading += deltaHeading;
        }
      } else {
        car.velocity.x *= Math.exp(-6.2 * dt);
        car.velocity.y *= Math.exp(-6.2 * dt);
      }

      const cameraSmoothing = reducedMotion ? 1 : 0.085;
      camera.x += (car.position.x - camera.x) * cameraSmoothing;
      camera.y += (car.position.y - camera.y) * cameraSmoothing;

      const zoomSmoothing = reducedMotion ? 1 : 0.08;
      zoomRef.current += (targetZoomRef.current - zoomRef.current) * zoomSmoothing;

      let nearest: PortfolioZone | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const zone of zones) {
        const dx = car.position.x - zone.position.x;
        const dy = car.position.y - zone.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= zone.radius) {
          discoverZone(zone);
        }

        if (distance < zone.radius + INTERACT_RANGE_PAD && distance < nearestDistance) {
          nearest = zone;
          nearestDistance = distance;
        }
      }

      const nextNearbyId = nearest?.id ?? null;
      if (nextNearbyId !== nearbyZoneRef.current) {
        nearbyZoneRef.current = nextNearbyId;
        setNearbyZoneId(nextNearbyId);
      }

      if (interactionRequestRef.current && !modalOpenRef.current && nearest) {
        setActiveZoneId(nearest.id);
      }

      interactionRequestRef.current = false;

      const seconds = time * 0.001;
      drawWorld(seconds);
      drawZones(seconds, nextNearbyId);
      drawCar();

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);

      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [reducedMotion]);

  const xpTotal = zones.length * XP_PER_ZONE;
  const xpValue = discovered.length * XP_PER_ZONE;
  const xpProgress = (xpValue / xpTotal) * 100;

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

  const interact = () => {
    if (!nearbyZone) {
      return;
    }

    setActiveZoneId(nearbyZone.id);
  };

  const resetJoystick = () => {
    joystickRef.current = { x: 0, y: 0 };
    joystickPointerRef.current = null;
    setJoystickKnob({ x: 0, y: 0 });
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    const pad = padRef.current;

    if (!pad) {
      return;
    }

    const rect = pad.getBoundingClientRect();
    const centerX = rect.left + rect.width * 0.5;
    const centerY = rect.top + rect.height * 0.5;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const radius = rect.width * 0.34;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, radius);
    const nx = dist > 0 ? dx / dist : 0;
    const ny = dist > 0 ? dy / dist : 0;

    joystickRef.current = {
      x: nx * (clampedDist / radius),
      y: ny * (clampedDist / radius),
    };

    setJoystickKnob({
      x: nx * clampedDist,
      y: ny * clampedDist,
    });
  };

  return (
    <div className="map-game-root">
      <AuroraFogBackground reducedMotion={reducedMotion} />

      <canvas ref={canvasRef} className="map-canvas" />
      <div className="map-vignette-overlay" />

      <header className="game-hud game-hud-top">
        <div className="hud-title-block">
          <p className="hud-title">SINAN - Portfolio Map</p>
          <p className="hud-subtitle">Interactive top-down portfolio</p>
        </div>

        <div className="hud-xp">
          <p className="hud-xp-label">
            XP {xpValue}/{xpTotal}
          </p>
          <div className="hud-xp-track">
            <div
              className="hud-xp-fill"
              style={{ width: `${xpProgress.toFixed(2)}%` }}
            />
          </div>
        </div>
      </header>

      <button
        className="motion-toggle map-motion-toggle"
        type="button"
        onClick={cycleMotionMode}
      >
        {motionLabel}
      </button>

      <div className="game-hud game-hud-bottom">
        <p className="hud-controls">
          {isTouchDevice
            ? "Touch joystick to drive - Interact to open - Esc to close"
            : "Left/Up/Right/Down or WASD to drive - E to interact - Esc to close"}
        </p>
      </div>

      {nearbyZone && !activeZone && (
        <div className="zone-prompt">
          <p>{nearbyZone.title}</p>
          <span>Press E to interact</span>
        </div>
      )}

      {toast && <div className="xp-toast">{toast}</div>}

      {activeZone && (
        <div className="zone-modal-backdrop" role="dialog" aria-modal="true">
          <article className="zone-modal">
            <button
              type="button"
              className="zone-modal-close"
              onClick={() => setActiveZoneId(null)}
              aria-label="Close"
            >
              x
            </button>

            <p className="zone-modal-subtitle">{activeZone.subtitle}</p>
            <h2>{activeZone.title}</h2>
            <p className="zone-modal-description">{activeZone.description}</p>

            <ul className="zone-tags">
              {activeZone.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>

            <div className="zone-links">
              {(["open", "demo", "github"] as const).map((kind) => {
                const url = activeZone.links[kind];
                const label = linkLabel(kind);

                if (!url) {
                  return (
                    <span key={kind} className="zone-link-button is-disabled">
                      {label} (placeholder)
                    </span>
                  );
                }

                return (
                  <a
                    key={kind}
                    href={url}
                    className="zone-link-button"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          </article>
        </div>
      )}

      {isTouchDevice && (
        <div className="touch-controls">
          <div
            ref={padRef}
            className="touch-pad"
            onPointerDown={(event) => {
              joystickPointerRef.current = event.pointerId;
              event.currentTarget.setPointerCapture(event.pointerId);
              updateJoystick(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => {
              if (joystickPointerRef.current !== event.pointerId) {
                return;
              }

              updateJoystick(event.clientX, event.clientY);
            }}
            onPointerUp={(event) => {
              if (joystickPointerRef.current !== event.pointerId) {
                return;
              }

              event.currentTarget.releasePointerCapture(event.pointerId);
              resetJoystick();
            }}
            onPointerCancel={() => resetJoystick()}
          >
            <div
              className="touch-knob"
              style={{
                transform: `translate(${joystickKnob.x.toFixed(1)}px, ${joystickKnob.y.toFixed(1)}px)`,
              }}
            />
          </div>

          <button
            type="button"
            className="touch-interact"
            onClick={() => {
              if (activeZone) {
                setActiveZoneId(null);
                return;
              }

              interact();
            }}
          >
            {activeZone ? "Close" : "Interact"}
          </button>
        </div>
      )}
    </div>
  );
}

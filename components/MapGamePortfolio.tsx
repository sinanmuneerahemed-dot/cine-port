"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Vector2 = {
  x: number;
  y: number;
};

type ZoneAction = {
  label: string;
  href: string;
  placeholder?: boolean;
};

type PortfolioZone = {
  id: string;
  title: string;
  impact: string;
  position: Vector2;
  radius: number;
  tags: string[];
  accent: string;
  actions: ZoneAction[];
};

type IslandBlob = {
  x: number;
  y: number;
  radius: number;
  tintA: string;
  tintB: string;
  seed: number;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftY: number;
  alpha: number;
};

type ToastState = {
  id: number;
  message: string;
};

type MapGamePortfolioProps = {
  reducedMotion: boolean;
  motionLabel: string;
  onCycleMotion: () => void;
};

const WORLD_HALF = 3000;
const WORLD_SIZE = WORLD_HALF * 2;
const XP_PER_ZONE = 20;
const INTERACT_PAD = 80;
const MAX_SPEED = 680;
const BASE_ZOOM = 1;

const zones: PortfolioZone[] = [
  {
    id: "home",
    title: "SINAN",
    impact: "Home spawn where concepts turn into systems and launch-ready experiences.",
    position: { x: 0, y: 0 },
    radius: 230,
    tags: ["Home", "Spawn", "Portfolio Map"],
    accent: "#84bff4",
    actions: [
      { label: "Demo", href: "https://cine-port.vercel.app" },
      {
        label: "GitHub",
        href: "https://github.com/sinanmuneerahemed-dot/cine-port",
      },
      { label: "Contact", href: "mailto:hello@sinan.dev" },
    ],
  },
  {
    id: "becoming",
    title: "BECOMING",
    impact:
      "A reflection system that turns daily check-ins into behavioral insight.",
    position: { x: -1380, y: -860 },
    radius: 220,
    tags: ["Next.js", "Firebase", "UI Systems"],
    accent: "#9f95db",
    actions: [],
  },
  {
    id: "cinematic-websites",
    title: "CINEMATIC WEBSITES",
    impact: "Scroll-driven storytelling websites with high-performance motion.",
    position: { x: 1540, y: -520 },
    radius: 230,
    tags: ["Motion", "GSAP/Scroll", "Interaction"],
    accent: "#79d2c2",
    actions: [
      { label: "Demo", href: "https://cine-port.vercel.app" },
      {
        label: "GitHub",
        href: "https://github.com/sinanmuneerahemed-dot/cine-port",
      },
      { label: "Contact", href: "mailto:hello@sinan.dev" },
    ],
  },
  {
    id: "design-posters",
    title: "DESIGN / POSTERS",
    impact:
      "Visual identity + posters + UI composition with restraint.",
    position: { x: -940, y: 1350 },
    radius: 220,
    tags: ["Design", "Typography", "Layout"],
    accent: "#8fbcf0",
    actions: [],
  },
  {
    id: "contact",
    title: "CONTACT / HIRE ME",
    impact: "Open to collaborations and freelance builds.",
    position: { x: 1480, y: 1440 },
    radius: 236,
    tags: ["Freelance", "Collaboration", "Advisory"],
    accent: "#84d2ba",
    actions: [
      { label: "Email", href: "mailto:hello@sinan.dev" },
      {
        label: "WhatsApp",
        href: "https://wa.me/0000000000",
        placeholder: true,
      },
    ],
  },
];

const islands: IslandBlob[] = [
  {
    x: -1900,
    y: -1500,
    radius: 750,
    tintA: "rgba(132, 170, 220, 0.08)",
    tintB: "rgba(124, 169, 216, 0.02)",
    seed: 0.8,
  },
  {
    x: -1020,
    y: -1120,
    radius: 610,
    tintA: "rgba(145, 136, 202, 0.08)",
    tintB: "rgba(145, 136, 202, 0.02)",
    seed: 1.3,
  },
  {
    x: -240,
    y: -980,
    radius: 700,
    tintA: "rgba(122, 170, 218, 0.07)",
    tintB: "rgba(122, 170, 218, 0.02)",
    seed: 2.1,
  },
  {
    x: 860,
    y: -1180,
    radius: 760,
    tintA: "rgba(129, 131, 196, 0.08)",
    tintB: "rgba(129, 131, 196, 0.02)",
    seed: 2.7,
  },
  {
    x: 1860,
    y: -880,
    radius: 710,
    tintA: "rgba(124, 192, 180, 0.08)",
    tintB: "rgba(124, 192, 180, 0.02)",
    seed: 3.2,
  },
  {
    x: -1780,
    y: 280,
    radius: 780,
    tintA: "rgba(125, 160, 205, 0.08)",
    tintB: "rgba(125, 160, 205, 0.02)",
    seed: 3.9,
  },
  {
    x: -360,
    y: 420,
    radius: 960,
    tintA: "rgba(135, 151, 206, 0.08)",
    tintB: "rgba(135, 151, 206, 0.02)",
    seed: 4.5,
  },
  {
    x: 1020,
    y: 340,
    radius: 860,
    tintA: "rgba(130, 196, 181, 0.08)",
    tintB: "rgba(130, 196, 181, 0.02)",
    seed: 5.1,
  },
  {
    x: 2040,
    y: 520,
    radius: 740,
    tintA: "rgba(132, 170, 210, 0.08)",
    tintB: "rgba(132, 170, 210, 0.02)",
    seed: 5.8,
  },
  {
    x: -1220,
    y: 1760,
    radius: 700,
    tintA: "rgba(125, 182, 182, 0.08)",
    tintB: "rgba(125, 182, 182, 0.02)",
    seed: 6.1,
  },
  {
    x: 340,
    y: 1920,
    radius: 900,
    tintA: "rgba(139, 137, 198, 0.08)",
    tintB: "rgba(139, 137, 198, 0.02)",
    seed: 6.7,
  },
  {
    x: 1820,
    y: 1760,
    radius: 740,
    tintA: "rgba(126, 182, 170, 0.08)",
    tintB: "rgba(126, 182, 170, 0.02)",
    seed: 7.2,
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function vecLength(v: Vector2) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function angleLerp(current: number, target: number, t: number) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * t;
}

function createParticles(count: number): Particle[] {
  const list: Particle[] = [];

  for (let i = 0; i < count; i += 1) {
    list.push({
      x: Math.random() * WORLD_SIZE - WORLD_HALF,
      y: Math.random() * WORLD_SIZE - WORLD_HALF,
      size: 0.7 + Math.random() * 1.35,
      driftX: (Math.random() - 0.5) * 7,
      driftY: (Math.random() - 0.5) * 7,
      alpha: 0.04 + Math.random() * 0.08,
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

function drawSoftBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  seed: number,
  tintA: string,
  tintB: string,
  seconds: number,
  reducedMotion: boolean,
) {
  const points = 9;
  const wobble = reducedMotion ? 0 : Math.sin(seconds * 0.09 + seed) * 0.035;

  const verts: Vector2[] = [];

  for (let i = 0; i < points; i += 1) {
    const angle = (i / points) * Math.PI * 2;
    const noise =
      0.78 +
      0.17 * Math.sin(angle * 2 + seed * 1.3) +
      0.07 * Math.cos(angle * 3.4 + seed * 0.7) +
      wobble;

    const r = radius * noise;
    verts.push({ x: x + Math.cos(angle) * r, y: y + Math.sin(angle) * r });
  }

  const gradient = ctx.createRadialGradient(x, y, radius * 0.08, x, y, radius);
  gradient.addColorStop(0, tintA);
  gradient.addColorStop(1, tintB);

  ctx.fillStyle = gradient;
  ctx.beginPath();

  for (let i = 0; i < points; i += 1) {
    const current = verts[i];
    const next = verts[(i + 1) % points];
    const midX = (current.x + next.x) * 0.5;
    const midY = (current.y + next.y) * 0.5;

    if (i === 0) {
      ctx.moveTo(midX, midY);
    } else {
      ctx.quadraticCurveTo(current.x, current.y, midX, midY);
    }
  }

  const first = verts[0];
  const last = verts[points - 1];
  ctx.quadraticCurveTo(last.x, last.y, (last.x + first.x) * 0.5, (last.y + first.y) * 0.5);
  ctx.closePath();
  ctx.fill();
}

export default function MapGamePortfolio({
  reducedMotion,
  motionLabel,
  onCycleMotion,
}: MapGamePortfolioProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<HTMLDivElement | null>(null);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [nearbyZoneId, setNearbyZoneId] = useState<string | null>(null);
  const [modalZoneId, setModalZoneId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [joystickKnob, setJoystickKnob] = useState<Vector2>({ x: 0, y: 0 });

  const nearbyZone = useMemo(
    () => zones.find((zone) => zone.id === nearbyZoneId) ?? null,
    [nearbyZoneId],
  );

  const modalZone = useMemo(
    () => zones.find((zone) => zone.id === modalZoneId) ?? null,
    [modalZoneId],
  );

  const discoveredRef = useRef<Set<string>>(new Set());
  const nearbyZoneRef = useRef<string | null>(null);
  const completionShownRef = useRef(false);
  const interactionRequestRef = useRef(false);

  const closeTimeoutRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const toastCounterRef = useRef(0);

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
    tilt: 0,
  });
  const cameraRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(BASE_ZOOM);

  const particlesRef = useRef<Particle[]>([]);
  const modalOpenRef = useRef(false);

  useEffect(() => {
    modalOpenRef.current = modalZoneId !== null;
  }, [modalZoneId]);

  useEffect(() => {
    const coarseQuery = window.matchMedia("(pointer: coarse)");

    const applyPointer = () => {
      setIsTouchDevice(coarseQuery.matches);
    };

    applyPointer();
    coarseQuery.addEventListener("change", applyPointer);

    return () => {
      coarseQuery.removeEventListener("change", applyPointer);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    particlesRef.current = createParticles(reducedMotion ? 36 : 84);
  }, [reducedMotion]);

  const pushToast = (message: string) => {
    toastCounterRef.current += 1;
    setToast({
      id: toastCounterRef.current,
      message,
    });

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 1500);
  };

  const openModal = (zoneId: string) => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    setModalZoneId(zoneId);
    window.requestAnimationFrame(() => {
      setIsModalOpen(true);
    });
  };

  const closeModal = () => {
    if (!modalZoneId) {
      return;
    }

    setIsModalOpen(false);

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setModalZoneId(null);
    }, 260);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      const tracked =
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

      if (!tracked) {
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
        setIsModalOpen(false);

        if (closeTimeoutRef.current) {
          window.clearTimeout(closeTimeoutRef.current);
        }

        closeTimeoutRef.current = window.setTimeout(() => {
          setModalZoneId(null);
        }, 260);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
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

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
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
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = clamp(window.devicePixelRatio || 1, 1, 1.5);
    let lastTime = performance.now();

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

    const worldToScreen = (position: Vector2) => {
      return {
        x: (position.x - cameraRef.current.x) * zoomRef.current + width * 0.5,
        y: (position.y - cameraRef.current.y) * zoomRef.current + height * 0.5,
      };
    };

    const discoverZone = (zone: PortfolioZone) => {
      if (discoveredRef.current.has(zone.id)) {
        return;
      }

      discoveredRef.current.add(zone.id);
      const discoveredSize = discoveredRef.current.size;
      setDiscoveredCount(discoveredSize);
      pushToast(`+${XP_PER_ZONE} XP • ${zone.title} discovered`);

      if (discoveredSize === zones.length && !completionShownRef.current) {
        completionShownRef.current = true;
        window.setTimeout(() => {
          pushToast("Map completed ✓");
        }, 420);
      }
    };

    const drawWorld = (seconds: number) => {
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      islands.forEach((island) => {
        const screen = worldToScreen({ x: island.x, y: island.y });
        const radius = island.radius * zoomRef.current;

        if (
          screen.x + radius < -240 ||
          screen.x - radius > width + 240 ||
          screen.y + radius < -240 ||
          screen.y - radius > height + 240
        ) {
          return;
        }

        drawSoftBlob(
          ctx,
          screen.x,
          screen.y,
          radius,
          island.seed,
          island.tintA,
          island.tintB,
          seconds,
          reducedMotion,
        );
      });

      const homeZone = zones[0];
      const homeScreen = worldToScreen(homeZone.position);
      const homeAuraRadius = homeZone.radius * zoomRef.current * 1.9;
      const homePulse = reducedMotion ? 1 : 0.92 + Math.sin(seconds * 1.4) * 0.08;
      const homeGlow = ctx.createRadialGradient(
        homeScreen.x,
        homeScreen.y,
        homeAuraRadius * 0.1,
        homeScreen.x,
        homeScreen.y,
        homeAuraRadius * homePulse,
      );
      homeGlow.addColorStop(0, "rgba(140, 190, 246, 0.22)");
      homeGlow.addColorStop(1, "rgba(140, 190, 246, 0)");
      ctx.fillStyle = homeGlow;
      ctx.beginPath();
      ctx.arc(homeScreen.x, homeScreen.y, homeAuraRadius * homePulse, 0, Math.PI * 2);
      ctx.fill();

      particlesRef.current.forEach((particle) => {
        particle.x += particle.driftX * (reducedMotion ? 0.08 : 0.16);
        particle.y += particle.driftY * (reducedMotion ? 0.08 : 0.16);

        if (particle.x < -WORLD_HALF) {
          particle.x += WORLD_SIZE;
        } else if (particle.x > WORLD_HALF) {
          particle.x -= WORLD_SIZE;
        }

        if (particle.y < -WORLD_HALF) {
          particle.y += WORLD_SIZE;
        } else if (particle.y > WORLD_HALF) {
          particle.y -= WORLD_SIZE;
        }

        const screen = worldToScreen({ x: particle.x, y: particle.y });

        if (
          screen.x < -18 ||
          screen.x > width + 18 ||
          screen.y < -18 ||
          screen.y > height + 18
        ) {
          return;
        }

        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = "rgba(220, 233, 255, 0.95)";
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, particle.size * zoomRef.current, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      ctx.restore();
    };

    const drawZones = (seconds: number, nearestId: string | null, carPos: Vector2) => {
      zones.forEach((zone, index) => {
        const screen = worldToScreen(zone.position);
        const radius = zone.radius * zoomRef.current;
        const dx = carPos.x - zone.position.x;
        const dy = carPos.y - zone.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

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
          : 0.94 + Math.sin(seconds * 1.6 + index * 0.6) * 0.06;
        const glowRadius = radius * (1.1 + pulse * 0.08);

        const glow = ctx.createRadialGradient(
          screen.x,
          screen.y,
          radius * 0.18,
          screen.x,
          screen.y,
          glowRadius,
        );
        glow.addColorStop(0, `${zone.accent}62`);
        glow.addColorStop(1, `${zone.accent}00`);

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `${zone.accent}${zone.id === nearestId ? "f0" : "9f"}`;
        ctx.lineWidth = zone.id === nearestId ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius * (0.8 + pulse * 0.05), 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = zone.accent;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 5, 0, Math.PI * 2);
        ctx.fill();

        const labelAlpha = clamp(1 - (distance - zone.radius) / 850, 0.06, 1);
        const floatY = reducedMotion ? 0 : Math.sin(seconds * 1.4 + index * 0.8) * 4;

        ctx.globalAlpha = labelAlpha;
        ctx.font = "600 13px Manrope";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(244, 241, 232, 0.95)";
        ctx.fillText(zone.title, screen.x, screen.y + radius + 22 + floatY);
        ctx.globalAlpha = 1;

        if (zone.id === nearestId && !modalOpenRef.current) {
          const hintWidth = 106;
          const hintHeight = 29;
          const hintY = screen.y - radius - 44;

          ctx.fillStyle = "rgba(8, 13, 23, 0.74)";
          drawRoundedRect(
            ctx,
            screen.x - hintWidth * 0.5,
            hintY,
            hintWidth,
            hintHeight,
            13,
          );
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
          ctx.lineWidth = 1;
          drawRoundedRect(
            ctx,
            screen.x - hintWidth * 0.5,
            hintY,
            hintWidth,
            hintHeight,
            13,
          );
          ctx.stroke();

          ctx.font = "600 12px Manrope";
          ctx.fillStyle = "rgba(244, 241, 232, 0.96)";
          ctx.fillText("Press E", screen.x, hintY + 19);
        }
      });
    };

    const drawCar = () => {
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const heading = carRef.current.heading;
      const tilt = carRef.current.tilt;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(heading + tilt);

      const headlight = ctx.createRadialGradient(18, 0, 7, 140, 0, 188);
      headlight.addColorStop(0, "rgba(205, 232, 255, 0.52)");
      headlight.addColorStop(1, "rgba(205, 232, 255, 0)");
      ctx.fillStyle = headlight;
      ctx.beginPath();
      ctx.moveTo(10, -20);
      ctx.quadraticCurveTo(152, 0, 10, 20);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = "rgba(6, 12, 20, 0.78)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "rgba(9, 18, 31, 0.84)";
      drawRoundedRect(ctx, -18, -9.2, 36, 18.4, 8.5);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "rgba(183, 214, 252, 0.78)";
      ctx.lineWidth = 1.2;
      drawRoundedRect(ctx, -18, -9.2, 36, 18.4, 8.5);
      ctx.stroke();

      ctx.fillStyle = "rgba(239, 248, 255, 0.95)";
      ctx.fillRect(8, -4.2, 6.8, 8.4);

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

      const input = {
        x: keyboardInput.x + joystickRef.current.x,
        y: keyboardInput.y + joystickRef.current.y,
      };
      const inputLen = vecLength(input);
      if (inputLen > 1) {
        input.x /= inputLen;
        input.y /= inputLen;
      }

      const modalActive = modalOpenRef.current;

      if (!modalActive) {
        const acceleration = 2300;
        car.velocity.x += input.x * acceleration * dt;
        car.velocity.y += input.y * acceleration * dt;

        const baseFriction = inputLen > 0.03 ? 1.45 : 2.55;
        const damp = Math.exp(-baseFriction * dt);
        car.velocity.x *= damp;
        car.velocity.y *= damp;

        const speed = vecLength(car.velocity);
        if (speed > MAX_SPEED) {
          const ratio = MAX_SPEED / speed;
          car.velocity.x *= ratio;
          car.velocity.y *= ratio;
        }

        const currentSpeed = vecLength(car.velocity);

        if (currentSpeed > 8) {
          const targetHeading = Math.atan2(car.velocity.y, car.velocity.x);
          car.heading = angleLerp(car.heading, targetHeading, clamp(dt * 8.2, 0, 1));
        } else if (inputLen > 0.2) {
          const targetHeading = Math.atan2(input.y, input.x);
          car.heading = angleLerp(car.heading, targetHeading, clamp(dt * 5.8, 0, 1));
        }

        const forward = { x: Math.cos(car.heading), y: Math.sin(car.heading) };
        const side = { x: -forward.y, y: forward.x };
        const sideSpeed = car.velocity.x * side.x + car.velocity.y * side.y;
        const sideDamp = Math.exp(-(reducedMotion ? 8 : 5.6) * dt);
        const sideKept = sideSpeed * sideDamp;
        const forwardSpeed = car.velocity.x * forward.x + car.velocity.y * forward.y;

        car.velocity.x = forward.x * forwardSpeed + side.x * sideKept;
        car.velocity.y = forward.y * forwardSpeed + side.y * sideKept;

        const tiltTarget = clamp(-sideKept / MAX_SPEED, -0.25, 0.25);
        car.tilt += (tiltTarget - car.tilt) * clamp(dt * 7, 0, 1);

        car.position.x += car.velocity.x * dt;
        car.position.y += car.velocity.y * dt;

        car.position.x = clamp(car.position.x, -WORLD_HALF + 80, WORLD_HALF - 80);
        car.position.y = clamp(car.position.y, -WORLD_HALF + 80, WORLD_HALF - 80);
      } else {
        car.velocity.x *= Math.exp(-7 * dt);
        car.velocity.y *= Math.exp(-7 * dt);
        car.tilt += (0 - car.tilt) * clamp(dt * 8, 0, 1);
      }

      const speedNorm = clamp(vecLength(car.velocity) / MAX_SPEED, 0, 1);
      const lookAhead = (reducedMotion ? 42 : 128) * speedNorm;
      const lookVectorLen = vecLength(car.velocity);
      const lookDir =
        lookVectorLen > 0.01
          ? {
              x: car.velocity.x / lookVectorLen,
              y: car.velocity.y / lookVectorLen,
            }
          : { x: 0, y: 0 };

      const cameraTarget = {
        x: car.position.x + lookDir.x * lookAhead,
        y: car.position.y + lookDir.y * lookAhead,
      };

      if (!modalActive) {
        const follow = reducedMotion ? 0.16 : 0.1;
        camera.x += (cameraTarget.x - camera.x) * follow;
        camera.y += (cameraTarget.y - camera.y) * follow;
      }

      const zoomTarget =
        BASE_ZOOM +
        speedNorm * (reducedMotion ? 0.018 : 0.05) +
        (modalActive ? (reducedMotion ? 0.02 : 0.04) : 0);
      zoomRef.current += (zoomTarget - zoomRef.current) * (reducedMotion ? 0.2 : 0.08);

      let nearest: PortfolioZone | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const zone of zones) {
        const dx = car.position.x - zone.position.x;
        const dy = car.position.y - zone.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= zone.radius) {
          discoverZone(zone);
        }

        if (distance < zone.radius + INTERACT_PAD && distance < nearestDistance) {
          nearest = zone;
          nearestDistance = distance;
        }
      }

      const nextNearbyId = nearest?.id ?? null;
      if (nextNearbyId !== nearbyZoneRef.current) {
        nearbyZoneRef.current = nextNearbyId;
        setNearbyZoneId(nextNearbyId);
      }

      if (interactionRequestRef.current && nearest && !modalActive) {
        openModal(nearest.id);
      }
      interactionRequestRef.current = false;

      const seconds = time * 0.001;
      drawWorld(seconds);
      drawZones(seconds, nextNearbyId, car.position);
      drawCar();

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const xpTotal = zones.length * XP_PER_ZONE;
  const xpValue = discoveredCount * XP_PER_ZONE;
  const xpPercent = (xpValue / xpTotal) * 100;

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
    const radius = rect.width * 0.35;
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
      <canvas ref={canvasRef} className="map-canvas" />
      <div className="map-vignette-overlay" />

      <header className="game-hud game-hud-top">
        <div className="hud-title-block">
          <p className="hud-title">SINAN - Portfolio Map</p>
          <p className="hud-subtitle">Drive to discover systems and projects</p>
        </div>

        <div className="hud-xp">
          <p className="hud-xp-label">
            XP {xpValue}/{xpTotal}
          </p>
          <div className="hud-xp-track">
            <div className="hud-xp-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </header>

      <button
        className="motion-toggle map-motion-toggle"
        type="button"
        onClick={onCycleMotion}
      >
        {motionLabel}
      </button>

      <footer className="game-hud game-hud-bottom">
        <p className="hud-controls">
          {isTouchDevice
            ? "Use joystick to drive • Tap Interact to open • Esc to close"
            : "Left/Up/Right/Down or WASD to drive • E to interact • Esc to close"}
        </p>
      </footer>

      {nearbyZone && !modalZone && (
        <div className="zone-prompt">
          <p>{nearbyZone.title}</p>
          <span>Press E</span>
        </div>
      )}

      {toast && (
        <div key={toast.id} className="xp-toast">
          {toast.message}
        </div>
      )}

      {modalZone && (
        <div
          className={`zone-modal-backdrop ${isModalOpen ? "is-open" : ""}`}
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <article
            className={`zone-modal ${isModalOpen ? "is-open" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="zone-modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              x
            </button>

            <h2>{modalZone.title}</h2>
            <p className="zone-modal-impact">{modalZone.impact}</p>

            <ul className="zone-tags">
              {modalZone.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>

            <div className="zone-links">
              {modalZone.actions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className={`zone-link-button ${action.placeholder ? "is-placeholder" : ""}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {action.placeholder ? `${action.label} (placeholder)` : action.label}
                </a>
              ))}
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
            onPointerCancel={resetJoystick}
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
              if (modalZone) {
                closeModal();
                return;
              }

              if (nearbyZone) {
                openModal(nearbyZone.id);
              }
            }}
          >
            {modalZone ? "Close" : "E / Interact"}
          </button>
        </div>
      )}
    </div>
  );
}

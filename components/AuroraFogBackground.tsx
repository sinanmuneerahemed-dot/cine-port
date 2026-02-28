"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type AuroraFogBackgroundProps = {
  reducedMotion: boolean;
};

function AuroraPlane({ reducedMotion }: AuroraFogBackgroundProps) {
  const { size, viewport } = useThree();

  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const hiddenRef = useRef(false);
  const timeRef = useRef(0);
  const progressRef = useRef(0);
  const intensityRef = useRef(0);
  const targetIntensityRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);

  const lowPower = useMemo(() => {
    if (typeof navigator === "undefined" || typeof window === "undefined") {
      return false;
    }

    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 8;
    const memory = nav.deviceMemory ?? 8;
    const touch = window.matchMedia("(pointer: coarse)").matches;

    return touch || cores <= 4 || memory <= 4;
  }, []);

  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uIntensity: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uLowPower: { value: 0 },
      uReducedMotion: { value: 0 },
    }),
    [],
  );

  useEffect(() => {
    const material = materialRef.current;

    if (!material) {
      return;
    }

    material.uniforms.uResolution.value.set(size.width, size.height);
  }, [size.height, size.width]);

  useEffect(() => {
    const material = materialRef.current;

    if (material) {
      material.uniforms.uReducedMotion.value = reducedMotion ? 1 : 0;
      material.uniforms.uLowPower.value = lowPower ? 1 : 0;
    }

    if (reducedMotion) {
      intensityRef.current = 0;
      targetIntensityRef.current = 0;
    }
  }, [lowPower, reducedMotion]);

  useEffect(() => {
    const handleVisibility = () => {
      hiddenRef.current = document.hidden;
    };

    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const updateScrollMetrics = () => {
      const now = performance.now();
      const y = window.scrollY || window.pageYOffset;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );

      progressRef.current = THREE.MathUtils.clamp(y / maxScroll, 0, 1);

      if (lastTRef.current === 0) {
        lastTRef.current = now;
        lastYRef.current = y;
        return;
      }

      const deltaT = Math.max(16, now - lastTRef.current);
      const deltaY = y - lastYRef.current;
      const speed = Math.abs(deltaY / deltaT);
      const speedBoost = THREE.MathUtils.clamp(speed * 0.9, 0, 1);

      targetIntensityRef.current = Math.max(
        targetIntensityRef.current * 0.4,
        speedBoost,
      );

      lastYRef.current = y;
      lastTRef.current = now;
    };

    updateScrollMetrics();
    window.addEventListener("scroll", updateScrollMetrics, { passive: true });
    window.addEventListener("resize", updateScrollMetrics);

    return () => {
      window.removeEventListener("scroll", updateScrollMetrics);
      window.removeEventListener("resize", updateScrollMetrics);
    };
  }, []);

  useFrame((_, delta) => {
    const material = materialRef.current;

    if (!material) {
      return;
    }

    const frameDelta = hiddenRef.current ? 0 : Math.min(delta, 0.05);
    const smoothDelta = frameDelta || 0.016;

    if (!reducedMotion) {
      timeRef.current += frameDelta;
    }

    intensityRef.current = THREE.MathUtils.damp(
      intensityRef.current,
      targetIntensityRef.current,
      4.6,
      smoothDelta,
    );

    targetIntensityRef.current = THREE.MathUtils.damp(
      targetIntensityRef.current,
      0,
      3.1,
      smoothDelta,
    );

    material.uniforms.uTime.value = reducedMotion ? 0 : timeRef.current;
    material.uniforms.uScroll.value = progressRef.current;
    material.uniforms.uIntensity.value = reducedMotion
      ? 0
      : intensityRef.current * (lowPower ? 0.35 : 0.75);
    material.uniforms.uLowPower.value = lowPower ? 1 : 0;
    material.uniforms.uReducedMotion.value = reducedMotion ? 1 : 0;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={initialUniforms}
        transparent={false}
        depthWrite={false}
        depthTest={false}
        vertexShader={`
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          precision highp float;

          uniform float uTime;
          uniform float uScroll;
          uniform float uIntensity;
          uniform vec2 uResolution;
          uniform float uLowPower;
          uniform float uReducedMotion;

          varying vec2 vUv;

          float hash(vec2 p) {
            p = fract(p * vec2(123.34, 345.45));
            p += dot(p, p + 34.345);
            return fract(p.x * p.y);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);

            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
          }

          float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            mat2 m = mat2(1.6, 1.2, -1.2, 1.6);

            for (int i = 0; i < 4; i++) {
              if (uLowPower > 0.5 && i > 1) {
                continue;
              }

              value += amplitude * noise(p);
              p = m * p + vec2(2.4, 1.7);
              amplitude *= 0.5;
            }

            return value;
          }

          float ribbon(vec2 p, float offset, float thickness) {
            float line = abs(p.y + offset);
            return 1.0 - smoothstep(thickness * 0.1, thickness, line);
          }

          void main() {
            vec2 p = vUv - 0.5;
            p.x *= uResolution.x / max(uResolution.y, 1.0);

            float timeFlow = uTime * 0.07;
            float breath = 0.55 + 0.45 * sin(uTime * 0.32);
            float scrollDepth = smoothstep(0.08, 0.9, uScroll);

            vec3 deepA = vec3(0.015, 0.027, 0.055);
            vec3 deepB = vec3(0.021, 0.038, 0.078);
            vec3 base = mix(deepA, deepB, smoothstep(-0.45, 0.72, p.y));

            vec3 hueBlue = vec3(0.16, 0.28, 0.44);
            vec3 hueViolet = vec3(0.22, 0.19, 0.35);
            vec3 hueTeal = vec3(0.14, 0.36, 0.34);

            vec3 auroraHue = mix(hueBlue, hueViolet, smoothstep(0.26, 0.62, uScroll));
            auroraHue = mix(auroraHue, hueTeal, smoothstep(0.62, 0.98, uScroll));

            float flowA = fbm(vec2(p.x * 1.25 + timeFlow * 0.8, p.y * 1.05 - timeFlow * 0.35));
            float flowB = fbm(vec2(p.x * 0.95 - timeFlow * 0.6, p.y * 1.4 + timeFlow * 0.25 + 9.2));

            float waveA = sin((p.x * 2.2) + flowA * 3.2 + timeFlow * 5.0) * 0.16;
            float waveB = sin((p.x * 1.6) - flowB * 2.8 - timeFlow * 4.2) * 0.14;

            float bandA = ribbon(p, waveA - 0.05, 0.46);
            float bandB = ribbon(p, waveB + 0.22, 0.52) * 0.78;
            float bandMix = max(bandA, bandB);

            float contrastGate = mix(0.16, 0.45, scrollDepth);
            float aurora = smoothstep(contrastGate, 0.9, bandMix);
            aurora *= 0.65 + breath * 0.35;
            aurora *= 1.0 + uIntensity * 1.35;

            float fogNoise = fbm(p * 2.0 + vec2(timeFlow * 0.4, -timeFlow * 0.25));
            float fog = exp(-length(p * vec2(1.0, 1.35)) * 2.3);
            fog *= mix(0.23, 0.42, fogNoise);

            float glow = smoothstep(0.2, 1.0, aurora) * (0.12 + 0.28 * scrollDepth + 0.2 * uIntensity);

            vec3 color = base;
            color += auroraHue * aurora * (0.42 + 0.45 * scrollDepth);
            color += mix(vec3(0.035, 0.05, 0.09), auroraHue, 0.35) * fog;
            color += auroraHue * glow * 0.55;

            if (uReducedMotion > 0.5) {
              float staticFog = fbm(p * 1.8 + vec2(2.0, 1.0));
              color = base + auroraHue * (0.09 + 0.08 * staticFog) + vec3(0.02, 0.03, 0.04) * fog;
            }

            color = clamp(color, 0.0, 1.0);
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export default function AuroraFogBackground({
  reducedMotion,
}: AuroraFogBackgroundProps) {
  return (
    <div className="aurora-stage" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
        orthographic
      >
        <AuroraPlane reducedMotion={reducedMotion} />
      </Canvas>
      <div className="vignette-overlay" />
    </div>
  );
}

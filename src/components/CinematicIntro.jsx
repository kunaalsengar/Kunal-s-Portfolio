import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useProfile } from '../context/ProfileContext';
import ProfileSelector from './ProfileSelector';
import portraitImg from '../assets/Portfolio/IMG_2399.jpg';
import '../styles/CinematicIntro.css';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FINE_HOVER_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

// Deterministic PRNG for organic, non-repeating celestial distributions across prime-sized viewport layers
function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSvgStarfieldStyle({ seed, tileW, tileH, layers = [], brightCount = 0 }) {
  const rand = createSeededRandom(seed);
  const shapes = [];

  if (brightCount > 0) {
    shapes.push(
      '<defs><radialGradient id="bs"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.96"/><stop offset="32%" stop-color="#e8eef8" stop-opacity="0.42"/><stop offset="68%" stop-color="#cbd5e1" stop-opacity="0.1"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>'
    );
  }

  layers.forEach(({ count, minR, maxR, minAlpha, maxAlpha }) => {
    for (let i = 0; i < count; i += 1) {
      const cx = (rand() * (tileW - 12) + 6).toFixed(1);
      const cy = (rand() * (tileH - 12) + 6).toFixed(1);
      const r = (minR + rand() * (maxR - minR)).toFixed(2);
      const alpha = (minAlpha + rand() * (maxAlpha - minAlpha)).toFixed(2);
      const tintRoll = rand();
      const fill =
        tintRoll < 0.25 ? '#d8e0ec' : tintRoll < 0.6 ? '#eef2f9' : '#ffffff';

      shapes.push(
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" fill-opacity="${alpha}"/>`
      );
    }
  });

  for (let i = 0; i < brightCount; i += 1) {
    const cx = (rand() * (tileW - 64) + 32).toFixed(1);
    const cy = (rand() * (tileH - 64) + 32).toFixed(1);
    const haloR = (2.3 + rand() * 0.9).toFixed(2);
    const coreR = (0.85 + rand() * 0.22).toFixed(2);
    shapes.push(
      `<circle cx="${cx}" cy="${cy}" r="${haloR}" fill="url(#bs)"/>`,
      `<circle cx="${cx}" cy="${cy}" r="${coreR}" fill="#ffffff" fill-opacity="0.96"/>`
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileW}" height="${tileH}" viewBox="0 0 ${tileW} ${tileH}">${shapes.join('')}</svg>`;

  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundSize: `${tileW}px ${tileH}px`,
  };
}

function buildDustLayerStyle({ seed, tileW, tileH, moteCount = 14, cloudCount = 10 }) {
  const rand = createSeededRandom(seed);
  const gradients = [];

  for (let i = 0; i < moteCount; i += 1) {
    const x = (rand() * 94 + 3).toFixed(2);
    const y = (rand() * 94 + 3).toFixed(2);
    const size = (1.2 + rand() * 0.75).toFixed(2);
    const alpha = (0.18 + rand() * 0.2).toFixed(2);
    const fillRgb = rand() < 0.35 ? '216, 224, 238' : '255, 255, 255';
    gradients.push(
      `radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(${fillRgb}, ${alpha}) 0%, transparent 72%)`
    );
  }

  for (let i = 0; i < cloudCount; i += 1) {
    const x = (rand() * 88 + 6).toFixed(1);
    const y = (rand() * 88 + 6).toFixed(1);
    const w = Math.round(240 + rand() * 180);
    const h = Math.round(160 + rand() * 150);
    const isSilver = rand() < 0.6;
    const rgba = isSilver ? 'rgba(210, 222, 238, 0.022)' : 'rgba(255, 255, 255, 0.015)';
    gradients.push(
      `radial-gradient(${w}px ${h}px at ${x}% ${y}%, ${rgba} 0%, transparent 76%)`
    );
  }

  return {
    backgroundImage: gradients.join(', '),
    backgroundSize: `${tileW}px ${tileH}px`,
  };
}

const STAR_LAYER_STYLES = Object.freeze({
  distantA: buildSvgStarfieldStyle({
    seed: 104729,
    tileW: 1597,
    tileH: 997,
    layers: [{ count: 122, minR: 0.42, maxR: 0.78, minAlpha: 0.22, maxAlpha: 0.54 }],
  }),
  distantB: buildSvgStarfieldStyle({
    seed: 224737,
    tileW: 1667,
    tileH: 1031,
    layers: [{ count: 104, minR: 0.4, maxR: 0.74, minAlpha: 0.18, maxAlpha: 0.48 }],
  }),
  midA: buildSvgStarfieldStyle({
    seed: 350377,
    tileW: 1553,
    tileH: 977,
    layers: [{ count: 62, minR: 0.58, maxR: 0.96, minAlpha: 0.42, maxAlpha: 0.78 }],
    brightCount: 6,
  }),
  midB: buildSvgStarfieldStyle({
    seed: 479909,
    tileW: 1699,
    tileH: 1051,
    layers: [{ count: 52, minR: 0.54, maxR: 0.92, minAlpha: 0.36, maxAlpha: 0.72 }],
    brightCount: 5,
  }),
  dust: buildDustLayerStyle({
    seed: 611953,
    tileW: 1733,
    tileH: 1087,
    moteCount: 16,
    cloudCount: 12,
  }),
});

// 3D Crimson Light Tunnel Ribs: varied widths, blur depths, 3D tilt, and speeds with deep black spacing
const TUNNEL_BEAMS = [
  { id: 'core', width: 2, blur: 0, variant: 'hot', startX: 0, rushX: 0, convergeX: 0, zStart: -160, zPeak: 90, rotY: 0, delay: 0.1, dur: 0.42, scaleYFrom: 0.05, peakOpacity: 0.92 },
  { id: 'blade-l1', width: 4, blur: 0, variant: 'blade', startX: -8, rushX: -72, convergeX: -28, zStart: -260, zPeak: 75, rotY: 8, delay: 0.24, dur: 0.72, scaleYFrom: 0.16, peakOpacity: 0.84 },
  { id: 'blade-r1', width: 4, blur: 0, variant: 'blade', startX: 8, rushX: 72, convergeX: 28, zStart: -260, zPeak: 75, rotY: -8, delay: 0.24, dur: 0.72, scaleYFrom: 0.16, peakOpacity: 0.84 },
  { id: 'blade-l2', width: 7, blur: 1, variant: 'blade', startX: -14, rushX: -146, convergeX: -74, zStart: -320, zPeak: 85, rotY: 14, delay: 0.3, dur: 0.68, scaleYFrom: 0.2, peakOpacity: 0.76 },
  { id: 'blade-r2', width: 7, blur: 1, variant: 'blade', startX: 14, rushX: 146, convergeX: 74, zStart: -320, zPeak: 85, rotY: -14, delay: 0.3, dur: 0.68, scaleYFrom: 0.2, peakOpacity: 0.76 },
  { id: 'blade-l3', width: 10, blur: 2, variant: 'crimson', startX: -22, rushX: -224, convergeX: -124, zStart: -360, zPeak: 95, rotY: 20, delay: 0.36, dur: 0.64, scaleYFrom: 0.26, peakOpacity: 0.68 },
  { id: 'blade-r3', width: 10, blur: 2, variant: 'crimson', startX: 22, rushX: 224, convergeX: 124, zStart: -360, zPeak: 95, rotY: -20, delay: 0.36, dur: 0.64, scaleYFrom: 0.26, peakOpacity: 0.68 },
  { id: 'mid-l1', width: 20, blur: 5, variant: 'crimson', startX: -28, rushX: -312, convergeX: -178, zStart: -400, zPeak: 110, rotY: 26, delay: 0.42, dur: 0.58, scaleYFrom: 0.32, peakOpacity: 0.52 },
  { id: 'mid-r1', width: 20, blur: 5, variant: 'crimson', startX: 28, rushX: 312, convergeX: 178, zStart: -400, zPeak: 110, rotY: -26, delay: 0.42, dur: 0.58, scaleYFrom: 0.32, peakOpacity: 0.52 },
  { id: 'mid-l2', width: 28, blur: 8, variant: 'crimson', startX: -36, rushX: -404, convergeX: -226, zStart: -420, zPeak: 120, rotY: 32, delay: 0.48, dur: 0.54, scaleYFrom: 0.38, peakOpacity: 0.4 },
  { id: 'mid-r2', width: 28, blur: 8, variant: 'crimson', startX: 36, rushX: 404, convergeX: 226, zStart: -420, zPeak: 120, rotY: -32, delay: 0.48, dur: 0.54, scaleYFrom: 0.38, peakOpacity: 0.4 },
  { id: 'wing-l1', width: 40, blur: 12, variant: 'ember', startX: -44, rushX: -500, convergeX: -268, zStart: -460, zPeak: 130, rotY: 36, delay: 0.54, dur: 0.5, scaleYFrom: 0.44, peakOpacity: 0.32 },
  { id: 'wing-r1', width: 40, blur: 12, variant: 'ember', startX: 44, rushX: 500, convergeX: 268, zStart: -460, zPeak: 130, rotY: -36, delay: 0.54, dur: 0.5, scaleYFrom: 0.44, peakOpacity: 0.32 },
  { id: 'wing-l2', width: 24, blur: 9, variant: 'crimson', startX: -52, rushX: -585, convergeX: -308, zStart: -480, zPeak: 135, rotY: 40, delay: 0.6, dur: 0.46, scaleYFrom: 0.5, peakOpacity: 0.28 },
  { id: 'wing-r2', width: 24, blur: 9, variant: 'crimson', startX: 52, rushX: 585, convergeX: 308, zStart: -480, zPeak: 135, rotY: -40, delay: 0.6, dur: 0.46, scaleYFrom: 0.5, peakOpacity: 0.28 },
];

function getPrefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

const CinematicIntro = ({ onNavigateToSection }) => {
  const { selectProfile, skipIntro } = useProfile();

  const overlayRef = useRef(null);
  const topbarRef = useRef(null);
  const theaterGlowRef = useRef(null);
  const starfieldStageRef = useRef(null);
  const starDistantWrapRef = useRef(null);
  const starMidWrapRef = useRef(null);
  const starDustWrapRef = useRef(null);
  const tunnelStageRef = useRef(null);
  const tunnelFloorRef = useRef(null);
  const centerFlashRef = useRef(null);
  const beamRefs = useRef([]);
  const stageRef = useRef(null);
  const heroStageRef = useRef(null);
  const nameBlockRef = useRef(null);
  const wordmarkRigRef = useRef(null);
  const wordmarkTraceRef = useRef(null);
  const wordmarkSolidRef = useRef(null);
  const cutterLeftRef = useRef(null);
  const cutterRightRef = useRef(null);
  const nameRuleRef = useRef(null);
  const portraitStageRef = useRef(null);
  const portraitHaloRef = useRef(null);
  const portraitRef = useRef(null);
  const titlesRef = useRef(null);
  const masterTlRef = useRef(null);
  const exitTlRef = useRef(null);
  const isExitingRef = useRef(false);

  const [introStage, setIntroStage] = useState('opening');
  const introStageRef = useRef('opening');

  // Lock background document scrolling strictly while the intro dialog is active
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    return () => {
      html.style.overflow = previousOverflow;
    };
  }, []);

  const completeIntroExit = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.overflow = '';
    }

    skipIntro();

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        const homeSection = document.getElementById('home');
        if (homeSection && typeof homeSection.focus === 'function') {
          homeSection.focus({ preventScroll: true });
        }
      });
    }
  }, [skipIntro]);

  const handleSkipIntro = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    if (masterTlRef.current) {
      masterTlRef.current.kill();
      masterTlRef.current = null;
    }

    const overlay = overlayRef.current;
    if (!overlay || getPrefersReducedMotion()) {
      completeIntroExit();
      return;
    }

    gsap.to(overlay, {
      opacity: 0,
      scale: 1.015,
      duration: 0.25,
      ease: 'power2.out',
      onComplete: completeIntroExit,
    });
  }, [completeIntroExit]);

  const handleProfileSelection = useCallback(
    (profile) => {
      if (isExitingRef.current) return;
      isExitingRef.current = true;

      if (masterTlRef.current) {
        masterTlRef.current.kill();
        masterTlRef.current = null;
      }

      const overlay = overlayRef.current;
      const stage = stageRef.current;
      const topbar = topbarRef.current;
      const targetSection = profile?.targetSection || 'home';

      const finishAndUnlock = () => {
        if (typeof onNavigateToSection === 'function') {
          onNavigateToSection(targetSection, { focusTarget: false });
        } else if (typeof document !== 'undefined') {
          document.documentElement.style.overflow = '';
        }

        selectProfile(profile.id);

        if (typeof onNavigateToSection === 'function') {
          window.requestAnimationFrame(() => {
            onNavigateToSection(targetSection, { focusTarget: true, scroll: false });
          });
        }
      };

      if (!overlay || getPrefersReducedMotion()) {
        finishAndUnlock();
        return;
      }

      const fadeTargets = [stage, topbar].filter(Boolean);
      const exitTl = gsap.timeline();
      exitTlRef.current = exitTl;

      // Cross-dissolve through black studio veil so scroll navigation never flashes raw DOM
      exitTl
        .to(fadeTargets.length > 0 ? fadeTargets : overlay, {
          opacity: 0,
          duration: 0.24,
          ease: 'power2.in',
        })
        .add(() => {
          if (typeof onNavigateToSection === 'function') {
            onNavigateToSection(targetSection, { focusTarget: false });
          } else if (typeof document !== 'undefined') {
            document.documentElement.style.overflow = '';
          }
        })
        .to(overlay, {
          opacity: 0,
          duration: 0.28,
          delay: 0.04,
          ease: 'power2.out',
          onComplete: () => {
            exitTlRef.current = null;
            selectProfile(profile.id);
            if (typeof onNavigateToSection === 'function') {
              window.requestAnimationFrame(() => {
                onNavigateToSection(targetSection, { focusTarget: true, scroll: false });
              });
            }
          },
        });
    },
    [onNavigateToSection, selectProfile]
  );

  // Escape key skips the opening animation only; never bypasses active profile selection
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (introStageRef.current === 'selector') return;

      const target = event.target;
      const tagName = target?.tagName?.toLowerCase();
      const isEditable =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        Boolean(target?.isContentEditable);

      if (isEditable) return;

      event.preventDefault();
      handleSkipIntro();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkipIntro]);

  // Ensure any in-flight skip or exit animation cleans up cleanly on unmount
  useEffect(() => {
    const overlay = overlayRef.current;
    return () => {
      if (exitTlRef.current) {
        exitTlRef.current.kill();
        exitTlRef.current = null;
      }
      if (overlay) gsap.killTweensOf(overlay);
    };
  }, []);

  // Scene 01 Blackout -> 02 Ignition -> 03 3D Light Tunnel -> 04 Light-Formed KUNAL SENGAR -> 05 Portrait -> 06 Identity -> 07 Selector
  useLayoutEffect(() => {
    if (introStageRef.current !== 'opening') return undefined;

    const overlay = overlayRef.current;
    const topbar = topbarRef.current;
    const theaterGlow = theaterGlowRef.current;
    const starfieldStage = starfieldStageRef.current;
    const tunnelStage = tunnelStageRef.current;
    const tunnelFloor = tunnelFloorRef.current;
    const centerFlash = centerFlashRef.current;
    const heroStage = heroStageRef.current;
    const nameBlock = nameBlockRef.current;
    const wordmarkRig = wordmarkRigRef.current;
    const wordmarkTrace = wordmarkTraceRef.current;
    const wordmarkSolid = wordmarkSolidRef.current;
    const cutterLeft = cutterLeftRef.current;
    const cutterRight = cutterRightRef.current;
    const nameRule = nameRuleRef.current;
    const portraitStageEl = portraitStageRef.current;
    const portraitHalo = portraitHaloRef.current;
    const portrait = portraitRef.current;
    const titles = titlesRef.current;
    const beamNodes = beamRefs.current.filter(Boolean);

    if (
      !overlay ||
      !topbar ||
      !theaterGlow ||
      !starfieldStage ||
      !tunnelStage ||
      !tunnelFloor ||
      !centerFlash ||
      !heroStage ||
      !nameBlock ||
      !wordmarkRig ||
      !wordmarkTrace ||
      !wordmarkSolid ||
      !cutterLeft ||
      !cutterRight ||
      !nameRule ||
      !portraitStageEl ||
      !portraitHalo ||
      !portrait ||
      !titles ||
      beamNodes.length === 0
    ) {
      return undefined;
    }

    const identityItems = Array.from(titles.querySelectorAll('.ci-id-item'));
    const prefersReducedMotion = getPrefersReducedMotion();

    const applyMaskProgress = (p) => {
      const clamped = Math.max(0, Math.min(1, p));
      const beamPct = clamped * 50;
      const tracePct = Math.min(55, clamped * 64);
      const solidPct = Math.min(55, Math.max(0, (clamped - 0.16) / 0.84) * 56);
      const traceMidAlpha = clamped > 0.78 ? Math.min(1, (clamped - 0.78) / 0.14) : 0;
      const solidMidAlpha = clamped > 0.86 ? Math.min(1, (clamped - 0.86) / 0.14) : 0;

      wordmarkRig.style.setProperty('--beam-pct', beamPct.toFixed(3));
      wordmarkRig.style.setProperty('--trace-pct', tracePct.toFixed(3));
      wordmarkRig.style.setProperty('--trace-mid-alpha', traceMidAlpha.toFixed(3));
      wordmarkRig.style.setProperty('--solid-pct', solidPct.toFixed(3));
      wordmarkRig.style.setProperty('--solid-mid-alpha', solidMidAlpha.toFixed(3));
    };

    const enterSelectorStage = () => {
      if (isExitingRef.current) return;
      introStageRef.current = 'selector';
      setIntroStage('selector');
    };

    const ctx = gsap.context(() => {
      if (isExitingRef.current) return;

      const stageCenterY = heroStage.clientHeight / 2;
      const nameNaturalCenterY = nameBlock.offsetTop + nameBlock.offsetHeight / 2;
      const centerOffsetY = Math.max(24, Math.round(stageCenterY - nameNaturalCenterY));
      const spreadScale = Math.min(1.15, Math.max(0.32, (heroStage.clientWidth || 1000) / 1050));

      if (prefersReducedMotion) {
        gsap.set(topbar, { opacity: 1 });
        gsap.set(theaterGlow, { opacity: 0.08, scale: 1 });
        gsap.set(starfieldStage, { opacity: 0.85, scale: 1 });
        gsap.set(tunnelStage, { opacity: 0.1 });
        gsap.set(tunnelFloor, { opacity: 0.25 });
        beamNodes.forEach((node, idx) => {
          const cfg = TUNNEL_BEAMS[idx];
          if (!cfg) return;
          gsap.set(node, {
            xPercent: -50,
            x: Math.round(cfg.convergeX * spreadScale),
            z: 0,
            rotationY: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: cfg.peakOpacity * 0.28,
          });
        });
        applyMaskProgress(1);
        gsap.set(wordmarkTrace, { opacity: 0 });
        gsap.set(wordmarkSolid, {
          opacity: 1,
          backgroundPosition: '0% 0%',
          WebkitMaskImage: 'none',
          maskImage: 'none',
        });
        gsap.set([cutterLeft, cutterRight, centerFlash], { opacity: 0 });
        gsap.set(nameRule, { scaleX: 0.72, opacity: 0.88 });
        gsap.set([nameBlock, portraitHalo, portrait, ...identityItems], {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
        });

        const reducedTl = gsap.timeline({
          onComplete: enterSelectorStage,
        });

        reducedTl
          .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'none' })
          .to([nameBlock, portraitStageEl, starfieldStage], {
            opacity: 0,
            duration: 0.14,
            delay: 0.92,
            ease: 'none',
          });

        masterTlRef.current = reducedTl;
        return;
      }

      // Scene 01 Initialization: Pure #000000 Darkness (No UI, Name, Portrait, or Stars Visible)
      gsap.set(topbar, { opacity: 0 });
      gsap.set(theaterGlow, { opacity: 0, scale: 0.72 });
      gsap.set(starfieldStage, { opacity: 0, scale: 1.035 });
      gsap.set(tunnelStage, { opacity: 1 });
      gsap.set(tunnelFloor, { opacity: 0, scaleX: 0.55 });
      gsap.set(centerFlash, { opacity: 0, scale: 0.4 });
      beamNodes.forEach((node, idx) => {
        const cfg = TUNNEL_BEAMS[idx];
        if (!cfg) return;
        gsap.set(node, {
          xPercent: -50,
          x: cfg.startX,
          y: 0,
          z: cfg.zStart,
          rotationY: cfg.rotY,
          scaleX: 0.55,
          scaleY: cfg.scaleYFrom,
          opacity: 0,
        });
      });

      applyMaskProgress(0);
      gsap.set(nameBlock, { opacity: 1, x: 0, y: centerOffsetY, scale: 1.04 });
      gsap.set(nameRule, { scaleX: 0, opacity: 0 });
      gsap.set([wordmarkTrace, wordmarkSolid], { opacity: 0 });
      gsap.set(wordmarkSolid, { backgroundPosition: '100% 0%' });
      gsap.set([cutterLeft, cutterRight], { opacity: 0, scaleY: 0.68 });

      // Portrait & identity remain strictly hidden until AFTER KUNAL SENGAR finishes
      gsap.set(portraitHalo, { opacity: 0, scale: 0.88 });
      gsap.set(portrait, { opacity: 0, y: 24, scale: 0.985 });
      gsap.set(identityItems, { opacity: 0, y: 10 });

      const revealState = { progress: 0 };
      const tl = gsap.timeline({
        onComplete: enterSelectorStage,
      });
      masterTlRef.current = tl;

      // Scene 02: Crimson Light Ignition in Pure Darkness (0.10s -> 0.55s)
      tl.to(
        theaterGlow,
        {
          opacity: 0.62,
          scale: 0.96,
          duration: 0.78,
          ease: 'power2.out',
        },
        0.16
      )
        .to(
          tunnelFloor,
          {
            opacity: 0.72,
            scaleX: 1,
            duration: 0.85,
            ease: 'power2.out',
          },
          0.22
        )
        .to(
          topbar,
          {
            opacity: 1,
            duration: 0.42,
            ease: 'power2.out',
          },
          0.32
        );

      // Scene 03: Netflix-Inspired 3D Volumetric Crimson Light Tunnel (0.10s -> 1.48s)
      beamNodes.forEach((node, idx) => {
        const cfg = TUNNEL_BEAMS[idx];
        if (!cfg) return;
        const targetRushX = Math.round(cfg.rushX * spreadScale);
        const targetConvergeX = Math.round(cfg.convergeX * spreadScale);

        tl.to(
          node,
          {
            opacity: cfg.peakOpacity,
            scaleY: 1.1,
            duration: 0.34,
            ease: 'power3.out',
          },
          cfg.delay
        )
          .to(
            node,
            {
              x: targetRushX,
              z: cfg.zPeak,
              scaleX: 1.08,
              duration: cfg.dur,
              ease: 'power2.inOut',
            },
            cfg.delay + 0.04
          )
          // Scene 04 Phase A: Outer & Mid Tunnel Beams Converge Inward Toward Center Composition
          .to(
            node,
            {
              x: targetConvergeX,
              z: -40,
              rotationY: cfg.rotY * 0.25,
              scaleY: 0.88,
              opacity: idx === 0 ? 0.38 : cfg.peakOpacity * 0.42,
              duration: 0.42,
              ease: 'power2.in',
            },
            1.28 + (idx % 4) * 0.025
          );
      });

      // Scene 04 Phase B: Converging Cutter Beams & Progressive Masked Formation of KUNAL SENGAR
      tl.to(
        [cutterLeft, cutterRight],
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.14,
          ease: 'power2.out',
        },
        1.48
      )
        .to(
          [wordmarkTrace, wordmarkSolid],
          {
            opacity: 1,
            duration: 0.08,
            ease: 'none',
          },
          1.52
        )
        .to(
          revealState,
          {
            progress: 1,
            duration: 0.84,
            ease: 'power2.inOut',
            onUpdate: () => {
              applyMaskProgress(revealState.progress);
            },
            onComplete: () => {
              applyMaskProgress(1);
              gsap.set(wordmarkSolid, {
                WebkitMaskImage: 'none',
                maskImage: 'none',
              });
            },
          },
          1.54
        )
        // Scene 04 Phase C: Center Collision Pulse, Horizon Rule & Final Sweeping Crimson Light Pass
        .to(
          centerFlash,
          {
            opacity: 0.88,
            scale: 1.12,
            duration: 0.14,
            ease: 'power2.out',
          },
          2.32
        )
        .to(
          centerFlash,
          {
            opacity: 0,
            scale: 1.4,
            duration: 0.34,
            ease: 'power2.in',
          },
          2.46
        )
        .to(
          [cutterLeft, cutterRight],
          {
            opacity: 0,
            scaleY: 0.35,
            duration: 0.16,
            ease: 'power2.in',
          },
          2.34
        )
        .to(
          wordmarkTrace,
          {
            opacity: 0,
            duration: 0.18,
            ease: 'power2.out',
          },
          2.34
        )
        .to(
          wordmarkSolid,
          {
            backgroundPosition: '0% 0%',
            duration: 0.62,
            ease: 'power1.inOut',
          },
          2.36
        )
        .to(
          nameRule,
          {
            scaleX: 1,
            opacity: 0.88,
            duration: 0.44,
            ease: 'expo.out',
          },
          2.34
        )
        .to(
          tunnelStage,
          {
            opacity: 0.22,
            duration: 0.45,
            ease: 'power2.out',
          },
          2.42
        )
        // Scene 05: Light Tunnel Dissolves Out, Wordmark Glides Up & IMG_2399 Portrait Reveals (AFTER Name Holds)
        .to(
          tunnelStage,
          {
            opacity: 0,
            duration: 0.56,
            ease: 'power2.inOut',
          },
          2.96
        )
        .to(
          tunnelFloor,
          {
            opacity: 0,
            duration: 0.55,
            ease: 'power2.out',
          },
          2.96
        )
        .to(
          theaterGlow,
          {
            opacity: 0,
            duration: 0.72,
            ease: 'power2.out',
          },
          2.98
        )
        .to(
          nameBlock,
          {
            y: 0,
            scale: 1,
            duration: 0.68,
            ease: 'power2.inOut',
          },
          2.98
        )
        .to(
          nameRule,
          {
            scaleX: 0.72,
            opacity: 0.84,
            duration: 0.64,
            ease: 'power2.inOut',
          },
          2.98
        )
        // Phase B9: Universe Starfield Awakens Strictly After Completed KUNAL SENGAR Reveal
        .to(
          starfieldStage,
          {
            opacity: 1,
            scale: 1,
            duration: 1.05,
            ease: 'power2.out',
          },
          3.08
        )
        .to(
          portraitHalo,
          {
            opacity: 0.68,
            scale: 1,
            duration: 0.78,
            ease: 'power2.out',
          },
          3.28
        )
        .to(
          portrait,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.74,
            ease: 'power2.out',
          },
          3.32
        )
        // Scene 06: Staggered Developer Identity (FULL STACK DEVELOPER, AI ENGINEER, LLM, RAG)
        .to(
          identityItems,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.11,
            ease: 'power2.out',
          },
          3.82
        )
        // Scene 07: Clean Universe Hold & Smooth Dissolve Into 4-Profile Netflix Selector
        .to(
          [nameBlock, portraitStageEl],
          {
            opacity: 0,
            y: -12,
            duration: 0.46,
            delay: 0.96,
            ease: 'power2.inOut',
          }
        )
        .to(
          [tunnelStage, starfieldStage],
          {
            opacity: 0,
            duration: 0.46,
            ease: 'power2.inOut',
          },
          '<'
        );
    }, overlayRef);

    return () => {
      masterTlRef.current = null;
      ctx.revert();
    };
  }, []);

  // Desktop-only micro-parallax across 3 starfield depth layers; strictly disabled on touch or reduced motion
  useEffect(() => {
    if (introStage !== 'opening' || getPrefersReducedMotion()) return undefined;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    if (!window.matchMedia(FINE_HOVER_POINTER_QUERY).matches) return undefined;

    const overlay = overlayRef.current;
    const distantWrap = starDistantWrapRef.current;
    const midWrap = starMidWrapRef.current;
    const dustWrap = starDustWrapRef.current;
    if (!overlay || !distantWrap || !midWrap || !dustWrap) return undefined;

    let handleMouseMove;
    let handleMouseLeave;

    const ctx = gsap.context(() => {
      const distantX = gsap.quickTo(distantWrap, 'x', { duration: 1.4, ease: 'power2.out' });
      const distantY = gsap.quickTo(distantWrap, 'y', { duration: 1.4, ease: 'power2.out' });
      const midX = gsap.quickTo(midWrap, 'x', { duration: 1.1, ease: 'power2.out' });
      const midY = gsap.quickTo(midWrap, 'y', { duration: 1.1, ease: 'power2.out' });
      const dustX = gsap.quickTo(dustWrap, 'x', { duration: 0.9, ease: 'power2.out' });
      const dustY = gsap.quickTo(dustWrap, 'y', { duration: 0.9, ease: 'power2.out' });

      handleMouseMove = (event) => {
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        const nx = event.clientX / w - 0.5;
        const ny = event.clientY / h - 0.5;

        distantX(-nx * 6);
        distantY(-ny * 4);
        midX(-nx * 16);
        midY(-ny * 10);
        dustX(-nx * 28);
        dustY(-ny * 18);
      };

      handleMouseLeave = () => {
        distantX(0);
        distantY(0);
        midX(0);
        midY(0);
        dustX(0);
        dustY(0);
      };

      overlay.addEventListener('mousemove', handleMouseMove, { passive: true });
      overlay.addEventListener('mouseleave', handleMouseLeave);
    }, overlayRef);

    return () => {
      if (handleMouseMove) overlay.removeEventListener('mousemove', handleMouseMove);
      if (handleMouseLeave) overlay.removeEventListener('mouseleave', handleMouseLeave);
      ctx.revert();
    };
  }, [introStage]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={introStage === 'selector' ? 'ps-heading' : 'ci-intro-title'}
      className={`ci-overlay ${introStage === 'selector' ? 'ci-overlay--selector' : ''}`}
    >
      {/* Pure Black Canvas, 3D Starfield Universe, Light Tunnel & Atmospheric Depth */}
      <div className="ci-atmosphere" aria-hidden="true">
        <div ref={theaterGlowRef} className="ci-theater-glow" />
        <div ref={starfieldStageRef} className="ci-starfield-stage">
          <div ref={starDistantWrapRef} className="ci-star-parallax ci-star-parallax--distant">
            <div className="ci-star-plane ci-star-plane--distant-a" style={STAR_LAYER_STYLES.distantA} />
            <div className="ci-star-plane ci-star-plane--distant-b" style={STAR_LAYER_STYLES.distantB} />
          </div>
          <div ref={starMidWrapRef} className="ci-star-parallax ci-star-parallax--mid">
            <div className="ci-star-plane ci-star-plane--mid-a" style={STAR_LAYER_STYLES.midA} />
            <div className="ci-star-plane ci-star-plane--mid-b" style={STAR_LAYER_STYLES.midB} />
          </div>
          <div ref={starDustWrapRef} className="ci-star-parallax ci-star-parallax--dust">
            <div className="ci-star-plane ci-star-plane--dust" style={STAR_LAYER_STYLES.dust} />
          </div>
        </div>
        <div ref={tunnelStageRef} className="ci-tunnel-stage">
          {TUNNEL_BEAMS.map((beam, idx) => (
            <span
              key={beam.id}
              ref={(el) => {
                beamRefs.current[idx] = el;
              }}
              className={`ci-beam ci-beam--${beam.variant}`}
              style={{
                width: `${beam.width}px`,
                filter: beam.blur ? `blur(${beam.blur}px)` : undefined,
              }}
            />
          ))}
          <div ref={tunnelFloorRef} className="ci-tunnel-floor" />
          <div ref={centerFlashRef} className="ci-center-flash" />
        </div>
        <div className="ci-vignette" />
      </div>

      {/* Top Navigation & Accessible Skip Intro Control */}
      <div ref={topbarRef} className="ci-topbar">
        {introStage === 'opening' ? (
          <div className="ci-brand-cue" aria-hidden="true">
            <span className="ci-brand-dot" />
            <span>KS STUDIO EDITION</span>
          </div>
        ) : (
          <span aria-hidden="true" />
        )}

        <button
          type="button"
          onClick={handleSkipIntro}
          aria-label="Skip cinematic intro"
          className="ci-skip-btn"
        >
          <span>Skip Intro</span>
          {introStage === 'opening' && (
            <span className="ci-skip-hint" aria-hidden="true">
              ESC
            </span>
          )}
        </button>
      </div>

      {/* Main Full-Viewport Cinematic Stage */}
      <div ref={stageRef} className="ci-stage">
        {introStage === 'selector' ? (
          <ProfileSelector onSelectProfile={handleProfileSelection} />
        ) : (
          <div ref={heroStageRef} className="ci-hero-stage">
            <div ref={nameBlockRef} className="ci-name-block">
              <div ref={wordmarkRigRef} className="ci-wordmark-rig">
                <span ref={wordmarkTraceRef} className="ci-wordmark ci-wordmark--trace" aria-hidden="true">
                  KUNAL SENGAR
                </span>
                <h2 id="ci-intro-title" ref={wordmarkSolidRef} className="ci-wordmark ci-wordmark--solid">
                  KUNAL SENGAR
                </h2>
                <div className="ci-beam-track" aria-hidden="true">
                  <div className="ci-cutter-carrier ci-cutter-carrier--left">
                    <span ref={cutterLeftRef} className="ci-cutter-beam ci-cutter-beam--left" />
                  </div>
                  <div className="ci-cutter-carrier ci-cutter-carrier--right">
                    <span ref={cutterRightRef} className="ci-cutter-beam ci-cutter-beam--right" />
                  </div>
                </div>
              </div>
              <div ref={nameRuleRef} className="ci-name-rule" aria-hidden="true" />
            </div>

            <div ref={portraitStageRef} className="ci-portrait-stage">
              <div className="ci-portrait-frame">
                <div ref={portraitHaloRef} className="ci-portrait-halo" aria-hidden="true" />
                <div ref={portraitRef} className="ci-portrait-wrap">
                  <img
                    src={portraitImg}
                    alt="Kunal Sengar — Full Stack Developer"
                    decoding="async"
                    className="ci-portrait-img"
                  />
                  <div className="ci-portrait-vignette" aria-hidden="true" />
                </div>
              </div>

              <div ref={titlesRef} className="ci-titles-block">
                <p className="ci-role-title ci-id-item">FULL STACK DEVELOPER</p>
                <p className="ci-spec-title" aria-label="AI ENGINEER · LLM · RAG">
                  <span className="ci-id-token ci-id-item">AI ENGINEER</span>
                  <span className="ci-id-token ci-id-item">
                    <span className="ci-spec-sep" aria-hidden="true">
                      ·{' '}
                    </span>
                    LLM
                  </span>
                  <span className="ci-id-token ci-id-item">
                    <span className="ci-spec-sep" aria-hidden="true">
                      ·{' '}
                    </span>
                    RAG
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinematicIntro;

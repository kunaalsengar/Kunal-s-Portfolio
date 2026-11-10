import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useProfile } from '../context/ProfileContext';
import ProfileSelector from './ProfileSelector';
import portraitImg from '../assets/Portfolio/b2affbd4-f396-4bee-8ec8-6cecfae347ff.jpg';
import '../styles/CinematicIntro.css';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Layered crimson light-streak geometry for volumetric depth out of pure black darkness
const LIGHT_STREAKS = [
  { id: 'core', width: 3, blur: 0, startX: 0, expandX: 0, peakOpacity: 0.96, variant: 'bright', scaleYFrom: 0.1 },
  { id: 'inner-l', width: 10, blur: 4, startX: -10, expandX: -105, peakOpacity: 0.72, variant: 'crimson', scaleYFrom: 0.18 },
  { id: 'inner-r', width: 10, blur: 4, startX: 10, expandX: 105, peakOpacity: 0.72, variant: 'crimson', scaleYFrom: 0.18 },
  { id: 'blade-l', width: 2, blur: 0, startX: -22, expandX: -185, peakOpacity: 0.86, variant: 'bright', scaleYFrom: 0.14 },
  { id: 'blade-r', width: 2, blur: 0, startX: 22, expandX: 185, peakOpacity: 0.86, variant: 'bright', scaleYFrom: 0.14 },
  { id: 'wash-l', width: 36, blur: 18, startX: -16, expandX: -270, peakOpacity: 0.46, variant: 'crimson', scaleYFrom: 0.32 },
  { id: 'wash-r', width: 36, blur: 18, startX: 16, expandX: 270, peakOpacity: 0.46, variant: 'crimson', scaleYFrom: 0.32 },
  { id: 'deep-l', width: 58, blur: 30, startX: -32, expandX: -390, peakOpacity: 0.34, variant: 'ember', scaleYFrom: 0.45 },
  { id: 'deep-r', width: 58, blur: 30, startX: 32, expandX: 390, peakOpacity: 0.34, variant: 'ember', scaleYFrom: 0.45 },
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
  const streaksStageRef = useRef(null);
  const streakRefs = useRef([]);
  const stageRef = useRef(null);
  const heroStageRef = useRef(null);
  const nameBlockRef = useRef(null);
  const nameTitleRef = useRef(null);
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

  // Netflix-inspired crimson light-streak opening -> name reveal + light sweep -> upward glide -> portrait + titles
  useLayoutEffect(() => {
    if (introStageRef.current !== 'opening') return undefined;

    const overlay = overlayRef.current;
    const theaterGlow = theaterGlowRef.current;
    const streaksStage = streaksStageRef.current;
    const heroStage = heroStageRef.current;
    const nameBlock = nameBlockRef.current;
    const nameTitle = nameTitleRef.current;
    const nameRule = nameRuleRef.current;
    const portraitStageEl = portraitStageRef.current;
    const portraitHalo = portraitHaloRef.current;
    const portrait = portraitRef.current;
    const titles = titlesRef.current;
    const streakNodes = streakRefs.current.filter(Boolean);

    if (
      !overlay ||
      !theaterGlow ||
      !streaksStage ||
      !heroStage ||
      !nameBlock ||
      !nameTitle ||
      !nameRule ||
      !portraitStageEl ||
      !portraitHalo ||
      !portrait ||
      !titles ||
      streakNodes.length === 0
    ) {
      return undefined;
    }

    const prefersReducedMotion = getPrefersReducedMotion();

    const enterSelectorStage = () => {
      if (isExitingRef.current) return;
      introStageRef.current = 'selector';
      setIntroStage('selector');
    };

    const ctx = gsap.context(() => {
      if (isExitingRef.current) return;

      // Measure natural stage & title positions before transforms so initial center placement is exact
      const stageCenterY = heroStage.clientHeight / 2;
      const nameNaturalCenterY = nameBlock.offsetTop + nameBlock.offsetHeight / 2;
      const centerOffsetY = Math.max(24, Math.round(stageCenterY - nameNaturalCenterY));
      const spreadScale = Math.min(1.18, Math.max(0.42, (heroStage.clientWidth || 1000) / 1000));

      if (prefersReducedMotion) {
        gsap.set(theaterGlow, { opacity: 0.52, scale: 1 });
        gsap.set(streaksStage, { opacity: 0.18 });
        streakNodes.forEach((node, idx) => {
          const cfg = LIGHT_STREAKS[idx];
          if (!cfg) return;
          gsap.set(node, {
            xPercent: -50,
            x: Math.round(cfg.expandX * spreadScale),
            y: 0,
            scaleX: 1.2,
            scaleY: 1,
            opacity: cfg.peakOpacity * 0.45,
          });
        });
        gsap.set(nameTitle, { backgroundPosition: '0% 0%' });
        gsap.set([nameBlock, nameRule, portraitHalo, portrait, ...titles.children], {
          opacity: 1,
          y: 0,
          scale: 1,
          scaleX: 1,
        });

        const reducedTl = gsap.timeline({
          onComplete: enterSelectorStage,
        });

        reducedTl
          .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'none' })
          .to([nameBlock, portraitStageEl], {
            opacity: 0,
            duration: 0.14,
            delay: 0.88,
            ease: 'none',
          });

        masterTlRef.current = reducedTl;
        return;
      }

      // Initialize everything hidden inside pure pitch-black darkness
      gsap.set(theaterGlow, { opacity: 0, scale: 0.78 });
      gsap.set(streaksStage, { opacity: 1 });
      streakNodes.forEach((node, idx) => {
        const cfg = LIGHT_STREAKS[idx];
        if (!cfg) return;
        gsap.set(node, {
          xPercent: -50,
          x: cfg.startX,
          y: idx % 2 === 0 ? -36 : 36,
          scaleY: cfg.scaleYFrom,
          scaleX: 0.7,
          opacity: 0,
        });
      });
      gsap.set(nameBlock, { opacity: 0, y: centerOffsetY, scale: 1.14 });
      gsap.set(nameTitle, { backgroundPosition: '100% 0%' });
      gsap.set(nameRule, { scaleX: 0, opacity: 0 });
      gsap.set(portraitHalo, { opacity: 0, scale: 0.88 });
      gsap.set(portrait, { opacity: 0, y: 16, scale: 0.98 });
      gsap.set(titles.children, { opacity: 0, y: 10 });

      const tl = gsap.timeline({
        onComplete: enterSelectorStage,
      });
      masterTlRef.current = tl;

      // Stage 1: Subtle Crimson Light Streaks Splitting Pure Darkness
      tl.to(theaterGlow, {
        opacity: 0.78,
        scale: 1,
        duration: 0.95,
        ease: 'power2.out',
      }).to(
        streakNodes,
        {
          y: 0,
          scaleY: 1,
          opacity: (i) => (LIGHT_STREAKS[i]?.peakOpacity ?? 0.6) * 0.88,
          duration: 0.68,
          stagger: 0.035,
          ease: 'power2.out',
        },
        0.05
      );

      streakNodes.forEach((node, idx) => {
        const cfg = LIGHT_STREAKS[idx];
        if (!cfg) return;
        tl.to(
          node,
          {
            x: Math.round(cfg.expandX * spreadScale),
            scaleX: 1.32,
            duration: 1.15,
            ease: 'sine.inOut',
          },
          0.16
        );
      });

      // Stage 2: Refined Centered Name Reveal & Controlled Crimson Light Sweep
      tl.to(
        nameBlock,
        {
          opacity: 1,
          scale: 1.07,
          duration: 0.74,
          ease: 'power2.out',
        },
        0.58
      )
        .fromTo(
          nameTitle,
          { backgroundPosition: '100% 0%' },
          {
            backgroundPosition: '0% 0%',
            duration: 1.04,
            ease: 'power1.inOut',
          },
          0.66
        )
        .to(
          streaksStage,
          {
            opacity: 0.18,
            duration: 0.85,
            ease: 'power2.out',
          },
          1.08
        )
        // Stage 3: Continuous Upward Glide & Delicate Hairline Rule
        .to(
          nameBlock,
          {
            y: 0,
            scale: 1,
            duration: 0.84,
            ease: 'power2.inOut',
          },
          1.54
        )
        .to(
          nameRule,
          {
            scaleX: 1,
            opacity: 0.88,
            duration: 0.52,
            ease: 'power2.out',
          },
          1.86
        )
        // Stage 4: Seamlessly Blended Portrait & Role Titles Emerge Continuous With Glide
        .to(
          portraitHalo,
          {
            opacity: 0.85,
            scale: 1,
            duration: 0.92,
            ease: 'power2.out',
          },
          1.9
        )
        .to(
          portrait,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.84,
            ease: 'power2.out',
          },
          1.94
        )
        .to(
          titles.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.56,
            stagger: 0.13,
            ease: 'power2.out',
          },
          2.36
        )
        // Stage 5: Editorial Hold & Smooth Cross-Dissolve Into "Who's watching?" Selector
        .to(
          [nameBlock, portraitStageEl],
          {
            opacity: 0,
            y: -12,
            duration: 0.48,
            delay: 0.82,
            ease: 'power2.inOut',
          }
        )
        .to(
          streaksStage,
          {
            opacity: 0.06,
            duration: 0.48,
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

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={introStage === 'selector' ? 'ps-heading' : 'ci-intro-title'}
      className={`ci-overlay ${introStage === 'selector' ? 'ci-overlay--selector' : ''}`}
    >
      {/* Pure Black Theater Canvas & Volumetric Crimson Light Streaks */}
      <div className="ci-atmosphere" aria-hidden="true">
        <div ref={theaterGlowRef} className="ci-theater-glow" />
        <div ref={streaksStageRef} className="ci-streaks-stage">
          {LIGHT_STREAKS.map((streak, idx) => (
            <span
              key={streak.id}
              ref={(el) => {
                streakRefs.current[idx] = el;
              }}
              className={`ci-streak ci-streak--${streak.variant}`}
              style={{
                width: `${streak.width}px`,
                filter: streak.blur ? `blur(${streak.blur}px)` : undefined,
              }}
            />
          ))}
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
              <h2 id="ci-intro-title" ref={nameTitleRef} className="ci-name-title">
                KUNAL SENGAR
              </h2>
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
                <p className="ci-role-title">FULL STACK DEVELOPER</p>
                <p className="ci-spec-title">AI ENGINEER · LLM · RAG</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinematicIntro;

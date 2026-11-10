import { useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import CinematicIntro from './components/CinematicIntro';
import CustomCursor from './components/CustomCursor';
import Hero from './components/Hero';
import About from './components/About';
import Expertise from './components/Expertise';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

function PortfolioContent() {
  const { isIntroCompleted } = useProfile();

  const handleNavigateToSection = useCallback(
    (sectionId, { focusTarget = false, scroll = true } = {}) => {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;

      const html = document.documentElement;
      html.style.overflow = '';

      if (scroll) {
        ScrollTrigger.refresh();
      }

      const targetEl =
        (typeof sectionId === 'string' && sectionId && document.getElementById(sectionId)) ||
        document.getElementById('home');

      if (!targetEl) return;

      if (scroll) {
        const pinTrigger = ScrollTrigger.getAll().find(
          (trigger) => trigger.trigger === targetEl && Boolean(trigger.pin)
        );
        const destinationY = pinTrigger
          ? Math.max(0, Math.ceil(pinTrigger.start))
          : Math.max(0, Math.round(targetEl.getBoundingClientRect().top + window.scrollY));

        const previousBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo({ top: destinationY, left: 0, behavior: 'auto' });
        html.style.scrollBehavior = previousBehavior;
        ScrollTrigger.update();
      }

      if (focusTarget) {
        if (!targetEl.hasAttribute('tabindex')) {
          targetEl.setAttribute('tabindex', '-1');
          targetEl.style.outline = 'none';
        }
        if (typeof targetEl.focus === 'function') {
          targetEl.focus({ preventScroll: true });
        }
      }
    },
    []
  );

  return (
    <main className="bg-[#050505] min-h-screen text-white relative cursor-none selection:bg-red-600 selection:text-white">
      {/* Unified Cinematic Intro + OTT Profile Selector supersedes standalone preloader */}
      {!isIntroCompleted && (
        <CinematicIntro onNavigateToSection={handleNavigateToSection} />
      )}

      {/* Global Mouse Hover Effects & Spotlight across ALL sections */}
      <CustomCursor />

      {/* Portfolio Sections */}
      <Hero introCompleted={isIntroCompleted} />
      <About />
      <Expertise />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}

function App() {
  return (
    <ProfileProvider>
      <PortfolioContent />
    </ProfileProvider>
  );
}

export default App;
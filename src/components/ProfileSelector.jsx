import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useProfile } from '../context/ProfileContext';
import exploreImg from '../assets/Portfolio/IMG_2397.jpg';
import developerImg from '../assets/Portfolio/IMG_3233.jpg';
import recruiterImg from '../assets/Portfolio/IMG_2399.jpg';
import clientAvatarImg from '../assets/Portfolio/netflix.png';
import '../styles/ProfileSelector.css';

// Unique visual asset and focal framing keyed strictly by canonical ProfileContext IDs
const PROFILE_AVATARS = Object.freeze({
  explore: Object.freeze({
    src: exploreImg,
    alt: 'Explore Portfolio — Kunal Sengar',
    objectPosition: '50% 42%',
  }),
  developer: Object.freeze({
    src: developerImg,
    alt: 'Developer — Kunal Sengar',
    objectPosition: '50% 18%',
  }),
  recruiter: Object.freeze({
    src: recruiterImg,
    alt: 'Recruiter — Kunal Sengar',
    objectPosition: '52% 40%',
  }),
  client: Object.freeze({
    src: clientAvatarImg,
    alt: 'Client profile avatar',
    objectPosition: '50% 50%',
  }),
});

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function getPrefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

const ProfileSelector = ({ onSelectProfile }) => {
  const { profileList } = useProfile();

  const rootRef = useRef(null);
  const brandRef = useRef(null);
  const headerRef = useRef(null);
  const buttonRefs = useRef([]);
  const selectionCallRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);

  // Move focus softly onto selector container when intro hands off to profile selection
  useEffect(() => {
    const rootEl = rootRef.current;
    if (rootEl && typeof rootEl.focus === 'function') {
      rootEl.focus({ preventScroll: true });
    }
  }, []);

  // Coordinated GSAP entrance before first paint to prevent pre-stagger opacity flashes
  useLayoutEffect(() => {
    const rootEl = rootRef.current;
    const brandEl = brandRef.current;
    const headerEl = headerRef.current;
    const cards = buttonRefs.current.filter(Boolean);
    if (!rootEl || !brandEl || !headerEl || cards.length === 0) return undefined;

    const prefersReducedMotion = getPrefersReducedMotion();

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([brandEl, headerEl, ...cards], { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(brandEl, { opacity: 0 });
      gsap.set(headerEl, { opacity: 0, y: 10 });
      gsap.set(cards, { opacity: 0, y: 14, scale: 0.96, transition: 'none' });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          gsap.set(cards, { clearProps: 'transform,opacity,transition' });
        },
      });

      tl.to(brandEl, { opacity: 1, duration: 0.32 }, 0)
        .to(headerEl, { opacity: 1, y: 0, duration: 0.38 }, 0.04)
        .to(
          cards,
          { opacity: 1, y: 0, scale: 1, duration: 0.42, stagger: 0.07 },
          0.16
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Clear any pending delayed callback if selector unmounts mid-selection
  useEffect(() => {
    return () => {
      if (selectionCallRef.current) {
        selectionCallRef.current.kill();
        selectionCallRef.current = null;
      }
    };
  }, []);

  const handleChooseProfile = useCallback(
    (profile) => {
      if (selectedId) return;
      setSelectedId(profile.id);

      if (getPrefersReducedMotion()) {
        onSelectProfile(profile);
        return;
      }

      // Brief emphasis beat on selected profile before overlay fade
      selectionCallRef.current = gsap.delayedCall(0.24, () => {
        selectionCallRef.current = null;
        onSelectProfile(profile);
      });
    },
    [selectedId, onSelectProfile]
  );

  // Arrow-key roving alongside native Tab / Enter / Space behavior
  const handleKeyDown = useCallback(
    (event, index) => {
      if (selectedId) return;
      const total = profileList.length;
      if (!total) return;

      let nextIndex = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (index + 1) % total;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (index - 1 + total) % total;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = total - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        buttonRefs.current[nextIndex]?.focus();
      }
    },
    [selectedId, profileList.length]
  );

  return (
    <section
      ref={rootRef}
      tabIndex={-1}
      aria-labelledby="ps-heading"
      className={`ps-root ${selectedId ? 'is-selecting' : ''}`}
    >
      {/* Subtle Top-Left Personal Brand Mark */}
      <div ref={brandRef} className="ps-brand" aria-hidden="true">
        KS
      </div>

      <div className="ps-content">
        <header ref={headerRef} className="ps-header">
          <h2 id="ps-heading" className="ps-heading">
            Who&apos;s watching?
          </h2>
        </header>

        <div className="ps-grid" role="group" aria-label="Visitor profiles">
          {profileList.map((profile, index) => {
            const avatar = PROFILE_AVATARS[profile.id];
            const isSelected = selectedId === profile.id;
            const isDimmed = Boolean(selectedId) && !isSelected;

            return (
              <button
                key={profile.id}
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                type="button"
                data-profile-id={profile.id}
                aria-pressed={isSelected}
                aria-disabled={Boolean(selectedId)}
                aria-label={`${profile.label} profile`}
                onClick={() => handleChooseProfile(profile)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={`ps-card ${isSelected ? 'is-selected' : ''} ${
                  isDimmed ? 'is-dimmed' : ''
                }`}
              >
                <span className="ps-avatar-box">
                  <img
                    src={avatar?.src}
                    alt={avatar?.alt || `${profile.label} profile`}
                    decoding="async"
                    style={avatar?.objectPosition ? { objectPosition: avatar.objectPosition } : undefined}
                    className="ps-avatar-img"
                  />
                  <span className="ps-avatar-ring" aria-hidden="true" />
                </span>

                <span className="ps-label">{profile.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProfileSelector;

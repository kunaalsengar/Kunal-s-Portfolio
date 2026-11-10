import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const SESSION_STORAGE_KEYS = Object.freeze({
  INTRO_COMPLETED: 'ks_intro_completed',
  ACTIVE_PROFILE: 'ks_active_profile',
});

/**
 * Canonical visitor profile definitions mapped strictly to existing section IDs.
 * Every profile preserves access to the entire portfolio; only initial scroll
 * destination and subtle visual emphasis vary by profile.
 */
const PROFILE_DEFINITIONS = Object.freeze({
  explore: Object.freeze({
    id: 'explore',
    label: 'Explore Portfolio',
    targetSection: 'home',
    highlightedSections: Object.freeze(['projects', 'skills', 'about']),
    quickLinks: Object.freeze([
      Object.freeze({ label: 'Home', sectionId: 'home' }),
      Object.freeze({ label: 'Projects', sectionId: 'projects' }),
      Object.freeze({ label: 'Contact', sectionId: 'contact' }),
    ]),
  }),
  developer: Object.freeze({
    id: 'developer',
    label: 'Developer',
    targetSection: 'skills',
    highlightedSections: Object.freeze(['skills', 'projects', 'expertise']),
    quickLinks: Object.freeze([
      Object.freeze({ label: 'Skills', sectionId: 'skills' }),
      Object.freeze({ label: 'Projects', sectionId: 'projects' }),
      Object.freeze({ label: 'Expertise', sectionId: 'expertise' }),
    ]),
  }),
  recruiter: Object.freeze({
    id: 'recruiter',
    label: 'Recruiter',
    targetSection: 'about',
    highlightedSections: Object.freeze(['about', 'expertise']),
    quickLinks: Object.freeze([
      Object.freeze({ label: 'About', sectionId: 'about' }),
      Object.freeze({ label: 'Experience', sectionId: 'expertise' }),
      Object.freeze({ label: 'Credentials', sectionId: 'about' }),
    ]),
  }),
  client: Object.freeze({
    id: 'client',
    label: 'Client',
    targetSection: 'projects',
    highlightedSections: Object.freeze(['projects', 'contact']),
    quickLinks: Object.freeze([
      Object.freeze({ label: 'Projects', sectionId: 'projects' }),
      Object.freeze({ label: 'Services', sectionId: 'contact' }),
      Object.freeze({ label: 'Contact', sectionId: 'contact' }),
    ]),
  }),
});

const PROFILE_LIST = Object.freeze([
  PROFILE_DEFINITIONS.explore,
  PROFILE_DEFINITIONS.developer,
  PROFILE_DEFINITIONS.recruiter,
  PROFILE_DEFINITIONS.client,
]);

function isValidProfileId(profileId) {
  return typeof profileId === 'string' && Object.hasOwn(PROFILE_DEFINITIONS, profileId);
}

function getSafeSessionStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage ?? null;
  } catch {
    return null;
  }
}

function readSessionValue(key) {
  const storage = getSafeSessionStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionValue(key, value) {
  const storage = getSafeSessionStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeSessionValue(key) {
  const storage = getSafeSessionStorage();
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function readInitialSessionState() {
  const storedIntroFlag = readSessionValue(SESSION_STORAGE_KEYS.INTRO_COMPLETED);
  const storedProfileRaw = readSessionValue(SESSION_STORAGE_KEYS.ACTIVE_PROFILE);
  const validProfile = isValidProfileId(storedProfileRaw) ? storedProfileRaw : null;

  // Treat intro as completed if explicitly flagged or a valid profile is stored for this session
  const introCompleted = storedIntroFlag === '1' || (storedIntroFlag !== '0' && validProfile !== null);

  return {
    activeProfile: validProfile,
    isIntroCompleted: introCompleted,
  };
}

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [sessionState, setSessionState] = useState(() => readInitialSessionState());
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState(false);

  const selectProfile = useCallback((profileId) => {
    if (!isValidProfileId(profileId)) return false;

    writeSessionValue(SESSION_STORAGE_KEYS.ACTIVE_PROFILE, profileId);
    writeSessionValue(SESSION_STORAGE_KEYS.INTRO_COMPLETED, '1');

    setSessionState({
      activeProfile: profileId,
      isIntroCompleted: true,
    });
    setIsProfileSwitcherOpen(false);
    return true;
  }, []);

  const skipIntro = useCallback(() => {
    writeSessionValue(SESSION_STORAGE_KEYS.INTRO_COMPLETED, '1');
    removeSessionValue(SESSION_STORAGE_KEYS.ACTIVE_PROFILE);

    setSessionState({
      activeProfile: null,
      isIntroCompleted: true,
    });
    setIsProfileSwitcherOpen(false);
  }, []);

  const switchProfile = useCallback((profileId) => {
    if (!isValidProfileId(profileId)) return false;

    writeSessionValue(SESSION_STORAGE_KEYS.ACTIVE_PROFILE, profileId);
    writeSessionValue(SESSION_STORAGE_KEYS.INTRO_COMPLETED, '1');

    setSessionState((prev) => ({
      ...prev,
      activeProfile: profileId,
      isIntroCompleted: true,
    }));
    setIsProfileSwitcherOpen(false);
    return true;
  }, []);

  const replayIntro = useCallback(() => {
    removeSessionValue(SESSION_STORAGE_KEYS.INTRO_COMPLETED);
    removeSessionValue(SESSION_STORAGE_KEYS.ACTIVE_PROFILE);

    setSessionState({
      activeProfile: null,
      isIntroCompleted: false,
    });
    setIsProfileSwitcherOpen(false);
  }, []);

  const openProfileSwitcher = useCallback(() => {
    setIsProfileSwitcherOpen(true);
  }, []);

  const closeProfileSwitcher = useCallback(() => {
    setIsProfileSwitcherOpen(false);
  }, []);

  const value = useMemo(() => {
    const profileConfig = sessionState.activeProfile
      ? PROFILE_DEFINITIONS[sessionState.activeProfile]
      : null;

    const isSectionHighlighted = (sectionId) =>
      Boolean(profileConfig && profileConfig.highlightedSections.includes(sectionId));

    return {
      activeProfile: sessionState.activeProfile,
      profileConfig,
      profiles: PROFILE_DEFINITIONS,
      profileList: PROFILE_LIST,
      isIntroCompleted: sessionState.isIntroCompleted,
      isProfileSwitcherOpen,
      selectProfile,
      skipIntro,
      switchProfile,
      replayIntro,
      openProfileSwitcher,
      closeProfileSwitcher,
      isSectionHighlighted,
      isValidProfile: isValidProfileId,
    };
  }, [
    sessionState.activeProfile,
    sessionState.isIntroCompleted,
    isProfileSwitcherOpen,
    selectProfile,
    skipIntro,
    switchProfile,
    replayIntro,
    openProfileSwitcher,
    closeProfileSwitcher,
  ]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

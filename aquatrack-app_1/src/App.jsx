// ═════════════════════════════════════════════════════════════════════════
//   <App />
//
//   Root component. Decides whether to show the onboarding flow or the
//   authenticated app (4 tabs). Auth state is persisted in localStorage
//   via lib/onboarding.js — in production this is replaced with a real
//   auth context (JWT in httpOnly cookie + refresh token).
//
//   The user state from onboarding flows down via React context so the
//   Profile screen can read the swimmer + relationship, and trigger
//   sign-out (which resets onboarding state).
// ═════════════════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect } from 'react';
import TabBar from './components/TabBar.jsx';
import SheetHost from './components/SheetHost.jsx';
import LivePage from './pages/Live.jsx';
import ResultsPage from './pages/Results.jsx';
import VideosPage from './pages/Videos.jsx';
import ProfilePage from './pages/Profile.jsx';
import Onboarding from './pages/onboarding/Onboarding.jsx';
import {
  getOnboardedUser,
  saveOnboardedUser,
  clearOnboardedUser,
  startGuestSession,
  isGuestUser,
} from './lib/onboarding.js';

const PAGES = {
  live: LivePage,
  results: ResultsPage,
  videos: VideosPage,
  profile: ProfilePage,
};

// ─── Auth / user context ──────────────────────────────────────────────────
const AuthContext = createContext(null);
export function useAuth() {
  return useContext(AuthContext);
}

// ─── Navigation context — tab switching + bottom-sheet routing ─────────────
const NavContext = createContext(null);
export function useNav() {
  return useContext(NavContext);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore session on mount
  useEffect(() => {
    setUser(getOnboardedUser());
    setReady(true);
  }, []);

  function handleOnboardingComplete(data) {
    saveOnboardedUser(data);
    setUser(data);
  }

  function handleGuest() {
    startGuestSession();
    setUser({ guest: true });
  }

  function handleSignOut() {
    clearOnboardedUser();
    setUser(null);
  }

  // Avoid a flash of either state while we read localStorage
  if (!ready) {
    return <div className="min-h-screen bg-ink" />;
  }

  return (
    <AuthContext.Provider
      value={{ user, isGuest: isGuestUser(user), signOut: handleSignOut }}
    >
      <div
        className="min-h-screen flex justify-center"
        style={{
          background:
            'radial-gradient(130% 90% at 50% 0%, #142850 0%, #0A1628 58%)',
        }}
      >
        <div className="app-shell">
          {user ? (
            <MainApp />
          ) : (
            <Onboarding
              onComplete={handleOnboardingComplete}
              onGuest={handleGuest}
            />
          )}
        </div>
      </div>
    </AuthContext.Provider>
  );
}

// ─── Authenticated app — the 4-tab structure ──────────────────────────────
function MainApp() {
  const [activeTab, setActiveTab] = useState('live');
  const [sheets, setSheets] = useState([]); // stack — enables drill-through + back
  const [videoRequest, setVideoRequest] = useState(null); // deep-link to a video
  const PageComponent = PAGES[activeTab];

  const nav = {
    setTab: (t) => {
      setSheets([]);
      setActiveTab(t);
    },
    openSheet: (descriptor) => setSheets((s) => [...s, descriptor]),
    popSheet: () => setSheets((s) => s.slice(0, -1)),
    closeSheet: () => setSheets([]),
    openVideo: (id) => {
      setSheets([]);
      setVideoRequest(id);
      setActiveTab('videos');
    },
    videoRequest,
    clearVideoRequest: () => setVideoRequest(null),
  };

  const current = sheets[sheets.length - 1];

  return (
    <NavContext.Provider value={nav}>
      <div className="flex-1 overflow-hidden">
        <PageComponent />
      </div>
      <TabBar active={activeTab} onChange={nav.setTab} />
      {current && (
        <SheetHost
          sheet={current}
          nav={nav}
          onBack={sheets.length > 1 ? nav.popSheet : null}
        />
      )}
    </NavContext.Provider>
  );
}

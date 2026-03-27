import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';

import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import FeedAnalyzer from './pages/FeedAnalyzer';
import LiveScout from './pages/LiveScout';
import BiasReport from './pages/BiasReport';
import Recommendations from './pages/Recommendations';

const API_BASE = import.meta.env.VITE_API_BASE || "https://anti-echo-chamber.onrender.com";

// ─── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE}/users`, { username });
      onAuth(res.data.user_id, username);
    } catch (err) {
      setError('Could not connect to the API. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#090B10] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-blue-500/15 border border-blue-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Anti-Echo Chamber</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered cognitive bias detection</p>
        </div>

        {/* Form */}
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-8 space-y-5">
          <div>
            <h2 className="text-white font-semibold text-lg">Enter your username</h2>
            <p className="text-gray-500 text-sm mt-0.5">New users are created automatically.</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="e.g. alice"
              className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-gray-200 text-sm focus:outline-none focus:border-blue-500/40 transition-all"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit" disabled={loading || !username.trim()}
              className="w-full py-3 bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500/25 text-blue-300 font-semibold rounded-xl text-sm transition-all disabled:opacity-40"
            >
              {loading ? 'Connecting...' : 'Enter Dashboard'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [userId, setUserId]       = useState(null);
  const [username, setUsername]   = useState('');
  const [activePage, setActivePage] = useState('overview');
  const [profile, setProfile]     = useState(null);

  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/users/${id ?? userId}/profile`);
      setProfile(res.data);
    } catch { /* no data yet */ }
  };

  useEffect(() => {
    if (userId) fetchProfile(userId);
  }, [userId]);

  const handleAuth = (id, name) => {
    setUserId(id);
    setUsername(name);
  };

  const handleLogout = () => {
    setUserId(null); setUsername(''); setProfile(null); setActivePage('overview');
  };

  if (!userId) return <AuthScreen onAuth={handleAuth} />;

  const PAGE_MAP = {
    overview:        <Overview profile={profile} />,
    analyzer:        <FeedAnalyzer userId={userId} onProfileUpdate={() => fetchProfile(userId)} />,
    scout:           <LiveScout userId={userId} />,
    report:          <BiasReport profile={profile} />,
    recommendations: <Recommendations userId={userId} profile={profile} />,
  };

  return (
    <div className="min-h-screen bg-[#090B10] flex">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        username={username}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="ml-60 flex-1 min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {PAGE_MAP[activePage]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

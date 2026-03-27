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
    } catch {
      setError('Could not connect to the API. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#07080F' }}>

      {/* Ambient background blobs */}
      <div className="absolute pointer-events-none" style={{ top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative w-full max-w-md px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))', border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 0 40px rgba(59,130,246,0.15)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#g)" strokeWidth="2">
              <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-white">Anti-Echo Chamber</h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            AI-powered cognitive bias detection & depolarization
          </p>
        </div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>

          <h2 className="text-white font-semibold text-lg mb-1">Welcome</h2>
          <p className="text-gray-500 text-sm mb-6">Enter any username to continue. New accounts are created automatically.</p>

          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Enter username..."
              className="aec-input w-full px-4 py-3.5"
            />
            {error && (
              <p className="text-red-400 text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full inline-block" />{error}
              </p>
            )}
            <button type="submit" disabled={loading || !username.trim()} className="btn-primary w-full py-3.5 text-sm">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Connecting...
                </span>
              ) : 'Enter Dashboard'}
            </button>
          </form>
        </motion.div>

        {/* Footer info pills */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          {['NLP Bias Detection', 'Live News Analysis', 'Chrome Extension'].map(t => (
            <span key={t} className="badge-blue">{t}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [userId, setUserId]         = useState(null);
  const [username, setUsername]     = useState('');
  const [activePage, setActivePage] = useState('overview');
  const [profile, setProfile]       = useState(null);

  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/users/${id ?? userId}/profile`);
      setProfile(res.data);
    } catch { /* no data yet */ }
  };

  useEffect(() => { if (userId) fetchProfile(userId); }, [userId]);

  const handleAuth = (id, name) => { setUserId(id); setUsername(name); };
  const handleLogout = () => { setUserId(null); setUsername(''); setProfile(null); setActivePage('overview'); };

  if (!userId) return <AuthScreen onAuth={handleAuth} />;

  const PAGE_MAP = {
    overview:        <Overview profile={profile} />,
    analyzer:        <FeedAnalyzer userId={userId} onProfileUpdate={() => fetchProfile(userId)} />,
    scout:           <LiveScout userId={userId} />,
    report:          <BiasReport profile={profile} />,
    recommendations: <Recommendations userId={userId} profile={profile} />,
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#07080F' }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} username={username} onLogout={handleLogout} />
      <main className="ml-64 flex-1 min-h-screen relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)', filter: 'blur(60px)'
        }} />
        <div className="relative max-w-4xl mx-auto px-10 py-10">
          <AnimatePresence mode="wait">
            <motion.div key={activePage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}>
              {PAGE_MAP[activePage]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import axios from 'axios';
import { ShieldAlert, LogOut, ChevronRight, Zap, Target, Eye, User, Radio, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PerspectiveScore from './components/PerspectiveScore';
import BiasPanel from './components/BiasPanel';
import ThoughtMap from './components/ThoughtMap';
import ActivityTimeline from './components/ActivityTimeline';

const API_BASE = "http://localhost:8000";

export default function App() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  
  const [articleText, setArticleText] = useState('');
  const [scoutTopic, setScoutTopic] = useState('');
  const [profile, setProfile] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scouting, setScouting] = useState(false);

  const authenticateUser = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/users`, { username });
      setUserId(res.data.user_id);
      fetchProfileForId(res.data.user_id);
    } catch (err) {
      alert("Could not connect to the API. Is the backend running?");
    }
  };

  const fetchProfileForId = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/users/${id}/profile`);
      setProfile(res.data);
      if (res.data.echo_chamber_detected) fetchRecommendation(id);
      else setRecommendation(null);
    } catch(e) {}
  };

  const fetchRecommendation = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/users/${id}/recommend`);
      setRecommendation(res.data);
    } catch(e) {}
  };

  const trackArticle = async () => {
    if (!userId || !articleText.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/track`, { user_id: userId, text: articleText });
      setArticleText('');
      await fetchProfileForId(userId);
    } catch (err) {}
    setLoading(false);
  };

  const runLiveScout = async () => {
    if (!userId || !scoutTopic.trim()) return;
    setScouting(true);
    try {
      const res = await axios.post(`${API_BASE}/live-scout`, { user_id: userId, topic: scoutTopic });
      setRecommendation({ ...res.data, is_live: true });
    } catch (err) {
      alert("Live Scout failed. Either the topic returned no articles or the backend is not responding.");
    }
    setScouting(false);
  };

  const logout = () => {
    setUserId(null); setUsername(''); setProfile(null); setRecommendation(null);
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0A0C]">
        <div className="absolute inset-0 z-0">
          <div className="absolute w-[800px] h-[800px] bg-teal-900/15 rounded-full blur-[120px] -left-64 top-1/2 -translate-y-1/2"></div>
          <div className="absolute w-[800px] h-[800px] bg-rose-900/10 rounded-full blur-[120px] -right-64 top-1/2 -translate-y-1/2"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-[420px] text-center flex flex-col items-center bg-[#15161A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-10 shadow-2xl"
        >
          <Eye size={42} strokeWidth={1} className="text-[#D0D0D0] mb-5 opacity-90" />
          <h1 className="text-[1.7rem] font-medium tracking-tight text-white mb-2">Anti-Echo Chamber</h1>
          <p className="text-[#8b919e] text-[0.95rem] mb-10 tracking-wide">See beyond your usual feed.</p>
          
          <form onSubmit={authenticateUser} className="w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-[#55565A]" />
              </div>
              <input 
                type="text" placeholder="Enter your username" 
                value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0D0E12] border border-white/5 rounded-lg py-3.5 pl-11 pr-4 text-[#D0D0D0] text-[0.95rem] focus:outline-none focus:border-white/20 focus:bg-[#131418] transition-all placeholder:text-[#55565A]"
              />
            </div>
            <button 
              type="submit" disabled={!username.trim()}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-[#E0E0E0] font-medium py-3.5 rounded-lg flex justify-center items-center transition-all disabled:opacity-40 disabled:hover:bg-white/5"
            >
              Access Dashboard <ChevronRight size={16} strokeWidth={2} className="text-[#888A90] ml-1" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1400px] mx-auto p-4 md:p-8">
      
      {/* Top Navbar */}
      <nav className="glass rounded-2xl p-4 px-6 flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-blue-500" size={28} />
          <span className="font-bold text-xl tracking-tight text-white">Cognitive Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-black/30 border border-white/10 px-4 py-1.5 rounded-full text-sm font-mono text-gray-300">
            Node: {username}
          </span>
          <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Feed Analyzer & Live Scout & Timeline */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Feed Analyzer */}
          <div className="glass-card flex flex-col">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <Zap size={16} className="text-blue-500"/> Feed Analyzer
            </h3>
            <textarea 
              placeholder="Paste article text to detect neural biases..." 
              value={articleText} onChange={(e) => setArticleText(e.target.value)}
              className="w-full h-36 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 resize-none mb-4 text-sm"
            />
            <button 
              onClick={trackArticle} disabled={loading || !articleText.trim()}
              className="w-full bg-white/5 border border-white/10 hover:border-blue-500/40 text-white font-semibold py-3 rounded-xl transition-all hover:bg-blue-500/10 flex justify-center items-center text-sm disabled:opacity-40"
            >
              {loading ? <span className="animate-pulse">Analyzing Semantics...</span> : 'Run Cognitive Inference'}
            </button>
          </div>

          {/* Live Scout */}
          <div className="glass-card flex flex-col">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3 font-mono flex items-center gap-2">
              <Radio size={16} className="text-emerald-400"/> Live Scout
            </h3>
            <p className="text-xs text-gray-500 mb-4">Enter a topic to search live counter-perspective news articles.</p>
            <input 
              type="text" placeholder="e.g. climate change, immigration..." 
              value={scoutTopic} onChange={(e) => setScoutTopic(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-gray-200 focus:outline-none focus:border-emerald-500/40 text-sm mb-3 transition-all"
            />
            <button 
              onClick={runLiveScout} disabled={scouting || !scoutTopic.trim()}
              className="w-full bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-40"
            >
              {scouting ? <span className="animate-pulse">Scouting Live Feed...</span> : <><Radio size={14}/> Scout & Analyze</>}
            </button>
          </div>

          <div className="flex-1">
            <ActivityTimeline historyCount={profile ? profile.articles_read : 0} />
          </div>
        </div>

        {/* Middle Column: Scores & Metrics */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <PerspectiveScore score={profile ? Math.round(100 - (profile.average_cognitive_bias * 100)) : 100} />
          <BiasPanel profile={profile} />
          
          <AnimatePresence>
            {profile?.echo_chamber_detected && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} 
                className="glass-card border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
              >
                <h3 className="text-red-400 font-bold flex items-center gap-2 mb-2 text-sm">
                  <AlertTriangle size={16}/> Echo Chamber Detected
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">{profile.metrics_warning}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Thought Map & Recommendations */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ThoughtMap />

          <div className="glass-card flex-1 flex flex-col">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <Target size={16} className="text-purple-400"/> Opposing Views Engine
            </h3>
            <AnimatePresence mode="wait">
              {recommendation ? (
                <motion.div 
                  key="rec" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-purple-500/10 to-blue-500/5 border border-purple-500/20 rounded-xl p-5 relative overflow-hidden flex flex-col gap-3"
                >
                  {recommendation.is_live && (
                    <span className="inline-flex items-center gap-1.5 self-start bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>LIVE
                    </span>
                  )}
                  {recommendation.publisher && (
                    <span className="text-xs text-gray-500 font-mono">{recommendation.publisher}</span>
                  )}
                  <h4 className="text-white font-semibold text-sm leading-snug">{recommendation.title}</h4>
                  <p className="text-xs text-gray-400 italic leading-relaxed line-clamp-4">"{recommendation.content}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex gap-3 text-xs font-mono text-purple-400">
                      <span>BIAS: {recommendation.cognitive_bias}</span>
                      <span>POL: {recommendation.political_leaning}</span>
                    </div>
                    {recommendation.url && recommendation.url !== '#' && (
                      <a href={recommendation.url} target="_blank" rel="noopener noreferrer" 
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        Read <ExternalLink size={11}/>
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" className="flex-1 flex flex-col items-center justify-center text-center text-sm text-gray-500 border border-dashed border-white/10 rounded-xl p-6 gap-3">
                  <Target size={28} className="text-gray-600"/>
                  <p className="italic text-xs leading-relaxed">Detect an echo chamber or run a <span className="text-emerald-400">Live Scout</span> to see counter-perspective articles here.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

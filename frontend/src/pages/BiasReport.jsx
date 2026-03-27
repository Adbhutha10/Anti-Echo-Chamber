import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Clock, Activity } from 'lucide-react';

function GaugeBar({ label, value, color, description, low = 'Low', high = 'High' }) {
  const pct = Math.round(value * 100);
  const level = pct > 65 ? 'High' : pct > 35 ? 'Moderate' : 'Low';
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-mono" style={{ color }}>{pct}%</span>
          <p className="text-xs text-gray-500">{level}</p>
        </div>
      </div>
      <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>{low}</span><span>{high}</span>
      </div>
    </div>
  );
}

function PoliticsGauge({ value }) {
  const pct = ((value + 1) / 2) * 100;
  const label = value > 0.4 ? 'Strongly Right-Leaning'
    : value > 0.15 ? 'Slightly Right-Leaning'
    : value < -0.4 ? 'Strongly Left-Leaning'
    : value < -0.15 ? 'Slightly Left-Leaning'
    : 'Centrist';

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-white">Political Leaning</p>
          <p className="text-xs text-gray-500 mt-0.5">Your average ideological orientation based on content consumed</p>
        </div>
        <span className="text-sm font-bold text-purple-300">{label}</span>
      </div>
      <div className="relative h-3 bg-gradient-to-r from-blue-700 via-gray-600 to-red-700 rounded-full">
        <motion.div
          initial={{ left: '50%' }} animate={{ left: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-900"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>Left</span><span>Center</span><span>Right</span>
      </div>
    </div>
  );
}

export default function BiasReport({ profile }) {
  const noData = !profile || profile.articles_read === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Bias Report</h1>
        <p className="text-gray-500 text-sm mt-1">Detailed breakdown of your cognitive bias metrics over all analyzed articles.</p>
      </div>

      {noData ? (
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-10 text-center space-y-3">
          <BarChart2 size={36} className="text-gray-600 mx-auto" />
          <p className="text-gray-500">No data yet. Analyze some articles in Feed Analyzer first.</p>
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Articles', value: profile.articles_read, unit: '' },
              { label: 'Avg Bias', value: `${Math.round(profile.average_cognitive_bias * 100)}%`, unit: '' },
              { label: 'Avg Emotion', value: `${Math.round(profile.average_emotional_manipulation * 100)}%`, unit: '' },
            ].map(c => (
              <div key={c.label} className="bg-[#111318] border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
                <p className="text-2xl font-bold text-white">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Gauge Charts */}
          <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 space-y-8">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-blue-400" />
              <h3 className="text-white font-semibold">Metric Gauges</h3>
            </div>

            <GaugeBar
              label="Cognitive Bias"
              value={profile.average_cognitive_bias}
              color={profile.average_cognitive_bias > 0.6 ? '#ef4444' : profile.average_cognitive_bias > 0.35 ? '#f59e0b' : '#10b981'}
              description="Measures how one-sided, selective, or skewed the framing of articles you read tends to be."
              low="Objective" high="Highly Biased"
            />
            <GaugeBar
              label="Emotional Manipulation"
              value={profile.average_emotional_manipulation}
              color={profile.average_emotional_manipulation > 0.5 ? '#f59e0b' : '#10b981'}
              description="Detects use of fear, outrage, and charged rhetoric designed to trigger an emotional reaction rather than inform."
              low="Calm & Factual" high="Highly Charged"
            />
            <PoliticsGauge value={profile.average_political_leaning} />
          </div>

          {/* Interpretation */}
          <div className="bg-[#111318] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <h3 className="text-white font-semibold">Interpretation Guide</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div className="space-y-1">
                <p className="text-emerald-400 font-medium">0–35% Bias — Healthy Range</p>
                <p>Content is largely factual and objective. Multiple perspectives are represented.</p>
              </div>
              <div className="space-y-1">
                <p className="text-amber-400 font-medium">35–65% Bias — Moderate Concern</p>
                <p>Some editorial slant detected. You may want to diversify your sources.</p>
              </div>
              <div className="space-y-1">
                <p className="text-red-400 font-medium">65%+ Bias — Echo Chamber Risk</p>
                <p>Content is highly one-sided. The system will recommend opposing viewpoints.</p>
              </div>
              <div className="space-y-1">
                <p className="text-purple-400 font-medium">Political Leaning Score</p>
                <p>Ranges from -1 (Far Left) to +1 (Far Right). Values near 0 indicate balanced consumption.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

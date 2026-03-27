import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Activity } from 'lucide-react';

function GaugeBar({ label, value, color, description, low = 'Low', high = 'High' }) {
  const pct = Math.round(value * 100);
  const level = pct > 65 ? 'High' : pct > 35 ? 'Moderate' : 'Low';
  const levelColor = pct > 65 ? '#ef4444' : pct > 35 ? '#f59e0b' : '#10b981';
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        </div>
        <div className="text-right ml-4">
          <p className="text-3xl font-bold font-mono" style={{ color }}>{pct}%</p>
          <p className="text-[10px] font-semibold" style={{ color: levelColor }}>{level}</p>
        </div>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.1, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }} />
        {/* Glow overlay */}
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)` }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-700"><span>{low}</span><span>{high}</span></div>
    </div>
  );
}

function PoliticsGauge({ value }) {
  const pct = ((value + 1) / 2) * 100;
  const label = value > 0.4 ? 'Strongly Right' : value > 0.15 ? 'Slightly Right' : value < -0.4 ? 'Strongly Left' : value < -0.15 ? 'Slightly Left' : 'Centrist';
  const labelColor = value > 0.15 ? '#ef4444' : value < -0.15 ? '#3b82f6' : '#10b981';
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-white">Political Leaning</p>
          <p className="text-xs text-gray-600 mt-0.5">Your average ideological orientation based on content consumed</p>
        </div>
        <div className="text-right ml-4">
          <p className="text-xl font-bold" style={{ color: labelColor }}>{label}</p>
          <p className="text-[10px] font-mono text-gray-600">{value.toFixed(3)}</p>
        </div>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg, #1d4ed8, #475569, #b91c1c)' }}>
        <motion.div animate={{ left: `${pct}%` }} transition={{ duration: 1, type: 'spring', stiffness: 120 }}
          className="absolute top-1/2 w-5 h-5 rounded-full -translate-y-1/2 -translate-x-1/2"
          style={{ background: 'white', boxShadow: `0 0 14px ${labelColor}`, border: '2.5px solid #07080F' }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-700"><span>Far Left</span><span>Center</span><span>Far Right</span></div>
    </div>
  );
}

const INTERPRETATION = [
  { range: '0–35% Bias', label: 'Healthy Range', color: '#10b981', body: 'Content is largely factual. Multiple perspectives are represented.' },
  { range: '35–65% Bias', label: 'Moderate Concern', color: '#f59e0b', body: 'Some editorial slant detected. Consider diversifying your sources.' },
  { range: '65%+ Bias', label: 'Echo Chamber Risk', color: '#ef4444', body: 'Highly one-sided content. The engine will recommend opposing viewpoints.' },
  { range: 'Political Score', label: '-1 to +1 Scale', color: '#a78bfa', body: 'Values near 0 indicate balanced consumption across the political spectrum.' },
];

export default function BiasReport({ profile }) {
  const noData = !profile || profile.articles_read === 0;
  return (
    <div className="space-y-7">
      <div>
        <span className="badge-blue">Analytics</span>
        <h1 className="text-3xl font-bold text-white mt-2">Bias Report</h1>
        <p className="text-gray-500 text-sm mt-1.5">Detailed breakdown of your cognitive bias metrics averaged across all analyzed articles.</p>
      </div>

      {noData ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center space-y-3">
          <BarChart2 size={40} className="text-gray-700" />
          <p className="text-gray-500 font-medium">No data yet</p>
          <p className="text-gray-600 text-sm">Analyze some articles in the Feed Analyzer to populate this report.</p>
        </div>
      ) : (
        <>
          {/* Top stat row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Articles Read', val: profile.articles_read, color: '#60a5fa' },
              { label: 'Avg Bias Score', val: `${Math.round(profile.average_cognitive_bias * 100)}%`, color: profile.average_cognitive_bias > 0.6 ? '#ef4444' : profile.average_cognitive_bias > 0.35 ? '#f59e0b' : '#10b981' },
              { label: 'Avg Emotion', val: `${Math.round(profile.average_emotional_manipulation * 100)}%`, color: profile.average_emotional_manipulation > 0.5 ? '#f59e0b' : '#10b981' },
            ].map(c => (
              <div key={c.label} className="stat-card text-center">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">{c.label}</p>
                <p className="text-3xl font-bold font-mono" style={{ color: c.color }}>{c.val}</p>
              </div>
            ))}
          </div>

          {/* Gauge Chart Card */}
          <div className="card space-y-8">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-blue-400" />
              <h3 className="text-white font-semibold">Metric Gauges</h3>
              <span className="badge-blue ml-auto">Averaged Across All Articles</span>
            </div>
            <GaugeBar label="Cognitive Bias" value={profile.average_cognitive_bias}
              color={profile.average_cognitive_bias > 0.6 ? '#ef4444' : profile.average_cognitive_bias > 0.35 ? '#f59e0b' : '#10b981'}
              description="How one-sided or slanted the framing of content you consume tends to be"
              low="Objective & Neutral" high="Highly Biased" />
            <div className="gradient-divider" />
            <GaugeBar label="Emotional Manipulation" value={profile.average_emotional_manipulation}
              color={profile.average_emotional_manipulation > 0.5 ? '#f59e0b' : '#10b981'}
              description="Detects use of fear, outrage, and charged rhetoric in the content you read"
              low="Calm & Factual" high="Highly Charged" />
            <div className="gradient-divider" />
            <PoliticsGauge value={profile.average_political_leaning} />
          </div>

          {/* Interpretation Guide */}
          <div className="card space-y-4">
            <h3 className="text-white font-semibold text-sm">Interpretation Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTERPRETATION.map(i => (
                <div key={i.range} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="w-1 rounded-full flex-shrink-0" style={{ background: i.color }} />
                  <div>
                    <p className="text-xs font-bold mb-0.5" style={{ color: i.color }}>{i.range} — {i.label}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{i.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

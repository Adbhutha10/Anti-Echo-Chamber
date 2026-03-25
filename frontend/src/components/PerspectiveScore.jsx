import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function PerspectiveScore({ score = 65 }) {
  const data = [{ name: 'Score', value: score, fill: '#3b82f6' }];
  return (
    <div className="glass-card flex flex-col items-center justify-center h-full relative">
      <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2 font-mono">Perspective Diversity</h3>
      <div className="h-40 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={15} data={data} startAngle={180} endAngle={0}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} clockWise dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{score}%</span>
        </div>
      </div>
    </div>
  );
}

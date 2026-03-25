import React from 'react';
import { motion } from 'framer-motion';

export default function BiasPanel({ profile }) {
  const biasValue = profile ? profile.average_cognitive_bias : 0.65;
  const tiltValue = profile ? profile.average_political_leaning : 0.40;
  
  const isHighBias = biasValue > 0.5;
  const biasColor = isHighBias ? 'bg-danger' : 'bg-safe';
  const biasGlow = isHighBias ? 'shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'shadow-[0_0_15px_rgba(16,185,129,0.5)]';

  const isRightTilt = tiltValue > 0;
  const tiltColor = isRightTilt ? 'bg-danger' : 'bg-primary';

  return (
    <div className="glass-card flex flex-col gap-6">
      <h3 className="text-gray-400 text-sm uppercase tracking-wider font-mono">Bias Detection Engine</h3>
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span>Confirmation Bias</span>
          <span className={isHighBias ? "text-danger font-bold" : "text-safe font-bold"}>
            {isHighBias ? "HIGH" : "BALANCED"}
          </span>
        </div>
        <div className="w-full bg-borderDark h-3 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${biasValue * 100}%` }}
            transition={{ duration: 1 }}
            className={`h-full ${biasColor} ${biasGlow}`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span>Political Tilt</span>
          <span className="font-bold">{tiltValue === 0 ? "CENTER" : (isRightTilt ? "RIGHT" : "LEFT")}</span>
        </div>
        <div className="w-full bg-borderDark h-3 rounded-full overflow-hidden flex">
          <div className="w-1/2 flex justify-end">
            {!isRightTilt && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.abs(tiltValue) * 100}%` }}
                className="h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              />
            )}
          </div>
          <div className="w-px h-full bg-gray-500 z-10"></div>
          <div className="w-1/2 flex justify-start">
            {isRightTilt && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${tiltValue * 100}%` }}
                className="h-full bg-danger shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

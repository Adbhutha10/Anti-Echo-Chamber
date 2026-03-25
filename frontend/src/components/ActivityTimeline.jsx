import React from 'react';
import { Activity, Beaker, FileText } from 'lucide-react';

export default function ActivityTimeline({ historyCount }) {
  return (
    <div className="glass-card flex flex-col h-full bg-background/50">
      <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-6 font-mono">Neural Activity Timeline</h3>
      
      <div className="relative border-l border-borderDark ml-4 space-y-6">
        <div className="relative pl-6">
          <div className="absolute -left-3.5 top-0.5 bg-background border border-primary text-primary rounded-full p-1.5 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Activity size={14} />
          </div>
          <p className="text-sm font-bold text-gray-200">System Initialization</p>
          <p className="text-xs text-gray-400 mt-1">Cognitive engine linked to profile</p>
        </div>

        <div className="relative pl-6">
          <div className="absolute -left-3.5 top-0.5 bg-background border border-accent text-accent rounded-full p-1.5 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
            <Beaker size={14} />
          </div>
          <p className="text-sm font-bold text-gray-200">Data Inference</p>
          <p className="text-xs text-gray-400 mt-1">Calculated trajectory arrays</p>
        </div>

        {historyCount > 0 && (
          <div className="relative pl-6">
            <div className="absolute -left-3.5 top-0.5 bg-background border border-safe text-safe rounded-full p-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <FileText size={14} />
            </div>
            <p className="text-sm font-bold text-gray-200">Analyzed {historyCount} posts</p>
            <p className="text-xs text-gray-400 mt-1">Updated perspective scoring</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Border Security' }, style: { background: '#0B0F1A', border: '1px solid #ef4444', color: 'white', borderRadius: '8px', padding: '10px' } },
  { id: '2', position: { x: 100, y: 150 }, data: { label: 'Sovereignty' }, style: { background: '#0B0F1A', border: '1px solid #3b82f6', color: 'white', borderRadius: '8px' } },
  { id: '3', position: { x: 400, y: 150 }, data: { label: 'Humanitarian' }, style: { background: '#0B0F1A', border: '1px solid #10b981', color: 'white', borderRadius: '8px' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3b82f6' } }, 
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#10b981' } }
];

export default function ThoughtMap() {
  return (
    <div className="glass-card h-[350px] flex flex-col">
      <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-4 font-mono">Cognitive Thought Map</h3>
      <div className="flex-1 rounded-xl overflow-hidden border border-borderDark relative">
        <ReactFlow nodes={initialNodes} edges={initialEdges} fitView className="bg-background/40">
          <Background color="#3b82f6" gap={20} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}

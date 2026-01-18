import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CollaborationVisualization({ workingGroups, tasks }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let i = 0; i < h; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }

    // Draw working groups as nodes
    const nodes = workingGroups.map((group, idx) => ({
      id: group.id,
      x: 100 + (idx % 3) * 300,
      y: 100 + Math.floor(idx / 3) * 200,
      size: 30 + (group.agent_members?.length || 0) * 5,
      label: group.group_name,
      color: `hsl(${idx * 60}, 70%, 50%)`
    }));

    // Draw connections between groups
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
    ctx.lineWidth = 2;
    workingGroups.forEach((group, idx) => {
      if (idx < workingGroups.length - 1) {
        const from = nodes[idx];
        const to = nodes[idx + 1];
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      // Node circle
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fill();

      // Node border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label.substring(0, 15), node.x, node.y);
    });

    // Draw task count indicators
    tasks.forEach((task) => {
      if (task.working_group_id) {
        const group = workingGroups.find(g => g.id === task.working_group_id);
        if (group) {
          const node = nodes.find(n => n.id === group.id);
          if (node) {
            ctx.fillStyle = task.status === 'completed' ? '#10b981' : '#f59e0b';
            ctx.font = '10px sans-serif';
            ctx.fillText(`${task.progress_percentage}%`, node.x, node.y + node.size + 20);
          }
        }
      }
    });
  }, [workingGroups, tasks]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full bg-slate-950 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />
      <div className="absolute bottom-4 left-4 text-xs text-slate-400 bg-slate-900/80 p-3 rounded">
        <p>Node size = Agent count • Lines = Connections</p>
        <p>Colors = Working Groups</p>
      </div>
    </motion.div>
  );
}
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function PermissionVisualization({ roles }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Hubs
    const hubs = ['Communications', 'Devices', 'Banking', 'AI Lab', 'Simulation'];
    const hubX = 150;
    const hubSpacing = (h - 100) / (hubs.length - 1);

    // Draw hubs on left
    hubs.forEach((hub, i) => {
      const y = 50 + i * hubSpacing;
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(hubX, y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hub.substring(0, 4), hubX, y);
    });

    // Draw roles on right
    const roleX = w - 100;
    const roleSpacing = (h - 100) / Math.max(roles.length - 1, 1);

    roles.forEach((role, i) => {
      const y = 50 + i * roleSpacing;
      const color = role.role_type === 'admin' ? '#ef4444' : role.role_type === 'custom' ? '#22c55e' : '#3b82f6';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(roleX, y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(role.role_name.substring(0, 3), roleX, y);
    });

    // Draw permission connections
    hubs.forEach((hub, hubIdx) => {
      const hubY = 50 + hubIdx * hubSpacing;
      roles.forEach((role, roleIdx) => {
        const roleY = 50 + roleIdx * roleSpacing;
        const hubKey = hub.toLowerCase().replace(' ', '');
        const hubPermissions = role.hub_permissions?.[hubKey] || [];
        if (hubPermissions.length > 0) {
          const opacity = Math.min(hubPermissions.length / 3, 1);
          ctx.strokeStyle = `rgba(100, 200, 255, ${opacity * 0.6})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(hubX + 20, hubY);
          ctx.lineTo(roleX - 20, roleY);
          ctx.stroke();
        }
      });
    });

    // Legend
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Hubs', 20, h - 20);
    ctx.fillText('Roles', w - 100, h - 20);
    ctx.fillStyle = '#64748b';
    ctx.fillText('Line = Permission assigned', 100, h - 20);
  }, [roles]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full bg-slate-950 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full h-full"
      />
    </motion.div>
  );
}
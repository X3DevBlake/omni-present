import React from 'react';

export default function HolographicCore({ className = "" }) {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <div className="relative w-64 h-64">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 opacity-50 blur-xl animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>
    </div>
  );
}
import React from 'react';

// Animated SVG icon wrapper with 4D-style effects
export function AnimatedIcon({ children, size = 24, className = '', glow = true, color = 'currentColor', animate = true }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40"
          style={{ background: color === 'currentColor' ? '#a855f7' : color }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animate ? 'animate-pulse' : ''}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {children}
      </svg>
    </div>
  );
}

// Omni-Present Main Logo SVG
export function OmniPresentLogoSVG({ size = 48, className = '', animated = true }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="omni-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="omni-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <filter id="omni-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {animated && (
          <>
            <animateTransform
              id="rotate-outer"
              attributeName="transform"
              type="rotate"
              from="0 60 60"
              to="360 60 60"
              dur="20s"
              repeatCount="indefinite"
            />
          </>
        )}
      </defs>

      {/* Outer ring */}
      <circle cx="60" cy="60" r="55" stroke="url(#omni-grad-1)" strokeWidth="1.5" opacity="0.4" fill="none">
        {animated && <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="20s" repeatCount="indefinite" />}
      </circle>

      {/* Middle ring */}
      <circle cx="60" cy="60" r="45" stroke="url(#omni-grad-2)" strokeWidth="1" opacity="0.3" fill="none" strokeDasharray="8 4">
        {animated && <animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="15s" repeatCount="indefinite" />}
      </circle>

      {/* Infinity symbol */}
      <g filter="url(#omni-glow)">
        <path
          d="M60 60 C60 45, 80 35, 90 50 C100 65, 80 75, 60 60 C60 45, 40 35, 30 50 C20 65, 40 75, 60 60Z"
          stroke="url(#omni-grad-1)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        >
          {animated && (
            <animate attributeName="stroke-dashoffset" from="200" to="0" dur="3s" repeatCount="indefinite" />
          )}
        </path>
      </g>

      {/* Core dot */}
      <circle cx="60" cy="60" r="6" fill="url(#omni-grad-1)" opacity="0.9">
        {animated && <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />}
      </circle>

      {/* Orbital dots */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <circle
          key={i}
          cx={60 + Math.cos((angle * Math.PI) / 180) * 35}
          cy={60 + Math.sin((angle * Math.PI) / 180) * 35}
          r="2"
          fill={i % 2 === 0 ? '#a855f7' : '#22d3ee'}
          opacity="0.7"
        >
          {animated && (
            <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
          )}
        </circle>
      ))}

      {/* 4D tesseract hint lines */}
      <g opacity="0.15" stroke="#a855f7" strokeWidth="0.5">
        <line x1="30" y1="30" x2="90" y2="30" />
        <line x1="30" y1="90" x2="90" y2="90" />
        <line x1="30" y1="30" x2="30" y2="90" />
        <line x1="90" y1="30" x2="90" y2="90" />
        <line x1="40" y1="40" x2="80" y2="40" />
        <line x1="40" y1="80" x2="80" y2="80" />
        <line x1="40" y1="40" x2="40" y2="80" />
        <line x1="80" y1="40" x2="80" y2="80" />
        <line x1="30" y1="30" x2="40" y2="40" />
        <line x1="90" y1="30" x2="80" y2="40" />
        <line x1="30" y1="90" x2="40" y2="80" />
        <line x1="90" y1="90" x2="80" y2="80" />
      </g>
    </svg>
  );
}

// Tesseract Icon SVG
export function TesseractIcon({ size = 24, color = '#a855f7', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="tess-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* Outer cube */}
      <rect x="2" y="2" width="14" height="14" rx="1" stroke="url(#tess-grad)" strokeWidth="1.5" opacity="0.5" />
      {/* Inner cube */}
      <rect x="8" y="8" width="14" height="14" rx="1" stroke="url(#tess-grad)" strokeWidth="1.5" opacity="0.8" />
      {/* Connection lines */}
      <line x1="2" y1="2" x2="8" y2="8" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="16" y1="2" x2="22" y2="8" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="2" y1="16" x2="8" y2="22" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="16" y1="16" x2="22" y2="22" stroke={color} strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

// Earth Icon SVG
export function EarthIcon({ size = 24, color = '#22d3ee', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="12" cy="12" rx="4" ry="10" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <ellipse cx="12" cy="8" rx="8" ry="2" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <ellipse cx="12" cy="16" rx="7" ry="2" stroke={color} strokeWidth="0.8" opacity="0.3" />
      {/* Continents hint */}
      <path d="M8 6 Q10 5 11 7 Q12 9 10 10 Q8 10 7 8Z" fill={color} opacity="0.3" />
      <path d="M14 8 Q16 7 17 9 Q16 12 14 11Z" fill={color} opacity="0.25" />
      <path d="M10 14 Q12 13 13 15 Q12 17 10 16Z" fill={color} opacity="0.2" />
    </svg>
  );
}

// Neural Network Icon SVG
export function NeuralIcon({ size = 24, color = '#ec4899', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Nodes */}
      <circle cx="4" cy="6" r="2" fill={color} opacity="0.7" />
      <circle cx="4" cy="18" r="2" fill={color} opacity="0.7" />
      <circle cx="12" cy="4" r="2" fill={color} opacity="0.8" />
      <circle cx="12" cy="12" r="2.5" fill={color} opacity="1" />
      <circle cx="12" cy="20" r="2" fill={color} opacity="0.8" />
      <circle cx="20" cy="8" r="2" fill={color} opacity="0.7" />
      <circle cx="20" cy="16" r="2" fill={color} opacity="0.7" />
      {/* Connections */}
      <line x1="6" y1="6" x2="10" y2="4" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="6" y1="6" x2="10" y2="12" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="6" y1="18" x2="10" y2="12" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="6" y1="18" x2="10" y2="20" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="14" y1="4" x2="18" y2="8" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="14" y1="12" x2="18" y2="8" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="14" y1="12" x2="18" y2="16" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="14" y1="20" x2="18" y2="16" stroke={color} strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

// Webhook Icon SVG
export function WebhookIcon({ size = 24, color = '#f97316', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2 L12 8 M12 16 L12 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M2 12 L8 12 M16 12 L22 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="1.5" fill={color} />
      {/* Signal waves */}
      <path d="M18 6 Q20 8 18 10" stroke={color} strokeWidth="1" opacity="0.4" fill="none" />
      <path d="M20 4 Q23 8 20 12" stroke={color} strokeWidth="1" opacity="0.25" fill="none" />
      <path d="M6 14 Q4 16 6 18" stroke={color} strokeWidth="1" opacity="0.4" fill="none" />
      <path d="M4 12 Q1 16 4 20" stroke={color} strokeWidth="1" opacity="0.25" fill="none" />
    </svg>
  );
}

// Agent Icon SVG
export function AgentIcon({ size = 24, color = '#a855f7', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="agent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="8" r="4" stroke="url(#agent-grad)" strokeWidth="1.5" />
      <circle cx="12" cy="8" r="1.5" fill={color} opacity="0.8" />
      <path d="M4 20 C4 15 8 12 12 12 C16 12 20 15 20 20" stroke="url(#agent-grad)" strokeWidth="1.5" strokeLinecap="round" />
      {/* AI indicator */}
      <path d="M9 6 L12 3 L15 6" stroke={color} strokeWidth="1" opacity="0.5" />
      <circle cx="8" cy="7" r="0.8" fill="#22d3ee" opacity="0.8" />
      <circle cx="16" cy="7" r="0.8" fill="#22d3ee" opacity="0.8" />
    </svg>
  );
}

// Dimension Gate Icon
export function DimensionGateIcon({ size = 24, color = '#a855f7', className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1" opacity="0.3" />
      <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" opacity="0.6" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" opacity="0.9" />
      <circle cx="12" cy="12" r="1" fill={color} />
      {/* Dimensional cross */}
      <line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="0.5" opacity="0.2" />
      <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="0.5" opacity="0.2" />
      <line x1="4" y1="4" x2="20" y2="20" stroke={color} strokeWidth="0.5" opacity="0.15" />
      <line x1="20" y1="4" x2="4" y2="20" stroke={color} strokeWidth="0.5" opacity="0.15" />
    </svg>
  );
}

export default {
  OmniPresentLogoSVG,
  TesseractIcon,
  EarthIcon,
  NeuralIcon,
  WebhookIcon,
  AgentIcon,
  DimensionGateIcon,
  AnimatedIcon,
};

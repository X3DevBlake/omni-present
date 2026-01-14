import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AuroraBackground({ children, className = "" }) {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const currentContainer = containerRef.current;
      if (!currentContainer) return;
      
      const rect = currentContainer.getBoundingClientRect();
      if (rect && rect.width && rect.height) {
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Base dark layer */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      
      {/* Aurora gradient orbs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, #00f5ff 0%, transparent 70%)',
          left: `${mousePosition.x * 100 - 40}%`,
          top: `${mousePosition.y * 100 - 40}%`,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-25 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
          right: `${(1 - mousePosition.x) * 100 - 30}%`,
          top: `${mousePosition.y * 100 - 20}%`,
        }}
        animate={{
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[80px]"
        style={{
          background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
          left: '20%',
          bottom: '-10%',
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[60px]"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          right: '10%',
          bottom: '20%',
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Animated Grid overlay */}
      <motion.div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.15) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '50px 50px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Data stream lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
        <defs>
          <linearGradient id="streamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00f5ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#00f5ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={`${i * 25}%`}
            y1="0%"
            x2={`${i * 25 + 50}%`}
            y2="100%"
            stroke="url(#streamGradient)"
            strokeWidth="2"
            opacity="0.3"
          />
        ))}
      </svg>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
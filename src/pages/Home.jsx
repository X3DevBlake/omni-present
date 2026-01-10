import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ChevronDown } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import HeroSection from '../components/omni/HeroSection';
import FeatureGrid from '../components/omni/FeatureGrid';
import CTASection from '../components/omni/CTASection';
import LiveDataFeed from '../components/world/LiveDataFeed';
import Interactive3DVisual from '../components/features/Interactive3DVisual';
import OmniPresentLogo from '../components/omni/OmniPresentLogo';

export default function Home() {
  return (
    <AuroraBackground className="min-h-screen">
      <HeroSection />
      
      {/* Live Data Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Real-Time <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Intelligence</span>
            </h2>
            <p className="text-white/60">Live metrics from our global AI network</p>
          </motion.div>
          <LiveDataFeed onDataUpdate={(data) => console.log('Live data:', data)} />
        </div>
      </section>

      <FeatureGrid />
      
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Interactive <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">3D Features</span>
            </h2>
            <p className="text-white/60 text-lg">Explore our platform's capabilities in an immersive 3D environment</p>
          </motion.div>
          
          <Interactive3DVisual />
        </div>
      </section>

      {/* Immersive 3D Ecosystem */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32">
                <OmniPresentLogo />
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              The <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Omni-Present</span> Ecosystem
            </h2>
            <p className="text-white/60 text-lg">A living, breathing network of AI intelligence</p>
          </motion.div>
          
          <div className="h-[700px] bg-black/20 rounded-2xl overflow-hidden border border-cyan-500/30 relative">
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Animated network visualization */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 700">
                <defs>
                  <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00f5ff" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#00f5ff" />
                  </linearGradient>
                </defs>
                
                {/* Central core */}
                <motion.g
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ transformOrigin: '500px 350px' }}
                >
                  <circle cx="500" cy="350" r="80" fill="none" stroke="#00f5ff" strokeWidth="2" opacity="0.6" />
                  <circle cx="500" cy="350" r="60" fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.6" />
                  <circle cx="500" cy="350" r="40" fill="url(#nodeGlow)" />
                </motion.g>

                {/* Orbiting nodes */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  const radius = 200;
                  const x = 500 + Math.cos(angle) * radius;
                  const y = 350 + Math.sin(angle) * radius;
                  const colors = ['#00f5ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
                  const color = colors[i % colors.length];
                  
                  return (
                    <g key={i}>
                      <motion.line
                        x1="500"
                        y1="350"
                        x2={x}
                        y2={y}
                        stroke="url(#lineGradient)"
                        strokeWidth="1"
                        opacity="0.3"
                        animate={{
                          opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.25,
                        }}
                      />
                      <motion.circle
                        cx={x}
                        cy={y}
                        r="12"
                        fill={color}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.16,
                        }}
                        style={{ transformOrigin: `${x}px ${y}px` }}
                      />
                      <circle cx={x} cy={y} r="20" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
                    </g>
                  );
                })}

                {/* Particle ring */}
                {[...Array(50)].map((_, i) => {
                  const angle = (i / 50) * Math.PI * 2;
                  const radius = 140;
                  const x = 500 + Math.cos(angle) * radius;
                  const y = 350 + Math.sin(angle) * radius;
                  
                  return (
                    <motion.circle
                      key={`particle-${i}`}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#00f5ff"
                      animate={{
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.04,
                      }}
                    />
                  );
                })}
              </svg>
            </div>
            
            {/* Overlay Text */}
            <div className="absolute inset-0 pointer-events-none flex items-end p-8">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <div className="text-white font-bold text-xl mb-2">12 Active Nodes</div>
                <div className="text-cyan-400 text-sm">Processing 247 zeptoseconds per frame</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </AuroraBackground>
  );
}
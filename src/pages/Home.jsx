import React from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ChevronDown } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import HeroSection from '../components/omni/HeroSection';
import FeatureGrid from '../components/omni/FeatureGrid';
import CTASection from '../components/omni/CTASection';
import LiveDataFeed from '../components/world/LiveDataFeed';
import Interactive3DFeatures from '../components/features/Interactive3DFeatures';
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
          
          <Interactive3DFeatures />
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
            <Canvas camera={{ position: [0, 8, 20], fov: 75 }}>
              <color attach="background" args={['#000000']} />
              <fog attach="fog" args={['#000000', 10, 50]} />
              
              <ambientLight intensity={0.4} />
              <pointLight position={[15, 15, 15]} intensity={2} color="#00f5ff" />
              <pointLight position={[-15, -10, -15]} intensity={1.5} color="#a855f7" />
              <spotLight position={[0, 20, 0]} angle={0.3} intensity={1} color="#ec4899" castShadow />
              
              <Stars radius={150} depth={60} count={5000} factor={6} fade speed={2} />
              
              {/* Central Core */}
              <Float speed={1.5} rotationIntensity={1} floatIntensity={0.5}>
                <mesh castShadow>
                  <dodecahedronGeometry args={[2.5, 0]} />
                  <meshStandardMaterial
                    color="#00f5ff"
                    emissive="#00f5ff"
                    emissiveIntensity={0.8}
                    wireframe
                    transparent
                    opacity={0.9}
                  />
                </mesh>
                <mesh>
                  <torusGeometry args={[3, 0.1, 16, 100]} />
                  <meshStandardMaterial
                    color="#a855f7"
                    emissive="#a855f7"
                    emissiveIntensity={0.6}
                  />
                </mesh>
              </Float>

              {/* Orbiting Nodes */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const radius = 8;
                const colors = ['#00f5ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
                const color = colors[i % colors.length];
                
                return (
                  <Float key={i} speed={2 + Math.random()} rotationIntensity={0.4} floatIntensity={0.8}>
                    <mesh 
                      position={[
                        Math.cos(angle) * radius, 
                        Math.sin(i * 0.5) * 3, 
                        Math.sin(angle) * radius
                      ]}
                      castShadow
                    >
                      <octahedronGeometry args={[0.6, 0]} />
                      <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.7}
                        metalness={0.8}
                        roughness={0.2}
                      />
                    </mesh>
                    {/* Connection lines */}
                    <mesh position={[Math.cos(angle) * radius / 2, 0, Math.sin(angle) * radius / 2]}>
                      <cylinderGeometry args={[0.02, 0.02, radius, 8]} />
                      <meshBasicMaterial color={color} transparent opacity={0.3} />
                    </mesh>
                  </Float>
                );
              })}

              {/* Particle Ring */}
              {Array.from({ length: 50 }).map((_, i) => {
                const angle = (i / 50) * Math.PI * 2;
                const radius = 5;
                return (
                  <mesh key={`particle-${i}`} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="#00f5ff" transparent opacity={0.6} />
                  </mesh>
                );
              })}

              <OrbitControls 
                enableZoom={true} 
                autoRotate 
                autoRotateSpeed={1}
                minDistance={10}
                maxDistance={30}
              />
            </Canvas>
            
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
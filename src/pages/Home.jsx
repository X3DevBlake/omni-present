import React from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import AuroraBackground from '../components/omni/AuroraBackground';
import HeroSection from '../components/omni/HeroSection';
import FeatureGrid from '../components/omni/FeatureGrid';
import CTASection from '../components/omni/CTASection';
import LiveDataFeed from '../components/world/LiveDataFeed';
import Interactive3DFeatures from '../components/features/Interactive3DFeatures';

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
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              The <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Omni-Present</span> Ecosystem
            </h2>
            <p className="text-white/60 text-lg">A living, breathing network of AI intelligence</p>
          </motion.div>
          
          <div className="h-[600px] bg-black/20 rounded-2xl overflow-hidden border border-white/10">
            <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
              
              <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
                <mesh>
                  <icosahedronGeometry args={[2, 1]} />
                  <meshStandardMaterial
                    color="#00f5ff"
                    emissive="#00f5ff"
                    emissiveIntensity={0.5}
                    wireframe
                  />
                </mesh>
              </Float>

              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                  <Float key={i} speed={3} rotationIntensity={0.2}>
                    <mesh position={[Math.cos(angle) * 6, Math.sin(i) * 2, Math.sin(angle) * 6]}>
                      <sphereGeometry args={[0.5, 16, 16]} />
                      <meshStandardMaterial
                        color={['#a855f7', '#ec4899', '#10b981'][i % 3]}
                        emissive={['#a855f7', '#ec4899', '#10b981'][i % 3]}
                        emissiveIntensity={0.4}
                      />
                    </mesh>
                  </Float>
                );
              })}

              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>
        </div>
      </section>

      <CTASection />
    </AuroraBackground>
  );
}
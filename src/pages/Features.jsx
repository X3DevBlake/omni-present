import React from 'react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import FeatureGrid from '../components/omni/FeatureGrid';
import Interactive3DFeatures from '../components/features/Interactive3DFeatures';

export default function Features() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="pt-32 pb-16 px-6">
        <motion.div
          className="max-w-7xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Experience the
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Future</span>
            </h1>
            <p className="text-white/60 text-lg max-w-3xl mx-auto">
              Explore our revolutionary AI platform through an immersive 3D experience. Interact with features, visualize capabilities, and discover endless possibilities.
            </p>
          </div>

          <Interactive3DFeatures />
        </motion.div>

        <FeatureGrid />
      </div>
    </AuroraBackground>
  );
}
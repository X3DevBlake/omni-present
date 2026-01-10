import React from 'react';
import { motion } from 'framer-motion';
import GlobalMapDashboard from '../components/3d/GlobalMapDashboard';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function GlobalMap() {
  return (
    <AuroraBackground className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 max-w-[1600px] mx-auto"
      >
        <GlobalMapDashboard />
      </motion.div>
    </AuroraBackground>
  );
}
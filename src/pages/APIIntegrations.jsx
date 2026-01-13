import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import APIIntegrationHub from '../components/integrations/APIIntegrationHub';
import { motion } from 'framer-motion';
import { Link } from 'lucide-react';

export default function APIIntegrations() {
  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Link className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold text-white">API Integrations</h1>
          </div>
          <p className="text-white/60 text-lg">
            Connect your AI ecosystem to the world's most powerful services
          </p>
        </motion.div>

        <APIIntegrationHub />
      </div>
    </AuroraBackground>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import MediaShowcase3D from '../components/showcase/MediaShowcase3D';
import { Film, Box, Image, Sparkles } from 'lucide-react';

export default function EnhancedMediaHub() {
  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl">
              <Film className="w-8 h-8 text-pink-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Enhanced Media Hub</h1>
              <p className="text-white/60">Interactive videos, 3D models, and rich media experiences</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MediaShowcase3D />
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <div className="bg-gradient-to-br from-black/40 to-black/20 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Film className="w-6 h-6 text-cyan-400" />
              <h3 className="text-white font-bold">Interactive Videos</h3>
            </div>
            <p className="text-white/60 text-sm">
              Full video controls with play, pause, seek, and fullscreen capabilities
            </p>
          </div>

          <div className="bg-gradient-to-br from-black/40 to-black/20 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Box className="w-6 h-6 text-purple-400" />
              <h3 className="text-white font-bold">3D Models</h3>
            </div>
            <p className="text-white/60 text-sm">
              Rotate, zoom, and interact with real-time 3D visualizations
            </p>
          </div>

          <div className="bg-gradient-to-br from-black/40 to-black/20 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Image className="w-6 h-6 text-green-400" />
              <h3 className="text-white font-bold">Rich Images</h3>
            </div>
            <p className="text-white/60 text-sm">
              High-quality, interactive image galleries with zoom and filters
            </p>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}
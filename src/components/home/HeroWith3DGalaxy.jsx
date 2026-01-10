import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const EnhancedFinancialGalaxy3DWithNews = lazy(() => 
  import('../3d/EnhancedFinancialGalaxy3DWithNews').catch(() => ({ default: () => null }))
);

export default function HeroWith3DGalaxy() {
  return (
    <div className="relative w-full h-[600px] md:h-[800px] overflow-hidden rounded-3xl border border-cyan-500/30 bg-black/40">
      {/* 3D Background */}
      <Suspense fallback={
        <div className="w-full h-full bg-gradient-to-br from-cyan-900/20 to-purple-900/20 flex items-center justify-center">
          <div className="text-white/60">Loading 3D visualization...</div>
        </div>
      }>
        <div className="absolute inset-0">
          <EnhancedFinancialGalaxy3DWithNews isHero={true} />
        </div>
      </Suspense>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center z-10 backdrop-blur-sm bg-black/30 p-8 rounded-2xl max-w-2xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Financial <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Intelligence</span> Redefined
          </h1>
          <p className="text-white/70 text-lg mb-6">
            Navigate the cosmos of wealth with AI-powered insights
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={createPageUrl('EnhancedOmniBank')}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Explore Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
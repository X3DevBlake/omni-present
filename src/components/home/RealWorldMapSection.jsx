import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const RealWorldMapVisualization3D = lazy(() =>
  import('../3d/RealWorldMapVisualization3D').catch(() => ({ default: () => null }))
);

export default function RealWorldMapSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <MapPin className="w-10 h-10 text-cyan-400" />
            Global <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Intelligence Map</span>
          </h2>
          <p className="text-white/60">Track agent locations and market hotspots worldwide</p>
        </motion.div>

        <div className="h-[600px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-black/40">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center text-white/60">
              Loading map visualization...
            </div>
          }>
            <RealWorldMapVisualization3D isPublic={true} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
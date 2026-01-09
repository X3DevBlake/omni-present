import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Image as ImageIcon, CheckCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function DataAnnotation() {
  const datasets = [
    { id: 1, name: 'Urban Navigation Dataset', images: 1240, annotated: 856, progress: 69 },
    { id: 2, name: 'Object Recognition Set', images: 3400, annotated: 3400, progress: 100 },
    { id: 3, name: 'Agent Behavior Corpus', images: 890, annotated: 234, progress: 26 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Data Annotation</h1>
          <p className="text-white/60">Label and prepare training datasets</p>
        </motion.div>

        <div className="grid gap-6">
          {datasets.map((dataset, i) => (
            <motion.div key={dataset.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Tag className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{dataset.name}</h3>
                    <p className="text-white/60 text-sm">{dataset.images} images • {dataset.annotated} annotated</p>
                  </div>
                </div>
                {dataset.progress === 100 && (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                )}
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Progress</span>
                  <span className="text-white font-bold">{dataset.progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${dataset.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${dataset.progress}%` }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}
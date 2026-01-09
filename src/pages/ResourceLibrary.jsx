import React from 'react';
import { motion } from 'framer-motion';
import { Book, FileText, Video, Download } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function ResourceLibrary() {
  const resources = [
    { id: 1, title: 'AI Agent Development Guide', type: 'PDF', size: '2.4 MB', downloads: 1240 },
    { id: 2, title: 'Blueprint Architecture Tutorial', type: 'Video', duration: '45 min', views: 3420 },
    { id: 3, title: 'Multi-Agent Systems Textbook', type: 'PDF', size: '8.1 MB', downloads: 890 },
    { id: 4, title: 'Device Integration Workshop', type: 'Video', duration: '1h 20min', views: 2100 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Resource Library</h1>
          <p className="text-white/60">Access textbooks, videos, and study materials</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {resources.map((resource, i) => (
            <motion.div key={resource.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-black/50 transition-all cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${resource.type === 'Video' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                  {resource.type === 'Video' ? <Video className="w-7 h-7 text-red-400" /> : <FileText className="w-7 h-7 text-blue-400" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-2">{resource.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-white/60 mb-3">
                    <span>{resource.type}</span>
                    {resource.size && <span>•</span>}
                    {resource.size && <span>{resource.size}</span>}
                    {resource.duration && <span>{resource.duration}</span>}
                  </div>
                  <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-500/30 text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {resource.type === 'Video' ? 'Watch' : 'Download'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}
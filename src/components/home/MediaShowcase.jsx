import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function MediaShowcase({ limit = 6 }) {
  const { data: media = [] } = useQuery({
    queryKey: ['homeMedia'],
    queryFn: () => base44.entities.MediaAsset.list().catch(() => [])
  });

  const displayMedia = (media || [])
    .filter(m => m && (m.source === 'unsplash' || m.source === 'pexels'))
    .slice(0, limit);

  if (!displayMedia || displayMedia.length === 0) return null;

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
            <ImageIcon className="w-10 h-10 text-pink-400" />
            Platform <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Showcase</span>
          </h2>
          <p className="text-white/60">Explore the visual richness of our ecosystem</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMedia.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative h-64 rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <h3 className="text-white font-bold">{item.title}</h3>
                  {item.description && (
                    <p className="text-white/70 text-sm mt-1 line-clamp-2">{item.description}</p>
                  )}
                  {item.media_type === 'video' && (
                    <div className="flex items-center gap-2 mt-2 text-cyan-400 text-sm">
                      <Play className="w-4 h-4" />
                      Video
                    </div>
                  )}
                </div>
              </div>

              {/* Play Button for Videos */}
              {item.media_type === 'video' && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-500/30 backdrop-blur-sm flex items-center justify-center border border-cyan-400">
                    <Play className="w-8 h-8 text-cyan-400 fill-cyan-400" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
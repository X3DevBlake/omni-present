import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function AvatarBaseSelector({ bases, selectedBase, onSelectBase }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {bases.map(base => (
        <motion.div
          key={base.id}
          whileHover={{ scale: 1.05 }}
          onClick={() => onSelectBase(base)}
          className={`bg-white/5 border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedBase?.id === base.id ? 'border-cyan-400' : 'border-white/10 hover:border-white/20'
          }`}
        >
          {base.thumbnail_url ? (
            <img src={base.thumbnail_url} alt={base.name} className="w-full h-32 object-cover rounded mb-2" />
          ) : (
            <div className="w-full h-32 bg-white/10 rounded flex items-center justify-center mb-2">
              <User className="w-12 h-12 text-white/40" />
            </div>
          )}
          <p className="text-white text-sm font-semibold text-center">{base.name}</p>
          {base.description && (
            <p className="text-white/60 text-xs text-center mt-1">{base.description}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
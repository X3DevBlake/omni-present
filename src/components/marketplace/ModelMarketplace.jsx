import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ModelMarketplace() {
  const [models] = useState([
    { name: 'GPT-4 Fine-tuned', price: 299, rating: 4.8, downloads: 1234, category: 'NLP' },
    { name: 'Vision Classifier Pro', price: 199, rating: 4.6, downloads: 892, category: 'Vision' },
    { name: 'Sentiment Analyzer', price: 149, rating: 4.9, downloads: 2341, category: 'NLP' },
    { name: 'Object Detector v2', price: 249, rating: 4.7, downloads: 1567, category: 'Vision' },
  ]);

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-purple-400" />
        Model Marketplace
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {models.map((model, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="bg-black/20 rounded-lg p-4 border border-white/10"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-semibold">{model.name}</h4>
                <div className="text-purple-400 text-xs">{model.category}</div>
              </div>
              <div className="text-green-400 font-bold">${model.price}</div>
            </div>
            <div className="flex items-center gap-3 mb-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white">{model.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4 text-cyan-400" />
                <span className="text-white/60">{model.downloads.toLocaleString()}</span>
              </div>
            </div>
            <Button size="sm" className="w-full bg-purple-500/20 hover:bg-purple-500/30">
              Purchase Model
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
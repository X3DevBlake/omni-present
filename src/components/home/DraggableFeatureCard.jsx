import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GripVertical } from 'lucide-react';

export default function DraggableFeatureCard({ feature, index, isDragging, onDragStart, onDragEnd, onDragOver, onDrop }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver?.(index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop?.(index);
  };

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`relative overflow-hidden rounded-xl cursor-move transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <Link to={createPageUrl(feature.link)}>
        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700 h-full hover:border-purple-500 transition-all">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white`}>
                {feature.icon}
              </div>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-slate-400"
                >
                  <GripVertical className="w-4 h-4" />
                </motion.div>
              )}
            </div>
            <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">{feature.description}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
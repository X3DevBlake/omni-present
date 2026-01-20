import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EcosystemGraph3D from './EcosystemGraph3D';
import InteractiveMetricsGalaxy3D from './InteractiveMetricsGalaxy3D';
import RealTimeActivityStream3D from './RealTimeActivityStream3D';

export default function DataVisualizationCarousel({ ecosystemData, activities }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visualizations = [
    {
      title: 'Ecosystem Map',
      component: <EcosystemGraph3D graphData={ecosystemData} />
    },
    {
      title: 'Metrics Galaxy',
      component: <InteractiveMetricsGalaxy3D />
    },
    {
      title: 'Activity Stream',
      component: <RealTimeActivityStream3D activities={activities} />
    }
  ];

  const next = () => setCurrentIndex((prev) => (prev + 1) % visualizations.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + visualizations.length) % visualizations.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">3D Visualizations</h3>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={prev}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={next}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Card className="bg-white/10 border-white/20 backdrop-blur-md overflow-hidden">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-white text-lg font-semibold mb-4">
                {visualizations[currentIndex].title}
              </h4>
              {visualizations[currentIndex].component}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-4">
            {visualizations.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'bg-cyan-400 w-8' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
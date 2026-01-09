import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuroraBackground from '../components/omni/AuroraBackground';
import TechShowcase from '../components/omni/TechShowcase';
import Immersive3DTechnology from '../components/3d/Immersive3DTechnology';

export default function Technology() {
  const navigate = useNavigate();

  return (
    <AuroraBackground className="min-h-screen">
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            className="mb-8 p-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </motion.button>

          <Immersive3DTechnology />
          <TechShowcase />
        </div>
      </div>
    </AuroraBackground>
  );
}
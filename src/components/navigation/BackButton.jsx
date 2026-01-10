import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show back button on home page
  if (location.pathname === '/' || location.pathname === '/Home') {
    return null;
  }

  return (
    <motion.button
      onClick={() => navigate(-1)}
      whileHover={{ scale: 1.1, x: -5 }}
      whileTap={{ scale: 0.95 }}
      className="fixed left-4 top-4 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/50 border border-white/20 hover:border-white/50 transition-all"
      title="Go back"
    >
      <ChevronLeft className="w-6 h-6 text-white" />
    </motion.button>
  );
}
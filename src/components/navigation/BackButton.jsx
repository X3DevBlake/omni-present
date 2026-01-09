import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ to, label = 'Back' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.button
      onClick={handleBack}
      whileHover={{ scale: 1.05, x: -5 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white font-semibold transition-all"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </motion.button>
  );
}
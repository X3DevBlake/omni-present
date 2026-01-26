import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

/**
 * BackExitControls
 * - placement: 'nav' (inline in navigation) or 'top-right' (floating)
 * - Hidden on Home page
 */
export default function BackExitControls({ placement = 'nav' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const current = (location.pathname.split('/').pop() || 'Home').toLowerCase();

  if (current === 'home') return null;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(createPageUrl('Home'));
  };
  const handleExit = () => navigate(createPageUrl('Home'));

  if (placement === 'top-right') {
    return (
      <div className="fixed right-4 top-4 z-60 flex items-center gap-2">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={handleBack}
          className="rounded-full p-2 bg-black/60 border border-white/10 shadow-lg" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={handleExit}
          className="rounded-full p-2 bg-gradient-to-r from-red-600 to-pink-600 shadow-lg" aria-label="Exit">
          <X className="w-5 h-5 text-white" />
        </motion.button>
      </div>
    );
  }

  // Inline nav placement
  return (
    <div className="hidden md:flex items-center gap-2">
      <motion.button whileHover={{ scale: 1.02 }} onClick={handleBack}
        className="p-1 rounded-md hover:bg-white/10" aria-label="Back">
        <ArrowLeft className="w-5 h-5 text-white" />
      </motion.button>

      <motion.button whileHover={{ scale: 1.02 }} onClick={handleExit}
        className="p-1 rounded-md hover:bg-red-600/60" aria-label="Exit">
        <X className="w-5 h-5 text-white" />
      </motion.button>
    </div>
  );
}
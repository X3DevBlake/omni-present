import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass } from 'lucide-react';
import EnhancedImmersiveNav from './EnhancedImmersiveNav';

export default function ImmersiveNavToggle() {
  const [showNav, setShowNav] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setShowNav(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Compass className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EnhancedImmersiveNav onClose={() => setShowNav(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
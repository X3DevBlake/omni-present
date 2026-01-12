import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ColorPicker({ colors, selectedColor, onColorSelect }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {colors.map((color, i) => {
        const colorHex = typeof color === 'string' ? color : color.hex;
        const isSelected = selectedColor === colorHex;
        
        return (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onColorSelect(colorHex)}
            className="relative w-8 h-8 rounded-full border-2 border-white/20"
            style={{ backgroundColor: colorHex }}
          >
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-4 h-4 text-white drop-shadow-lg" />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
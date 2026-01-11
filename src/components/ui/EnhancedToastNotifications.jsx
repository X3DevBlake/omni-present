import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, XCircle, Sparkles } from 'lucide-react';

export const enhancedToast = {
  success: (message, details) => ({
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    message,
    details,
    color: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30'
  }),
  
  error: (message, details) => ({
    icon: <XCircle className="w-5 h-5 text-red-400" />,
    message,
    details,
    color: 'from-red-500/20 to-pink-500/20',
    border: 'border-red-500/30'
  }),
  
  info: (message, details) => ({
    icon: <Info className="w-5 h-5 text-blue-400" />,
    message,
    details,
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30'
  }),
  
  warning: (message, details) => ({
    icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    message,
    details,
    color: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/30'
  }),
  
  aiInsight: (message, details) => ({
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    message,
    details,
    color: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30'
  })
};

export function EnhancedToast({ type, message, details }) {
  const config = enhancedToast[type] || enhancedToast.info;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-gradient-to-r ${config.color} border ${config.border} backdrop-blur-xl rounded-xl p-4 shadow-xl max-w-md`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="text-white font-medium mb-1">{message}</p>
          {details && <p className="text-white/60 text-sm">{details}</p>}
        </div>
      </div>
    </motion.div>
  );
}
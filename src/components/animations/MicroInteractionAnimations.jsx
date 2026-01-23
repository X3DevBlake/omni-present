import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export const ButtonClickAnimation = ({ children, onClick, variant = 'default' }) => (
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-lg ${variant === 'primary' ? 'bg-indigo-600' : 'bg-gray-700'}`}
  >
    {children}
  </motion.button>
);

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizeMap = { sm: 16, md: 24, lg: 32 };
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Loader2 size={sizeMap[size]} className="text-indigo-400" />
    </motion.div>
  );
};

export const SuccessCheckmark = () => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: 'spring', stiffness: 200 }}
  >
    <CheckCircle className="w-12 h-12 text-green-400" />
  </motion.div>
);

export const ErrorCross = () => (
  <motion.div
    initial={{ scale: 0, rotate: 180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: 'spring', stiffness: 200 }}
  >
    <XCircle className="w-12 h-12 text-red-400" />
  </motion.div>
);

export const PulsingAlert = ({ type = 'warning' }) => {
  const Icon = type === 'warning' ? AlertCircle : Info;
  const color = type === 'warning' ? 'text-yellow-400' : 'text-blue-400';
  
  return (
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Icon className={`w-6 h-6 ${color}`} />
    </motion.div>
  );
};

export const InputFocusGlow = ({ children, focused }) => (
  <motion.div
    animate={{
      boxShadow: focused
        ? '0 0 20px rgba(99, 102, 241, 0.6), 0 0 40px rgba(99, 102, 241, 0.3)'
        : '0 0 0px rgba(99, 102, 241, 0)'
    }}
    transition={{ duration: 0.3 }}
    className="rounded-lg"
  >
    {children}
  </motion.div>
);

export const ToggleSwitch = ({ enabled, onToggle }) => (
  <motion.div
    onClick={onToggle}
    className={`w-14 h-7 rounded-full cursor-pointer ${enabled ? 'bg-indigo-600' : 'bg-gray-600'}`}
    animate={{ backgroundColor: enabled ? '#4f46e5' : '#4b5563' }}
  >
    <motion.div
      className="w-5 h-5 bg-white rounded-full mt-1"
      animate={{ x: enabled ? 32 : 4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    />
  </motion.div>
);

export const NotificationSlide = ({ message, type = 'info' }) => {
  const colors = {
    success: 'from-green-500 to-emerald-500',
    error: 'from-red-500 to-rose-500',
    warning: 'from-yellow-500 to-orange-500',
    info: 'from-blue-500 to-cyan-500'
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className={`bg-gradient-to-r ${colors[type]} p-4 rounded-lg shadow-xl`}
    >
      <p className="text-white font-bold">{message}</p>
    </motion.div>
  );
};
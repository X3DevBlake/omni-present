import React, { useState, useEffect } from 'react';
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TimeBasedGreeting({ userName }) {
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
      setIcon(<Sunrise className="w-8 h-8 text-orange-400" />);
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
      setIcon(<Sun className="w-8 h-8 text-yellow-400" />);
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good Evening');
      setIcon(<Sunset className="w-8 h-8 text-orange-500" />);
    } else {
      setGreeting('Good Night');
      setIcon(<Moon className="w-8 h-8 text-blue-300" />);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 mb-8"
    >
      {icon}
      <div>
        <h2 className="text-3xl font-bold text-white">
          {greeting}, {userName || 'Explorer'}
        </h2>
        <p className="text-white/60">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import AgentCognitionHub from '../components/cognition/AgentCognitionHub';

export default function Phase6AgentCognition() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <AgentCognitionHub />
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function AdvancedMessageRouter({ from, to, message }) {
  const analyzeMessageType = (content) => {
    const keywords = {
      query: ['what', 'how', 'find', 'search', 'get', '?'],
      command: ['execute', 'run', 'perform', 'start', 'deploy'],
      report: ['report', 'analysis', 'found', 'discovered', 'identified'],
      alert: ['warning', 'error', 'critical', 'alert', 'urgent'],
      request: ['need', 'require', 'request', 'please', 'can you']
    };

    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => content.toLowerCase().includes(word))) {
        return type;
      }
    }
    return 'general';
  };

  const messageType = analyzeMessageType(message.content);

  const typeColors = {
    query: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
    command: 'from-red-500/20 to-orange-500/20 border-red-500/30 text-red-300',
    report: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300',
    alert: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-300',
    request: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300',
    general: 'from-white/10 to-white/5 border-white/20 text-white'
  };

  const routingBehavior = {
    query: { priority: 'normal', timeout: 5000 },
    command: { priority: 'high', timeout: 3000 },
    report: { priority: 'low', timeout: 10000 },
    alert: { priority: 'critical', timeout: 1000 },
    request: { priority: 'normal', timeout: 5000 },
    general: { priority: 'normal', timeout: 5000 }
  };

  const routing = routingBehavior[messageType];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-gradient-to-r ${typeColors[messageType]} border rounded-lg p-3 relative overflow-hidden`}
    >
      {/* Priority indicator */}
      <div className="absolute top-2 right-2 text-xs font-bold uppercase opacity-60">
        {routing.priority}
      </div>

      {/* Message flow visualization */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="font-semibold text-sm">{from?.name || 'Agent'}</span>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-4 h-4 opacity-60" />
          </motion.div>
          <span className="font-semibold text-sm opacity-70">{to?.name || 'System'}</span>
        </div>
        <span className="text-xs px-2 py-1 bg-black/30 rounded uppercase font-bold">
          {messageType}
        </span>
      </div>

      {/* Message content */}
      <p className="text-xs opacity-80 mb-2">{message.content}</p>

      {/* Response format indicator */}
      <div className="flex gap-2 text-xs">
        <span className="bg-black/30 px-2 py-1 rounded">
          ⏱ {routing.timeout}ms
        </span>
        <span className="bg-black/30 px-2 py-1 rounded">
          📨 {message.protocol || 'default'}
        </span>
      </div>

      {/* Animated routing pulse */}
      <motion.div
        className="absolute inset-0 border border-current rounded opacity-0"
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}
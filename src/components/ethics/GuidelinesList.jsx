import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';

export default function GuidelinesList() {
  const { data: guidelines = [] } = useQuery({
    queryKey: ['ethicsGuidelines'],
    queryFn: () => base44.entities.EthicsGuideline.list().catch(() => []),
  });

  const categoryColors = {
    transparency: 'from-blue-500 to-cyan-500',
    fairness: 'from-green-500 to-emerald-500',
    safety: 'from-red-500 to-orange-500',
    privacy: 'from-purple-500 to-pink-500',
    accountability: 'from-yellow-500 to-amber-500',
    sustainability: 'from-green-500 to-teal-500',
  };

  const severityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
    critical: '⚫',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Shield className="w-6 h-6 text-cyan-400" />
        Active Guidelines
      </h3>

      {guidelines.filter(g => g.status === 'active').length === 0 ? (
        <div className="text-center py-8 text-white/40">No active guidelines</div>
      ) : (
        guidelines.filter(g => g.status === 'active').map((guideline, idx) => (
          <motion.div
            key={guideline.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-gradient-to-r ${categoryColors[guideline.category]} bg-opacity-10 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-bold">{guideline.title}</h4>
                  <span className="text-lg">{severityIcons[guideline.severity]}</span>
                </div>
                <p className="text-white/60 text-sm">{guideline.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize bg-gradient-to-r ${categoryColors[guideline.category]} text-white`}>
                {guideline.category}
              </span>
            </div>

            {guideline.applicable_to?.length > 0 && (
              <div className="text-xs text-white/50">
                Applies to: {guideline.applicable_to.join(', ')}
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}
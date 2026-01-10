import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, TrendingUp } from 'lucide-react';

export default function ViolationsDashboard() {
  const { data: violations = [] } = useQuery({
    queryKey: ['ethicsViolations'],
    queryFn: () => base44.entities.AgentEthicsViolation.list().catch(() => []),
  });

  const statuses = {
    open: 'bg-red-500/20 text-red-400 border-red-500/30',
    investigating: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
    acknowledged: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const openViolations = violations.filter(v => v.status === 'open').length;
  const criticalViolations = violations.filter(v => v.severity === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4"
        >
          <p className="text-white/60 text-sm">Total Violations</p>
          <p className="text-2xl font-bold text-white mt-1">{violations.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
        >
          <p className="text-red-400 text-sm">Open Issues</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{openViolations}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4"
        >
          <p className="text-orange-400 text-sm">Critical</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{criticalViolations}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <p className="text-green-400 text-sm">Resolved</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {violations.filter(v => v.status === 'resolved').length}
          </p>
        </motion.div>
      </div>

      {/* Violations List */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Recent Violations
        </h3>

        {violations.length === 0 ? (
          <div className="text-center py-8 text-white/40">No violations recorded</div>
        ) : (
          <div className="space-y-3">
            {violations.slice(0, 5).map((violation, idx) => (
              <motion.div
                key={violation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`border-l-4 p-3 rounded ${statuses[violation.status]}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm">{violation.violation_type}</p>
                    <p className="text-xs mt-1">{violation.description}</p>
                    <p className="text-xs mt-2">Agent: {violation.agent_id}</p>
                  </div>
                  <span className="text-xs font-semibold capitalize whitespace-nowrap ml-2">
                    {violation.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
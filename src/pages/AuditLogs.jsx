import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, User } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AuditLogs() {
  const logs = [
    { id: 1, action: 'User login', user: 'alice@example.com', timestamp: '2026-01-09 14:23:11', ip: '192.168.1.1' },
    { id: 2, action: 'Blueprint created', user: 'bob@example.com', timestamp: '2026-01-09 13:45:32', ip: '192.168.1.5' },
    { id: 3, action: 'Device updated', user: 'alice@example.com', timestamp: '2026-01-09 12:10:55', ip: '192.168.1.1' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Audit Logs</h1>
          <p className="text-white/60">Comprehensive activity tracking</p>
        </motion.div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left text-white/70 text-sm font-medium p-4">Action</th>
                <th className="text-left text-white/70 text-sm font-medium p-4">User</th>
                <th className="text-left text-white/70 text-sm font-medium p-4">Timestamp</th>
                <th className="text-left text-white/70 text-sm font-medium p-4">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <motion.tr key={log.id} className="border-b border-white/5 hover:bg-white/5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                  <td className="p-4 text-white">{log.action}</td>
                  <td className="p-4 text-white/70">{log.user}</td>
                  <td className="p-4 text-white/70">{log.timestamp}</td>
                  <td className="p-4 text-white/70">{log.ip}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuroraBackground>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Key, CheckCircle, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function LicenseManagement() {
  const licenses = [
    { id: 1, product: 'Enterprise Plan', seats: 50, used: 48, expiry: '2027-01-09', status: 'active' },
    { id: 2, product: 'Advanced Devices', seats: 100, used: 87, expiry: '2026-12-15', status: 'active' },
    { id: 3, product: 'Campus Premium', seats: 500, used: 342, expiry: '2026-06-30', status: 'expiring' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">License Management</h1>
          <p className="text-white/60">Track software and device licenses</p>
        </motion.div>

        <div className="space-y-4">
          {licenses.map((license, i) => (
            <motion.div key={license.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Key className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{license.product}</h3>
                    <p className="text-white/60 text-sm">Expires: {license.expiry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {license.status === 'active' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    license.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {license.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/60">Seats Used: {license.used} / {license.seats}</div>
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${license.used / license.seats > 0.9 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${(license.used / license.seats) * 100}%` }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}
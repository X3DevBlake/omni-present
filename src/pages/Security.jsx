import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Smartphone, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function Security() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, device: 'MacBook Pro', location: 'San Francisco, CA', ip: '192.168.1.100', current: true, lastActive: new Date() },
    { id: 2, device: 'iPhone 15', location: 'San Francisco, CA', ip: '192.168.1.101', current: false, lastActive: new Date(Date.now() - 3600000) }
  ]);

  const toggleTwoFactor = () => {
    setTwoFactor(!twoFactor);
    toast.success(twoFactor ? '2FA disabled' : '2FA enabled');
  };

  const revokeSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    toast.success('Session revoked');
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Security</h1>
              <p className="text-white/60">Protect your account</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-white font-bold">Two-Factor Authentication</h3>
                  <p className="text-white/60 text-sm">Add an extra layer of security</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={twoFactor} onChange={toggleTwoFactor} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
            {twoFactor && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-white/80">
                  2FA is active. You'll need to enter a code from your authenticator app when signing in.
                </div>
              </div>
            )}
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-purple-400" />
              <h3 className="text-white font-bold">Change Password</h3>
            </div>
            <button className="px-6 py-3 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-xl hover:bg-purple-500/30">
              Update Password
            </button>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-yellow-400" />
              <h3 className="text-white font-bold">Active Sessions ({sessions.length})</h3>
            </div>
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="bg-white/5 rounded-lg p-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold">{session.device}</h4>
                      {session.current && (
                        <div className="px-2 py-0.5 bg-green-500/20 border border-green-500/40 text-green-300 rounded text-xs">
                          Current
                        </div>
                      )}
                    </div>
                    <div className="text-white/60 text-sm space-y-1">
                      <div>{session.location}</div>
                      <div>IP: {session.ip}</div>
                      <div>Last active: {session.lastActive.toLocaleString()}</div>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => revokeSession(session.id)}
                      className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg text-sm hover:bg-red-500/30"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-bold mb-2">Delete Account</h3>
                <p className="text-white/70 mb-4 text-sm">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg text-sm hover:bg-red-500/30">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
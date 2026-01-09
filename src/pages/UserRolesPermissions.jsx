import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Lock, Edit } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function UserRolesPermissions() {
  const roles = [
    { id: 1, name: 'Admin', users: 5, permissions: ['all'] },
    { id: 2, name: 'Developer', users: 12, permissions: ['read', 'write', 'deploy'] },
    { id: 3, name: 'Viewer', users: 31, permissions: ['read'] }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Roles & Permissions</h1>
          <p className="text-white/60">Manage access control for your organization</p>
        </motion.div>

        <div className="space-y-4">
          {roles.map((role, i) => (
            <motion.div key={role.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{role.name}</h3>
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {role.users} users
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}
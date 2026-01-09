import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Trash2, Edit2, Lock, Unlock } from 'lucide-react';

export default function AgentRoleManager() {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Lead Trader',
      agent: 'Trading Bot',
      permissions: ['execute_trades', 'risk_assessment', 'order_placement'],
      trust_level: 'high'
    },
    {
      id: 2,
      name: 'Analyst',
      agent: 'Analytics Bot',
      permissions: ['data_access', 'report_generation', 'forecasting'],
      trust_level: 'medium'
    },
    {
      id: 3,
      name: 'Executor',
      agent: 'Execution Bot',
      permissions: ['execute_trades', 'order_placement'],
      trust_level: 'high'
    }
  ]);

  const [showNewRole, setShowNewRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    agent: '',
    permissions: [],
    trust_level: 'medium'
  });

  const availablePermissions = [
    'data_access',
    'execute_trades',
    'risk_assessment',
    'order_placement',
    'report_generation',
    'forecasting',
    'communication',
    'resource_allocation'
  ];

  const togglePermission = (perm) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const addRole = () => {
    if (!newRole.name || !newRole.agent) return;
    setRoles(prev => [...prev, { ...newRole, id: Date.now() }]);
    setNewRole({ name: '', agent: '', permissions: [], trust_level: 'medium' });
    setShowNewRole(false);
  };

  const deleteRole = (id) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const getTrustColor = (level) => {
    const colors = {
      low: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/30',
      medium: 'bg-blue-500/30 text-blue-300 border-blue-500/30',
      high: 'bg-green-500/30 text-green-300 border-green-500/30'
    };
    return colors[level] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Add Role Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowNewRole(!showNewRole)}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/50 rounded-2xl text-purple-300 font-semibold flex items-center justify-center gap-2 transition-all"
      >
        <Plus className="w-5 h-5" />
        Create New Role
      </motion.button>

      {/* New Role Form */}
      <AnimatePresence>
        {showNewRole && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6"
          >
            <h3 className="text-white font-bold mb-4">Define New Role</h3>

            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm block mb-2">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Senior Analyst"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 text-sm"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm block mb-2">Assigned Agent</label>
                <select
                  value={newRole.agent}
                  onChange={(e) => setNewRole({ ...newRole, agent: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm"
                >
                  <option value="">Select agent...</option>
                  <option value="Trading Bot">Trading Bot</option>
                  <option value="Analytics Bot">Analytics Bot</option>
                  <option value="Execution Bot">Execution Bot</option>
                </select>
              </div>

              <div>
                <label className="text-white/70 text-sm block mb-3">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map(perm => (
                    <motion.button
                      key={perm}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => togglePermission(perm)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                        newRole.permissions.includes(perm)
                          ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {newRole.permissions.includes(perm) ? '✓ ' : ''}{perm.replace(/_/g, ' ')}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm block mb-2">Trust Level</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(level => (
                    <button
                      key={level}
                      onClick={() => setNewRole({ ...newRole, trust_level: level })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all border capitalize ${
                        newRole.trust_level === level
                          ? 'bg-green-500/30 border-green-500/50 text-green-300'
                          : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={addRole}
                  className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 font-semibold text-sm transition-all"
                >
                  Create Role
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowNewRole(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold text-sm transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roles List */}
      <div className="space-y-3">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Active Roles ({roles.length})
        </h3>

        <AnimatePresence>
          {roles.map((role, idx) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 group hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-bold">{role.name}</h4>
                  <p className="text-white/60 text-sm">Agent: {role.agent}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getTrustColor(role.trust_level)}`}>
                  {role.trust_level} trust
                </span>
              </div>

              <div className="mb-3">
                <p className="text-white/70 text-xs font-semibold mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map(perm => (
                    <span key={perm} className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">
                      {perm.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all">
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => deleteRole(role.id)}
                  className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AgentRoleManagement({ selectedAgent }) {
  const [roles, setRoles] = useState([
    { id: '1', name: 'Trader', permissions: ['execute_trade', 'view_market', 'analyze_data'] },
    { id: '2', name: 'Researcher', permissions: ['view_data', 'generate_reports', 'request_data'] }
  ]);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({ name: '', permissions: [] });

  const allPermissions = [
    'execute_trade', 'cancel_trade', 'view_market', 'analyze_data', 'generate_reports',
    'request_data', 'send_alert', 'modify_strategy', 'access_portfolio', 'manage_devices'
  ];

  const togglePermission = (permission) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const saveRole = () => {
    if (!newRole.name.trim()) return;
    
    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...newRole, id: r.id } : r));
    } else {
      setRoles([...roles, { ...newRole, id: Date.now().toString() }]);
    }
    
    setNewRole({ name: '', permissions: [] });
    setEditingRole(null);
  };

  const deleteRole = (id) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Role Editor */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 h-fit">
        <h3 className="text-white font-bold mb-4">
          {editingRole ? 'Edit Role' : 'Create Role'}
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            placeholder="Role name"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500"
          />

          <div>
            <label className="text-white/70 text-sm mb-2 block">Permissions</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allPermissions.map(perm => (
                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRole.permissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="w-4 h-4"
                  />
                  <span className="text-white/70 text-sm">{perm.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveRole}
              className="flex-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold transition-colors"
            >
              Save
            </button>
            {editingRole && (
              <button
                onClick={() => {
                  setEditingRole(null);
                  setNewRole({ name: '', permissions: [] });
                }}
                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-semibold transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Roles List */}
      <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Agent Roles ({roles.length})</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {roles.map((role, idx) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <h4 className="text-white font-semibold">{role.name}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions.slice(0, 3).map(perm => (
                        <span key={perm} className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded">
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setNewRole(role);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-white/60" />
                    </button>
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
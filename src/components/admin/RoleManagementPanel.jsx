import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, Lock, Loader, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RoleManagementPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));

    loadUsers();
    loadAuditLogs();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await base44.entities.User.list('-created_date', 100);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const logs = await base44.entities.AuditLog.list('-created_date', 50);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const updateUserRole = async (userEmail, newRole) => {
    try {
      await base44.auth.updateMe({ role: newRole });
      loadUsers();
      loadAuditLogs();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const ROLES = [
    { value: 'admin', label: 'Admin', description: 'Full system access' },
    { value: 'trader', label: 'Trader', description: 'Execute trades and manage portfolio' },
    { value: 'analyst', label: 'Analyst', description: 'View analytics and reports' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="w-3 h-3" /> Users
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-1">
            <Lock className="w-3 h-3" /> Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-bold text-sm">{user.full_name}</p>
                      <p className="text-white/60 text-xs">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-cyan-500/20 px-2 py-1 rounded">
                      <Shield className="w-3 h-3 text-cyan-400" />
                      <p className="text-cyan-300 text-xs font-bold capitalize">{user.role}</p>
                    </div>
                  </div>

                  {selectedUser?.email === user.email && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t border-white/10 pt-3 space-y-2"
                    >
                      <p className="text-white text-xs font-semibold">Change Role</p>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLES.map(role => (
                          <button
                            key={role.value}
                            onClick={() => updateUserRole(user.email, role.value)}
                            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                              user.role === role.value
                                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                                : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                            }`}
                          >
                            {role.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <button
                    onClick={() => setSelectedUser(selectedUser?.email === user.email ? null : user)}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    {selectedUser?.email === user.email ? 'Close' : 'Manage'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-3">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="bg-white/5 border border-white/10 rounded p-2 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-semibold">{log.action}</p>
                  {log.approvalStatus === 'approved' && (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  )}
                </div>
                <p className="text-white/60">{log.userId} • {log.resource}</p>
                <p className="text-white/40">
                  {new Date(log.created_date).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
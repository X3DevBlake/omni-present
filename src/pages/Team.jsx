import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Shield, Trash2, Edit } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const users = await base44.entities.User.list();
      setMembers(users);
    } catch (err) {
      console.error('Failed to load team');
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail) return;
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      await loadTeam();
    } catch (err) {
      toast.error('Failed to send invitation');
    }
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-white/60">Manage team members and permissions</p>
        </motion.div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            Invite Team Member
          </h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={inviteMember}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Invite
            </button>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Team Members ({members.length})
          </h3>
          <div className="space-y-2">
            {members.map(member => (
              <div key={member.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {member.full_name?.[0] || member.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{member.full_name || 'User'}</div>
                    <div className="text-white/60 text-sm">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    member.role === 'admin'
                      ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                      : 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                  }`}>
                    <Shield className="w-3 h-3 inline mr-1" />
                    {member.role}
                  </div>
                  <button className="p-2 text-white/60 hover:text-cyan-400">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Award, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PersistentProfileManager({ userEmail }) {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    if (userEmail) loadProfiles();
  }, [userEmail]);

  const loadProfiles = async () => {
    const profs = await base44.entities.PersistentAgentProfile.list();
    setProfiles(profs);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-green-400" />
        Persistent Profiles
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {profiles.map(profile => (
          <div key={profile.id} className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/30 rounded p-3">
            <p className="text-white font-semibold mb-2">{profile.agent_base_id?.slice(0, 12)}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-white/60">XP</p>
                <p className="text-cyan-400 font-bold">{profile.total_experience_points}</p>
              </div>
              <div>
                <p className="text-white/60">Reputation</p>
                <p className="text-green-400 font-bold">{profile.reputation_score}</p>
              </div>
              <div>
                <p className="text-white/60">Simulations</p>
                <p className="text-purple-400 font-bold">{profile.cross_simulation_progress?.length || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
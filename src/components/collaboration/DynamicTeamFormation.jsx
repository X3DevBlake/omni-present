import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Users, Sparkles, Loader2, Trophy } from 'lucide-react';

export default function DynamicTeamFormation({ userEmail }) {
  const [taskObjective, setTaskObjective] = useState('');
  const [enableAutonomous, setEnableAutonomous] = useState(false);

  const { data: teams } = useQuery({
    queryKey: ['dynamicTeams', userEmail],
    queryFn: () => base44.entities.DynamicTeam.filter({ user_email: userEmail }),
    initialData: []
  });

  const formTeam = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/dynamic-team-formation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskObjective, enableAutonomous })
      });
      return response.json();
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Users className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Dynamic Team Formation</h3>
          <p className="text-white/60 text-sm">AI-powered agent teams</p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Describe the complex task..."
          value={taskObjective}
          onChange={(e) => setTaskObjective(e.target.value)}
          className="bg-white/5 border-white/10"
        />

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div>
            <p className="text-white text-sm font-bold">Autonomous Formation</p>
            <p className="text-white/60 text-xs">Agents auto-organize</p>
          </div>
          <Switch
            checked={enableAutonomous}
            onCheckedChange={setEnableAutonomous}
          />
        </div>

        <Button
          onClick={() => formTeam.mutate()}
          disabled={!taskObjective || formTeam.isPending}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {formTeam.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Forming Team...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Form Team
            </>
          )}
        </Button>

        {formTeam.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-white font-bold">{formTeam.data.team.team_name}</span>
            </div>
            <p className="text-white/80 text-sm mb-3">{formTeam.data.team.formation_reason}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Team Members:</span>
              <span className="text-white">{formTeam.data.selectedAgents?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-white/60">Collaboration Score:</span>
              <span className="text-green-400 font-bold">{formTeam.data.team.collaboration_score}%</span>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          <h4 className="text-white font-bold text-sm">Active Teams ({teams.filter(t => t.status === 'active').length})</h4>
          {teams.slice(0, 3).map((team) => (
            <div key={team.id} className="bg-white/5 rounded p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white font-bold text-sm">{team.team_name}</p>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  team.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {team.status}
                </span>
              </div>
              <p className="text-white/60 text-xs">{team.agent_ids.length} agents • Score: {team.collaboration_score}%</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
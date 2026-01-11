import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, TrendingUp, Loader } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AutonomousSkillManager({ agentId, userEmail }) {
  const [autonomyLevel, setAutonomyLevel] = useState(0.5);
  const queryClient = useQueryClient();

  const { data: discoveries } = useQuery({
    queryKey: ['skillDiscoveries', agentId],
    queryFn: () => base44.entities.AutonomousSkillDiscovery.filter({ agent_id: agentId }),
    enabled: !!agentId
  });

  const discoverSkills = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/autonomous-skill-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          autonomyLevel,
          userEmail
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['skillDiscoveries'] });
      toast.success(`Discovered ${data.discovered.length} new skills`);
    }
  });

  const statusColors = {
    discovered: 'bg-blue-500/20 text-blue-400',
    learning: 'bg-yellow-500/20 text-yellow-400',
    integrated: 'bg-green-500/20 text-green-400',
    mastered: 'bg-purple-500/20 text-purple-400'
  };

  return (
    <Card className="bg-black/40 border-white/10 p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-cyan-400" />
        Autonomous Skill Discovery
      </h3>

      <div className="mb-6">
        <label className="text-white text-sm mb-2 block">
          Agent Autonomy Level: {(autonomyLevel * 100).toFixed(0)}%
        </label>
        <Slider
          value={[autonomyLevel]}
          onValueChange={([v]) => setAutonomyLevel(v)}
          min={0}
          max={1}
          step={0.1}
          className="mb-2"
        />
        <p className="text-white/60 text-xs">
          {autonomyLevel > 0.7 ? 'High: Auto-integrates discovered skills' : 
           autonomyLevel > 0.4 ? 'Medium: Suggests skills for approval' : 
           'Low: Only discovers, requires manual approval'}
        </p>
      </div>

      <Button
        onClick={() => discoverSkills.mutate()}
        disabled={discoverSkills.isPending}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 mb-4"
      >
        {discoverSkills.isPending ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
        Discover New Skills
      </Button>

      <div className="space-y-3">
        {discoveries?.map(discovery => (
          <motion.div
            key={discovery.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">{discovery.skill_discovered}</h4>
              <Badge className={statusColors[discovery.integration_status]}>
                {discovery.integration_status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{(discovery.performance_improvement * 100).toFixed(0)}% improvement
              </span>
              <span>Relevance: {(discovery.relevance_score * 100).toFixed(0)}%</span>
            </div>
            {discovery.learning_resources?.length > 0 && (
              <p className="text-xs text-white/50 mt-2">
                {discovery.learning_resources.length} learning resources available
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {discoverSkills.data?.auto_integrated?.length > 0 && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-300 text-xs">
            ✓ Auto-integrated: {discoverSkills.data.auto_integrated.join(', ')}
          </p>
        </div>
      )}
    </Card>
  );
}
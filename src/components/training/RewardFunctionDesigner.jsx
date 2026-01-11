import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function RewardFunctionDesigner({ agentId, userEmail }) {
  const [functionName, setFunctionName] = useState('');
  const [strategy, setStrategy] = useState('epsilon_greedy');
  const [criteria, setCriteria] = useState('');
  const queryClient = useQueryClient();

  const createRewardFn = useMutation({
    mutationFn: async () => {
      const criteriaObj = criteria.split('\n').reduce((obj, line) => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) obj[key] = parseFloat(value) || value;
        return obj;
      }, {});

      return await base44.entities.RewardFunction.create({
        user_email: userEmail,
        agent_id: agentId,
        function_name: functionName,
        reward_criteria: criteriaObj,
        exploration_strategy: strategy,
        discount_factor: 0.95,
        performance_metrics: { total_rewards: 0, episodes: 0 }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewardFunctions', agentId] });
      setFunctionName('');
      setCriteria('');
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6 space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-yellow-400" />
        <h4 className="text-white font-bold">Reward Function Designer</h4>
      </div>

      <Input
        placeholder="Function name..."
        value={functionName}
        onChange={(e) => setFunctionName(e.target.value)}
        className="bg-white/5 border-white/10"
      />

      <Select value={strategy} onValueChange={setStrategy}>
        <SelectTrigger className="bg-white/5 border-white/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="epsilon_greedy">Epsilon Greedy</SelectItem>
          <SelectItem value="ucb">Upper Confidence Bound</SelectItem>
          <SelectItem value="thompson_sampling">Thompson Sampling</SelectItem>
        </SelectContent>
      </Select>

      <Textarea
        placeholder="Reward criteria (key: value per line)..."
        value={criteria}
        onChange={(e) => setCriteria(e.target.value)}
        className="bg-white/5 border-white/10 min-h-[100px] font-mono text-xs"
      />

      <Button
        onClick={() => createRewardFn.mutate()}
        disabled={!functionName || !criteria || createRewardFn.isPending}
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        Create Reward Function
      </Button>
    </motion.div>
  );
}
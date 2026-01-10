import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export default function RewardFunctionDesigner() {
  const [rewards, setRewards] = useState([
    { id: 1, event: 'Task Completion', value: 100 },
    { id: 2, event: 'Collaboration', value: 50 },
    { id: 3, event: 'Exploration', value: 25 },
  ]);
  const [penalties, setPenalties] = useState([
    { id: 1, event: 'Failed Attempt', value: -20 },
    { id: 2, event: 'Resource Waste', value: -30 },
  ]);

  const addReward = () => {
    setRewards([...rewards, { id: Date.now(), event: 'New Event', value: 10 }]);
  };

  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Award className="w-6 h-6 text-yellow-400" />
        Reward Function Designer
      </h3>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold">Rewards</h4>
          <Button onClick={addReward} size="sm" className="bg-green-500/20 hover:bg-green-500/30">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {rewards.map((reward, i) => (
            <div key={reward.id} className="bg-black/20 rounded-lg p-3">
              <Input
                value={reward.event}
                onChange={(e) => {
                  const updated = [...rewards];
                  updated[i].event = e.target.value;
                  setRewards(updated);
                }}
                className="bg-white/5 border-white/10 text-white mb-2 text-sm"
              />
              <div className="flex items-center gap-3">
                <Slider
                  value={[reward.value]}
                  onValueChange={([v]) => {
                    const updated = [...rewards];
                    updated[i].value = v;
                    setRewards(updated);
                  }}
                  max={200}
                  className="flex-1"
                />
                <span className="text-green-400 font-bold w-12 text-right">+{reward.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-3">Penalties</h4>
        <div className="space-y-3">
          {penalties.map((penalty, i) => (
            <div key={penalty.id} className="bg-black/20 rounded-lg p-3">
              <div className="text-white text-sm mb-2">{penalty.event}</div>
              <div className="flex items-center gap-3">
                <Slider
                  value={[Math.abs(penalty.value)]}
                  onValueChange={([v]) => {
                    const updated = [...penalties];
                    updated[i].value = -v;
                    setPenalties(updated);
                  }}
                  max={100}
                  className="flex-1"
                />
                <span className="text-red-400 font-bold w-12 text-right">{penalty.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-green-500/10 to-red-500/10 rounded-lg p-4">
        <div className="text-white/60 text-sm mb-2">Expected Total Reward</div>
        <div className="text-white text-2xl font-bold">
          {rewards.reduce((sum, r) => sum + r.value, 0) + penalties.reduce((sum, p) => sum + p.value, 0)}
        </div>
      </div>
    </div>
  );
}
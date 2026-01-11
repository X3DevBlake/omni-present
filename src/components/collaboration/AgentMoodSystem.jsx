import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smile, Brain, Zap, Target } from 'lucide-react';

export default function AgentMoodSystem({ agentId, userEmail }) {
  const [selectedMood, setSelectedMood] = useState('analytical');
  const queryClient = useQueryClient();

  const { data: moodData } = useQuery({
    queryKey: ['agentMood', agentId],
    queryFn: () => base44.entities.AgentMood.filter({ agent_id: agentId }),
    initialData: []
  });

  const updateMood = useMutation({
    mutationFn: async () => {
      return await base44.entities.AgentMood.create({
        agent_id: agentId,
        user_email: userEmail,
        current_mood: selectedMood,
        mood_factors: {
          workload: 'moderate',
          recent_success: true,
          collaboration_quality: 'high'
        },
        interaction_style: getMoodStyle(selectedMood),
        performance_impact: {
          speed: selectedMood === 'focused' ? 1.2 : 1.0,
          creativity: selectedMood === 'creative' ? 1.3 : 1.0
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentMood'] });
    }
  });

  const getMoodStyle = (mood) => {
    const styles = {
      confident: { tone: 'assertive', detail: 'high', speed: 'fast' },
      cautious: { tone: 'careful', detail: 'very_high', speed: 'slow' },
      creative: { tone: 'imaginative', detail: 'medium', speed: 'medium' },
      analytical: { tone: 'precise', detail: 'high', speed: 'medium' },
      collaborative: { tone: 'supportive', detail: 'medium', speed: 'fast' },
      focused: { tone: 'direct', detail: 'low', speed: 'very_fast' }
    };
    return styles[mood] || styles.analytical;
  };

  const getMoodIcon = (mood) => {
    const icons = {
      confident: '😎', cautious: '🤔', creative: '🎨',
      analytical: '📊', collaborative: '🤝', focused: '🎯'
    };
    return icons[mood] || '🤖';
  };

  const currentMood = moodData[0]?.current_mood || 'analytical';

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Smile className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Agent Mood System</h3>
          <p className="text-white/60 text-sm">Affects interaction style</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-6xl mb-2">{getMoodIcon(currentMood)}</div>
          <p className="text-white font-bold capitalize">{currentMood}</p>
          <p className="text-white/60 text-xs mt-1">
            {getMoodStyle(currentMood).tone} tone • {getMoodStyle(currentMood).speed} speed
          </p>
        </div>

        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confident">😎 Confident</SelectItem>
            <SelectItem value="cautious">🤔 Cautious</SelectItem>
            <SelectItem value="creative">🎨 Creative</SelectItem>
            <SelectItem value="analytical">📊 Analytical</SelectItem>
            <SelectItem value="collaborative">🤝 Collaborative</SelectItem>
            <SelectItem value="focused">🎯 Focused</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => updateMood.mutate()}
          disabled={updateMood.isPending}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
        >
          <Zap className="w-4 h-4 mr-2" />
          Update Mood
        </Button>

        {moodData[0]?.performance_impact && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-400 text-xs font-bold mb-2">Performance Impact:</p>
            <div className="space-y-1 text-xs text-white/80">
              <div className="flex justify-between">
                <span>Speed:</span>
                <span>{(moodData[0].performance_impact.speed * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Creativity:</span>
                <span>{(moodData[0].performance_impact.creativity * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
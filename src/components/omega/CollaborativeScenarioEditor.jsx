import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Save, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CollaborativeScenarioEditor({ scenarioId = 'scenario_001' }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me()
  });

  const { data: scenario } = useQuery({
    queryKey: ['collab_scenario', scenarioId],
    queryFn: async () => {
      const docs = await base44.entities.CollaborativeDocument.filter({ 
        document_id: scenarioId 
      });
      return docs[0];
    }
  });

  useEffect(() => {
    if (scenario?.content) {
      setContent(scenario.content);
    }
  }, [scenario]);

  // Real-time collaboration subscription
  useEffect(() => {
    if (!scenarioId) return;

    const unsubscribe = base44.entities.CollaborativeDocument.subscribe((event) => {
      if (event.data?.document_id === scenarioId && event.type === 'update') {
        setContent(event.data.content);
        setActiveUsers(event.data.active_editors || []);
      }
    });

    return unsubscribe;
  }, [scenarioId]);

  const updateMutation = useMutation({
    mutationFn: async (newContent) => {
      if (scenario?.id) {
        return base44.entities.CollaborativeDocument.update(scenario.id, {
          content: newContent,
          last_edited_by: user.email,
          active_editors: [...new Set([...(scenario.active_editors || []), user.email])]
        });
      } else {
        return base44.entities.CollaborativeDocument.create({
          document_id: scenarioId,
          document_type: 'simulation_scenario',
          content: newContent,
          owner_email: user.email,
          active_editors: [user.email]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collab_scenario'] });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(content);
  };

  return (
    <Card className="bg-gradient-to-br from-cyan-950/90 via-blue-950/90 to-indigo-950/90 backdrop-blur-xl border-cyan-500/30">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-cyan-400" />
              Collaborative Editor
            </CardTitle>
            <p className="text-gray-300 text-sm mt-1">Real-time scenario editing</p>
          </div>
          <div className="flex gap-2 items-center">
            <Badge className="bg-green-600 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {activeUsers.length} editing
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="bg-black/60 rounded-lg p-2 border border-cyan-500/20">
            <div className="flex gap-2 flex-wrap">
              {activeUsers.map((email, idx) => (
                <Badge key={idx} className="bg-cyan-600 text-xs">
                  {email.split('@')[0]}
                </Badge>
              ))}
            </div>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe simulation scenario, agent behaviors, success criteria..."
            className="bg-black/60 border-cyan-500/30 text-white min-h-[200px]"
          />

          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>

          {updateMutation.isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-950/60 rounded p-2 border border-green-500/30 text-center text-green-400 text-sm"
            >
              ✓ Saved and synced to all collaborators
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
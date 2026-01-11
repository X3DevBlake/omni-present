import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Users, Save, Sparkles } from 'lucide-react';

export default function RealTimeDocEditor({ documentId, agents = [], userEmail }) {
  const [content, setContent] = useState('');
  const [activeAgents, setActiveAgents] = useState([]);
  const queryClient = useQueryClient();

  const saveDocument = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/google-docs-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          documentId,
          content
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">Collaborative Document</h3>
            <p className="text-white/60 text-sm">Real-time editing with agents</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-white/60 text-sm">{agents.length} agents</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {agents.map((agent, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-xs">{agent}</span>
            </motion.div>
          ))}
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start collaborative editing..."
          className="bg-white/5 border-white/10 min-h-[300px] font-mono text-sm"
        />

        <div className="flex gap-2">
          <Button
            onClick={() => saveDocument.mutate()}
            disabled={saveDocument.isPending}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button
            variant="outline"
            className="border-white/10"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assist
          </Button>
        </div>
      </div>
    </Card>
  );
}
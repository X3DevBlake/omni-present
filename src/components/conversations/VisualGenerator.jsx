import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Video, Loader2, Sparkles } from 'lucide-react';

export default function VisualGenerator({ userEmail }) {
  const [selectedConversation, setSelectedConversation] = useState('');
  const [visualType, setVisualType] = useState('image');

  const { data: conversations } = useQuery({
    queryKey: ['aiConversations', userEmail],
    queryFn: () => base44.entities.AIConversation.filter({ user_email: userEmail }),
    initialData: []
  });

  const generateVisual = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/generate-conversation-visuals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          visualType
        })
      });
      if (!response.ok) throw new Error('Failed to generate');
      return response.json();
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">AI Visual Generator</h3>
          <p className="text-white/60 text-sm">Create images/videos from conversations</p>
        </div>
      </div>

      <div className="space-y-4">
        <Select value={selectedConversation} onValueChange={setSelectedConversation}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue placeholder="Select conversation" />
          </SelectTrigger>
          <SelectContent>
            {conversations.map((conv) => (
              <SelectItem key={conv.id} value={conv.id}>
                {conv.conversation_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            onClick={() => setVisualType('image')}
            variant={visualType === 'image' ? 'default' : 'outline'}
            className={visualType === 'image' ? 'bg-purple-500' : ''}
          >
            <Image className="w-4 h-4 mr-2" />
            Image
          </Button>
          <Button
            onClick={() => setVisualType('video')}
            variant={visualType === 'video' ? 'default' : 'outline'}
            className={visualType === 'video' ? 'bg-purple-500' : ''}
          >
            <Video className="w-4 h-4 mr-2" />
            Video
          </Button>
        </div>

        <Button
          onClick={() => generateVisual.mutate()}
          disabled={!selectedConversation || generateVisual.isPending}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {generateVisual.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Visual
            </>
          )}
        </Button>

        {generateVisual.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
          >
            {generateVisual.data.type === 'image' && (
              <img
                src={generateVisual.data.url}
                alt="Generated visual"
                className="w-full rounded-lg mb-3"
              />
            )}
            {generateVisual.data.type === 'video_frames' && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {generateVisual.data.frames.map((frame, idx) => (
                  <img
                    key={idx}
                    src={frame}
                    alt={`Frame ${idx + 1}`}
                    className="w-full rounded"
                  />
                ))}
              </div>
            )}
            <p className="text-white/60 text-xs">{generateVisual.data.prompt}</p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
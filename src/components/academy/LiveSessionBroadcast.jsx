import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Video, Users, Mic, MicOff, VideoOff, Share2, MessageSquare } from 'lucide-react';

export default function LiveSessionBroadcast({ courseId, moduleId }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [participants, setParticipants] = useState([]);

  const { data: session } = useQuery({
    queryKey: ['live-session', courseId],
    queryFn: async () => {
      const sessions = await base44.entities.MultiUserSpatialSession.list();
      return sessions.find(s => s.workspace_id === courseId);
    },
    refetchInterval: 3000
  });

  useEffect(() => {
    if (session?.participants) {
      setParticipants(session.participants);
    }
  }, [session]);

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-red-500" />
            Live Holographic Session
          </CardTitle>
          <Badge className="bg-red-500 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Video Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black/60 rounded-lg h-48 flex items-center justify-center relative">
            <Video className="w-12 h-12 text-gray-500" />
            <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
              Instructor
            </div>
          </div>
          {participants.slice(0, 3).map((participant, idx) => (
            <div key={idx} className="bg-black/60 rounded-lg h-48 flex items-center justify-center relative">
              <Users className="w-12 h-12 text-gray-500" />
              <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                {participant.user_id?.substring(0, 8)}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isMuted ? 'destructive' : 'outline'}
              onClick={() => setIsMuted(!isMuted)}
              className="border-white/20 text-white"
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant={!isVideoOn ? 'destructive' : 'outline'}
              onClick={() => setIsVideoOn(!isVideoOn)}
              className="border-white/20 text-white"
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" className="border-white/20 text-white">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="flex items-center gap-2 text-white text-sm">
            <Users className="w-4 h-4" />
            <span>{participants.length} participants</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
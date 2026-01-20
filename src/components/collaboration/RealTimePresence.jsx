import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default function RealTimePresence({ sessionId }) {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchPresence = async () => {
      try {
        const session = await base44.entities.CollaborationSession.get(sessionId);
        setActiveUsers(session.active_users || []);
      } catch (error) {
        console.error('Presence fetch error:', error);
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 3000);

    const unsubscribe = base44.entities.CollaborationSession.subscribe((event) => {
      if (event.id === sessionId && event.type === 'update') {
        setActiveUsers(event.data.active_users || []);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [sessionId]);

  return (
    <div className="flex items-center gap-3 p-4 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
      <Users className="w-5 h-5 text-white" />
      <span className="text-white font-medium">Collaborators:</span>
      <div className="flex gap-2">
        {activeUsers.map((user, i) => (
          <Badge 
            key={i}
            style={{ backgroundColor: user.color }}
            className="text-white border-white/30"
          >
            User {i + 1}
          </Badge>
        ))}
      </div>
      {activeUsers.length === 0 && (
        <span className="text-white/60 text-sm">No active collaborators</span>
      )}
    </div>
  );
}
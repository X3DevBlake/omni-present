import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Play, Pause, RotateCcw, Download } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function MultiUserSimulationCanvas({ simulationId }) {
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      try {
        const user = await base44.auth.me();
        
        let sessions = await base44.entities.MultiUserSimulationSession.filter({ simulation_id: simulationId });
        
        if (sessions.length === 0) {
          const newSession = await base44.entities.MultiUserSimulationSession.create({
            simulation_id: simulationId,
            session_name: `Session-${Date.now()}`,
            participants: [{
              user_id: user.id,
              role: 'admin',
              joined_at: new Date().toISOString(),
              is_active: true,
              cursor_position: { x: 0, y: 0 },
              current_action: 'joined'
            }],
            shared_state: {
              synchronized: true,
              last_sync: new Date().toISOString(),
              version: 1
            },
            collaboration_events: [],
            voice_channel_enabled: false,
            max_participants: 10
          });
          setSession(newSession);
          setParticipants(newSession.participants);
        } else {
          setSession(sessions[0]);
          setParticipants(sessions[0].participants || []);
        }
      } catch (error) {
        console.error('Failed to init session:', error);
      }
    };

    initSession();

    const interval = setInterval(() => {
      base44.entities.MultiUserSimulationSession.filter({ simulation_id: simulationId })
        .then(sessions => {
          if (sessions.length > 0) {
            setParticipants(sessions[0].participants || []);
          }
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [simulationId]);

  const handleAction = async (action) => {
    if (action === 'play') setIsRunning(true);
    if (action === 'pause') setIsRunning(false);
    if (action === 'reset') setIsRunning(false);
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Multi-User Simulation Canvas
          </CardTitle>
          <div className="flex items-center gap-2">
            {participants.slice(0, 5).map((p, i) => (
              <Avatar key={i} className="w-8 h-8 border-2 border-white/20">
                <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-purple-600 text-white text-xs">
                  {p.user_id?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            <Badge className="bg-green-600">{participants.length} online</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleAction(isRunning ? 'pause' : 'play')}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            onClick={() => handleAction('reset')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-[400px] bg-black/30 rounded-lg">
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            <mesh>
              <boxGeometry args={[5, 0.1, 5]} />
              <meshStandardMaterial color="#1a1a2e" />
            </mesh>

            {participants.map((p, i) => {
              const angle = (i / participants.length) * Math.PI * 2;
              return (
                <Sphere key={i} args={[0.3, 16, 16]} position={[Math.cos(angle) * 2, 1, Math.sin(angle) * 2]}>
                  <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.6} />
                </Sphere>
              );
            })}
            
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 gap-4 text-white/80 text-sm">
          <div>
            <span className="text-white/60">Status:</span>
            <p className="font-medium">{isRunning ? 'Running' : 'Paused'}</p>
          </div>
          <div>
            <span className="text-white/60">Sync:</span>
            <p className="font-medium">{session?.shared_state?.synchronized ? 'Synced' : 'Syncing'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
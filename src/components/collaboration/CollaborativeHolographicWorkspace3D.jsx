import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Line, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Share2, Layers, Activity } from 'lucide-react';
import { toast } from 'sonner';

function ParticipantAvatar({ participant, isCurrentUser }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      if (isCurrentUser) {
        const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
        meshRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  const pos = participant.spatial_position || { x: 0, y: 0, z: 0 };

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <Sphere ref={meshRef} args={[0.3, 16, 16]}>
        <meshStandardMaterial
          color={isCurrentUser ? "#00FF00" : "#0088FF"}
          emissive={isCurrentUser ? "#00FF00" : "#0088FF"}
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Html distanceFactor={10}>
        <div className="bg-slate-900 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
          {participant.user_id.substring(0, 8)}
        </div>
      </Html>
    </group>
  );
}

function HolographicEntity({ entity, onManipulate }) {
  const meshRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const anchor = entity.spatial_anchor || { x: 0, y: 1, z: 0 };

  return (
    <group position={[anchor.x, anchor.y, anchor.z]}>
      <Box
        ref={meshRef}
        args={[1, 1, 1]}
        onClick={() => onManipulate(entity)}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
      >
        <meshStandardMaterial
          color="#FFD700"
          transparent
          opacity={entity.opacity || 0.7}
          emissive="#FFD700"
          emissiveIntensity={isDragging ? 0.5 : 0.2}
        />
      </Box>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {entity.entity_type || 'Object'}
      </Text>
    </group>
  );
}

function CollaborativeScene({ workspace, currentUserId, onManipulate }) {
  const participants = workspace?.active_participants || [];
  const entities = workspace?.holographic_entities || [];

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#0088FF" />
      
      <OrbitControls enablePan={true} enableZoom={true} />

      {participants.map((participant, idx) => (
        <ParticipantAvatar
          key={idx}
          participant={participant}
          isCurrentUser={participant.user_id === currentUserId}
        />
      ))}

      {entities.map((entity, idx) => (
        <HolographicEntity
          key={idx}
          entity={entity}
          onManipulate={onManipulate}
        />
      ))}

      <gridHelper args={[20, 20, '#444444', '#111111']} />

      <Text
        position={[0, -1, 0]}
        fontSize={0.4}
        color="#00FFFF"
        anchorX="center"
      >
        Collaborative Workspace
      </Text>
    </>
  );
}

export default function CollaborativeHolographicWorkspace3D({ workspaceId }) {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const workspaces = await base44.entities.HolographicCollaborativeWorkspace.filter({ workspace_id: workspaceId });
      return workspaces[0];
    },
    refetchInterval: 2000,
    enabled: !!workspaceId
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('holographicWorkspaceOrchestrator', {
        action: 'join_workspace',
        workspace_id: workspaceId,
        data: {
          device_type: 'desktop',
          mode: 'multi_modal',
          spawn_position: { x: Math.random() * 4 - 2, y: 1.6, z: Math.random() * 4 - 2 }
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      toast.success('Joined workspace!');
    }
  });

  const manipulateMutation = useMutation({
    mutationFn: async (entity) => {
      const response = await base44.functions.invoke('holographicWorkspaceOrchestrator', {
        action: 'manipulate_entity',
        workspace_id: workspaceId,
        data: {
          entity_id: entity.entity_id,
          transformation: {
            position_delta: { x: Math.random() - 0.5, y: 0, z: Math.random() - 0.5 },
            rotation_delta: { x: 0, y: Math.PI / 4, z: 0 },
            scale_delta: 1.0
          }
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      toast.success('Entity manipulated');
    }
  });

  const participants = workspace?.active_participants || [];
  const isParticipant = participants.some(p => p.user_id === user?.id);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-slate-900 to-cyan-950 border-cyan-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-cyan-400" />
              {workspace?.workspace_name || 'Holographic Workspace'}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-cyan-900 text-cyan-200">
                <Users className="w-3 h-3 mr-1" />
                {participants.length} Active
              </Badge>
              <Badge variant="outline" className="bg-green-900 text-green-200">
                <Activity className="w-3 h-3 mr-1" />
                {workspace?.sync_state?.sync_latency_ms || 0}ms latency
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-96 w-full rounded-lg overflow-hidden bg-black">
            <Canvas camera={{ position: [8, 8, 8], fov: 60 }}>
              <color attach="background" args={['#001122']} />
              <fog attach="fog" args={['#001122', 10, 50]} />
              <CollaborativeScene
                workspace={workspace}
                currentUserId={user?.id}
                onManipulate={(entity) => {
                  setSelectedEntity(entity);
                  manipulateMutation.mutate(entity);
                }}
              />
            </Canvas>
          </div>

          <div className="flex gap-2">
            {!isParticipant && (
              <Button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Join Workspace
              </Button>
            )}
          </div>

          {participants.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Active Participants</div>
              <div className="flex flex-wrap gap-2">
                {participants.map((p, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className={p.user_id === user?.id ? 'bg-green-900 text-green-200' : ''}
                  >
                    {p.user_id.substring(0, 8)}
                    {p.user_id === user?.id && ' (You)'}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
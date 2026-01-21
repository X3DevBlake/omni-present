import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Navigation, AlertTriangle, Loader2, Shield, Eye } from 'lucide-react';

function PredictedTrajectory({ trajectory, color = '#f59e0b' }) {
  if (!trajectory || trajectory.length < 2) return null;

  const points = trajectory.map(t => 
    new THREE.Vector3(t.position?.x || 0, 0.3, t.position?.z || 0)
  );

  return (
    <group>
      <Line points={points} color={color} lineWidth={2} dashed dashScale={5} transparent opacity={0.6} />
      {trajectory.map((t, idx) => (
        <Sphere key={idx} args={[0.05, 8, 8]} position={[t.position?.x || 0, 0.3, t.position?.z || 0]}>
          <meshBasicMaterial color={color} transparent opacity={0.3 + (t.confidence || 0.5) * 0.5} />
        </Sphere>
      ))}
    </group>
  );
}

function DynamicObstacle({ obstacle, onSelect }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const pos = obstacle.current_position || { x: 0, y: 0, z: 0 };
  const velocity = obstacle.velocity || { vx: 0, vy: 0, vz: 0 };

  useFrame((state, delta) => {
    if (ref.current) {
      // Simulate movement
      ref.current.position.x += velocity.vx * delta * 0.1;
      ref.current.position.z += velocity.vz * delta * 0.1;
      ref.current.rotation.y += 0.02;
    }
  });

  const typeColors = {
    person: '#ec4899',
    pet: '#a855f7',
    robot: '#3b82f6',
    furniture: '#f59e0b',
    vehicle: '#ef4444',
    unknown_dynamic: '#64748b'
  };

  const color = typeColors[obstacle.obstacle_type] || '#ffffff';

  return (
    <group
      ref={ref}
      position={[pos.x, 0.4, pos.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect && onSelect(obstacle)}
    >
      <Trail width={0.3} length={8} color={color} attenuation={(t) => t * t}>
        <Sphere args={[0.2, 16, 16]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </Sphere>
      </Trail>

      {/* Avoidance buffer zone */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <ringGeometry args={[obstacle.avoidance_buffer_meters || 0.5, (obstacle.avoidance_buffer_meters || 0.5) + 0.1, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Velocity direction arrow */}
      {(velocity.vx !== 0 || velocity.vz !== 0) && (
        <mesh
          position={[velocity.vx * 0.5, 0.1, velocity.vz * 0.5]}
          rotation={[0, Math.atan2(velocity.vx, velocity.vz), 0]}
        >
          <coneGeometry args={[0.05, 0.15, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}

      {/* Predicted trajectory */}
      <PredictedTrajectory trajectory={obstacle.predicted_trajectory} color={color} />

      {hovered && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-44">
            <p className="font-bold" style={{ color }}>{obstacle.obstacle_type}</p>
            <p className="text-slate-400">Speed: {(obstacle.velocity?.speed_ms || 0).toFixed(2)} m/s</p>
            <p className="text-slate-400">Pattern: {obstacle.behavior_pattern?.pattern_type || 'unknown'}</p>
            {obstacle.collision_predictions?.length > 0 && (
              <p className="text-red-400 mt-1">⚠️ {obstacle.collision_predictions.length} collision risks</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function AgentWithAvoidance({ agent, avoidanceAction }) {
  const ref = useRef();
  const pos = agent.current_location || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const actionColors = {
    stop: '#ef4444',
    slow_down: '#f59e0b',
    detour_left: '#3b82f6',
    detour_right: '#8b5cf6',
    wait: '#64748b',
    proceed: '#10b981'
  };

  const color = avoidanceAction ? actionColors[avoidanceAction] || '#00f5ff' : '#00f5ff';

  return (
    <group ref={ref} position={[pos.x, 0.4, pos.z]}>
      <Sphere args={[0.18, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </Sphere>
      <Sphere args={[0.25, 16, 16]}>
        <meshBasicMaterial color={color} transparent opacity={0.15} wireframe />
      </Sphere>

      {avoidanceAction && (
        <Html position={[0, 0.4, 0]} center>
          <div className="bg-black/80 text-xs px-2 py-1 rounded" style={{ color }}>
            {avoidanceAction.toUpperCase()}
          </div>
        </Html>
      )}
    </group>
  );
}

function CollisionWarningZone({ prediction }) {
  const pos = prediction.collision_point || { x: 0, y: 0, z: 0 };
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 8) * 0.15;
    }
  });

  return (
    <mesh ref={ref} position={[pos.x || 0, 0.05, pos.z || 0]} rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.5, 32]} />
      <meshBasicMaterial color="#ef4444" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

function PredictiveScene3D({ obstacles, agents, collisionPredictions, selectedObstacle, onSelectObstacle }) {
  return (
    <Canvas camera={{ position: [10, 8, 10], fov: 55 }}>
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 12, 10]} intensity={1} />
      <pointLight position={[-5, 10, -5]} intensity={0.5} color="#ef4444" />

      {/* Floor */}
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#050510" />
      </Box>
      <gridHelper args={[16, 16, '#1a0a0a', '#0a0510']} position={[6, 0.03, 5]} />

      {/* Collision warning zones */}
      {collisionPredictions.filter(cp => cp.collision_probability > 0.5).map((cp, idx) => (
        <CollisionWarningZone key={idx} prediction={cp} />
      ))}

      {/* Dynamic obstacles */}
      {obstacles.map((obstacle, idx) => (
        <DynamicObstacle
          key={obstacle.obstacle_id || idx}
          obstacle={obstacle}
          onSelect={onSelectObstacle}
        />
      ))}

      {/* Agents with avoidance actions */}
      {agents.map((agent, idx) => {
        const avoidance = collisionPredictions.find(cp => cp.agent_id === agent.agent_id);
        return (
          <AgentWithAvoidance
            key={agent.id || idx}
            agent={agent}
            avoidanceAction={avoidance?.recommended_action}
          />
        );
      })}

      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}

export default function PredictiveObstacleVisualizer3D({ agents = [] }) {
  const queryClient = useQueryClient();
  const [selectedObstacle, setSelectedObstacle] = useState(null);
  const [collisionPredictions, setCollisionPredictions] = useState([]);

  const { data: predictiveObstacles = [] } = useQuery({
    queryKey: ['predictive-obstacles'],
    queryFn: () => base44.entities.PredictiveObstacle.list('-last_updated', 20),
    initialData: [],
    refetchInterval: 2000
  });

  const predictMutation = useMutation({
    mutationFn: async (obstacle) => {
      const response = await base44.functions.invoke('predict-obstacle-movement', {
        obstacle_id: obstacle.obstacle_id,
        historical_positions: [
          { position: obstacle.current_position, timestamp: Date.now() - 2000 },
          { position: { ...obstacle.current_position, x: obstacle.current_position.x - 0.5 }, timestamp: Date.now() - 1000 },
          { position: obstacle.current_position, timestamp: Date.now() }
        ],
        agent_positions: agents.map(a => ({ agent_id: a.agent_id, position: a.current_location })),
        prediction_horizon_ms: 5000
      });
      return response.data;
    },
    onSuccess: (data) => {
      setCollisionPredictions(data.collision_predictions || []);
      if (data.high_risk_collisions?.length > 0) {
        toast.warning(`⚠️ ${data.high_risk_collisions.length} high-risk collision(s) predicted!`);
      }
      queryClient.invalidateQueries(['predictive-obstacles']);
    }
  });

  useEffect(() => {
    // Auto-predict for all obstacles periodically
    const interval = setInterval(() => {
      predictiveObstacles.forEach(obs => {
        if (obs.velocity?.speed_ms > 0.1) {
          predictMutation.mutate(obs);
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [predictiveObstacles]);

  const highRiskCount = collisionPredictions.filter(cp => cp.collision_probability > 0.7).length;
  const mediumRiskCount = collisionPredictions.filter(cp => cp.collision_probability > 0.3 && cp.collision_probability <= 0.7).length;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-orange-400" />
            Predictive Obstacle Avoidance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => predictiveObstacles.forEach(obs => predictMutation.mutate(obs))}
              disabled={predictMutation.isPending}
              className="bg-gradient-to-r from-orange-600 to-red-600"
            >
              {predictMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Predicting</>
              ) : (
                <><Eye className="w-4 h-4 mr-2" /> Predict All Movements</>
              )}
            </Button>

            <div className="flex gap-2">
              <Badge className="bg-red-500/20 text-red-400">
                <AlertTriangle className="w-3 h-3 mr-1" /> {highRiskCount} High Risk
              </Badge>
              <Badge className="bg-yellow-500/20 text-yellow-400">
                {mediumRiskCount} Medium Risk
              </Badge>
              <Badge className="bg-green-500/20 text-green-400">
                <Shield className="w-3 h-3 mr-1" /> {agents.length} Agents Protected
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Tracked Obstacles</p>
              <p className="text-white text-xl font-bold">{predictiveObstacles.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Moving Objects</p>
              <p className="text-white text-xl font-bold">
                {predictiveObstacles.filter(o => o.velocity?.speed_ms > 0.1).length}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Predictions Active</p>
              <p className="text-white text-xl font-bold">{collisionPredictions.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Avg Prediction Horizon</p>
              <p className="text-white text-xl font-bold">5s</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Real-Time Predictive View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[550px]">
            <PredictiveScene3D
              obstacles={predictiveObstacles}
              agents={agents}
              collisionPredictions={collisionPredictions}
              selectedObstacle={selectedObstacle}
              onSelectObstacle={setSelectedObstacle}
            />
          </div>
        </CardContent>
      </Card>

      {collisionPredictions.filter(cp => cp.collision_probability > 0.5).length > 0 && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Collision Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {collisionPredictions.filter(cp => cp.collision_probability > 0.5).map((cp, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Agent {cp.agent_id?.slice(0, 8)}</span>
                    <Badge className={cp.collision_probability > 0.7 ? 'bg-red-500' : 'bg-yellow-500'}>
                      {(cp.collision_probability * 100).toFixed(0)}% Risk
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">
                    ETA: {(cp.estimated_time_ms / 1000).toFixed(1)}s
                  </p>
                  <p className="text-cyan-400 text-sm">
                    Action: {cp.recommended_action?.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
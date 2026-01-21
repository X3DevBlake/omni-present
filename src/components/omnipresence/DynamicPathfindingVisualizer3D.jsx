import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Navigation, AlertTriangle, Loader2, Route, Shield, Play } from 'lucide-react';

// Agent with dynamic path
function AgentWithPath({ agent, obstacles, showAlternatives = false, alternativeRoutes = [] }) {
  const agentRef = useRef();
  const pathProgress = useRef(0);
  const pos = agent.current_location || { x: 0, y: 0, z: 0 };
  const path = agent.movement_path || [];

  useFrame((state, delta) => {
    if (agentRef.current && path.length > 1) {
      // Animate along path
      pathProgress.current += delta * 0.2;
      if (pathProgress.current > path.length - 1) {
        pathProgress.current = 0;
      }
      
      const currentIndex = Math.floor(pathProgress.current);
      const nextIndex = Math.min(currentIndex + 1, path.length - 1);
      const t = pathProgress.current - currentIndex;
      
      const current = path[currentIndex]?.waypoint || pos;
      const next = path[nextIndex]?.waypoint || pos;
      
      agentRef.current.position.x = THREE.MathUtils.lerp(current.x || 0, next.x || 0, t);
      agentRef.current.position.z = THREE.MathUtils.lerp(current.z || 0, next.z || 0, t);
    }
  });

  // Primary path visualization
  const pathPoints = useMemo(() => {
    return path.map(wp => new THREE.Vector3(wp.waypoint?.x || 0, 0.2, wp.waypoint?.z || 0));
  }, [path]);

  // Alternative routes
  const alternativePaths = useMemo(() => {
    return alternativeRoutes.map(route => 
      (route.waypoints || []).map(wp => new THREE.Vector3(wp.x || 0, 0.15, wp.z || 0))
    );
  }, [alternativeRoutes]);

  return (
    <group>
      {/* Agent */}
      <group ref={agentRef} position={[pos.x, 0.3, pos.z]}>
        <Float speed={2}>
          <Sphere args={[0.18, 32, 32]}>
            <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.8} />
          </Sphere>
        </Float>

        {/* Direction indicator */}
        {path.length > 1 && (
          <mesh rotation={[0, Math.atan2(
            (path[1]?.waypoint?.x || 0) - pos.x,
            (path[1]?.waypoint?.z || 0) - pos.z
          ), 0]} position={[0, 0, 0.25]}>
            <coneGeometry args={[0.05, 0.15, 8]} />
            <meshBasicMaterial color="#00f5ff" />
          </mesh>
        )}
      </group>

      {/* Primary path */}
      {pathPoints.length > 1 && (
        <Line points={pathPoints} color="#00f5ff" lineWidth={3} transparent opacity={0.8} />
      )}

      {/* Waypoint markers */}
      {path.map((wp, idx) => (
        <group key={idx} position={[wp.waypoint?.x || 0, 0.05, wp.waypoint?.z || 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.15, 16]} />
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <Html position={[0, 0.3, 0]} center>
            <div className="bg-cyan-500/20 border border-cyan-500/50 px-1 rounded text-xs text-cyan-300">
              {wp.eta_seconds?.toFixed(0)}s
            </div>
          </Html>
        </group>
      ))}

      {/* Alternative routes */}
      {showAlternatives && alternativePaths.map((altPath, idx) => (
        <Line 
          key={idx} 
          points={altPath} 
          color="#a855f7" 
          lineWidth={1.5} 
          dashed 
          transparent 
          opacity={0.4} 
        />
      ))}
    </group>
  );
}

// Obstacle with avoidance zone
function ObstacleWithAvoidance({ obstacle, agentCollisions = [] }) {
  const ref = useRef();
  const pos = obstacle.current_position || { x: 0, y: 0, z: 0 };
  const hasHighRisk = agentCollisions.some(c => c.collision_probability > 0.7);

  useFrame((state) => {
    if (ref.current && hasHighRisk) {
      ref.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 8) * 0.3;
    }
  });

  const typeColors = {
    person: '#ec4899',
    pet: '#a855f7',
    robot: '#3b82f6',
    furniture: '#f59e0b'
  };

  const color = hasHighRisk ? '#ef4444' : (typeColors[obstacle.obstacle_type] || '#64748b');

  return (
    <group position={[pos.x, 0.3, pos.z]}>
      <Sphere ref={ref} args={[0.15, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hasHighRisk ? 1 : 0.5} />
      </Sphere>

      {/* Avoidance buffer */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <ringGeometry args={[obstacle.avoidance_buffer_meters || 0.5, (obstacle.avoidance_buffer_meters || 0.5) + 0.08, 32]} />
        <meshBasicMaterial 
          color={hasHighRisk ? '#ef4444' : '#f59e0b'} 
          transparent 
          opacity={hasHighRisk ? 0.4 : 0.2} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {hasHighRisk && (
        <Html position={[0, 0.4, 0]} center>
          <div className="bg-red-500/20 border border-red-500 px-2 py-1 rounded text-xs text-red-300 animate-pulse">
            ⚠️ Collision Risk
          </div>
        </Html>
      )}
    </group>
  );
}

// Main scene
function PathfindingScene({ agents, obstacles, alternativeRoutes, selectedAgent, onSelectAgent }) {
  // Find collision predictions for visualization
  const collisionMap = useMemo(() => {
    const map = {};
    obstacles.forEach(obs => {
      if (obs.collision_predictions) {
        obs.collision_predictions.forEach(cp => {
          if (!map[obs.obstacle_id]) map[obs.obstacle_id] = [];
          map[obs.obstacle_id].push(cp);
        });
      }
    });
    return map;
  }, [obstacles]);

  return (
    <group>
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#050510" />
      </Box>
      <gridHelper args={[16, 32, '#203050', '#0a1525']} position={[6, 0.03, 5]} />

      {obstacles.map((obstacle, idx) => (
        <ObstacleWithAvoidance
          key={obstacle.obstacle_id || idx}
          obstacle={obstacle}
          agentCollisions={collisionMap[obstacle.obstacle_id] || []}
        />
      ))}

      {agents.map((agent, idx) => (
        <AgentWithPath
          key={agent.id || idx}
          agent={agent}
          obstacles={obstacles}
          showAlternatives={selectedAgent?.id === agent.id}
          alternativeRoutes={selectedAgent?.id === agent.id ? alternativeRoutes : []}
        />
      ))}
    </group>
  );
}

export default function DynamicPathfindingVisualizer3D() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [destination, setDestination] = useState({ x: 10, y: 0, z: 8 });
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);

  const { data: agents = [] } = useQuery({
    queryKey: ['pathfinding-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
    initialData: []
  });

  const { data: obstacles = [] } = useQuery({
    queryKey: ['pathfinding-obstacles'],
    queryFn: () => base44.entities.PredictiveObstacle.list('-last_updated', 30),
    initialData: [],
    refetchInterval: 2000
  });

  const calculatePathMutation = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('dynamic-pathfinding-engine', {
        agent_id: agentId,
        destination,
        priority: 'balanced',
        avoid_obstacles: true,
        real_time_adjustment: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAlternativeRoutes(data.alternative_routes || []);
      toast.success(`Path calculated! ${data.total_waypoints} waypoints, ${data.estimated_time_seconds?.toFixed(0)}s ETA`);
      queryClient.invalidateQueries(['pathfinding-agents']);
    }
  });

  const adjustObstaclesMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('real-time-obstacle-adjustment', {
        check_all_agents: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Adjusted ${data.summary?.paths_recalculated || 0} paths, avoided ${data.summary?.collisions_avoided || 0} collisions`);
      queryClient.invalidateQueries(['pathfinding-agents']);
    }
  });

  const activePathsCount = agents.filter(a => a.movement_path?.length > 0).length;
  const totalCollisionRisks = obstacles.reduce((sum, obs) => 
    sum + (obs.collision_predictions?.filter(cp => cp.collision_probability > 0.5).length || 0), 0
  );

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            Dynamic Pathfinding Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <Input
                type="number"
                value={destination.x}
                onChange={(e) => setDestination({ ...destination, x: parseFloat(e.target.value) || 0 })}
                placeholder="X"
                className="bg-slate-800 border-slate-600 text-white"
              />
              <Input
                type="number"
                value={destination.y}
                onChange={(e) => setDestination({ ...destination, y: parseFloat(e.target.value) || 0 })}
                placeholder="Y"
                className="bg-slate-800 border-slate-600 text-white"
              />
              <Input
                type="number"
                value={destination.z}
                onChange={(e) => setDestination({ ...destination, z: parseFloat(e.target.value) || 0 })}
                placeholder="Z"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <Button
              onClick={() => agents.length > 0 && calculatePathMutation.mutate(agents[0].agent_id)}
              disabled={calculatePathMutation.isPending || agents.length === 0}
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              {calculatePathMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Calculating</>
              ) : (
                <><Route className="w-4 h-4 mr-2" /> Calculate Path</>
              )}
            </Button>

            <Button
              onClick={() => adjustObstaclesMutation.mutate()}
              disabled={adjustObstaclesMutation.isPending}
              variant="outline"
            >
              {adjustObstaclesMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adjusting</>
              ) : (
                <><Shield className="w-4 h-4 mr-2" /> Auto-Adjust</>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Active Paths</p>
              <p className="text-white text-xl font-bold">{activePathsCount}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Obstacles</p>
              <p className="text-white text-xl font-bold">{obstacles.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Collision Risks</p>
              <p className={`text-xl font-bold ${totalCollisionRisks > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {totalCollisionRisks}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Alt Routes</p>
              <p className="text-white text-xl font-bold">{alternativeRoutes.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Real-Time Pathfinding Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[550px]">
            <Canvas camera={{ position: [12, 10, 12], fov: 50 }}>
              <ambientLight intensity={0.25} />
              <pointLight position={[10, 12, 10]} intensity={1} />
              <pointLight position={[-5, 8, -5]} intensity={0.5} color="#00f5ff" />

              <PathfindingScene
                agents={agents}
                obstacles={obstacles}
                alternativeRoutes={alternativeRoutes}
                selectedAgent={selectedAgent}
                onSelectAgent={setSelectedAgent}
              />

              {/* Destination marker */}
              <group position={[destination.x, 0.3, destination.z]}>
                <Float speed={3}>
                  <Sphere args={[0.15, 16, 16]}>
                    <meshBasicMaterial color="#10b981" />
                  </Sphere>
                </Float>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.3, 0.35, 32]} />
                  <meshBasicMaterial color="#10b981" transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
                <Html position={[0, 0.5, 0]} center>
                  <div className="bg-green-500/20 border border-green-500 px-2 py-1 rounded text-xs text-green-300">
                    Destination
                  </div>
                </Html>
              </group>

              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {alternativeRoutes.length > 0 && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Alternative Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {alternativeRoutes.map((route, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{route.route_name}</span>
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {route.total_time_seconds?.toFixed(0)}s
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Safety:</span>
                    <span className="text-green-400">{(route.safety_rating * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-2">{route.reason_to_use}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
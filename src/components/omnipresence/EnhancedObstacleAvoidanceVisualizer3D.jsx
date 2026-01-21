import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Shield, AlertTriangle, Navigation, Loader2, Route, Zap } from 'lucide-react';

// Agent with avoidance path visualization
function AgentWithAvoidance({ agent, avoidanceData, showManeuvers = true }) {
  const agentRef = useRef();
  const pathProgress = useRef(0);
  const pos = agent.current_location || { x: 0, y: 0, z: 0 };
  const path = avoidanceData?.optimized_path || agent.movement_path || [];

  useFrame((state, delta) => {
    if (agentRef.current) {
      // Breathing
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      agentRef.current.scale.setScalar(breathe);

      // Animate along path
      if (path.length > 1) {
        pathProgress.current += delta * 0.15;
        if (pathProgress.current > path.length - 1) {
          pathProgress.current = 0;
        }
      }
    }
  });

  const pathPoints = useMemo(() => {
    return path.map(wp => new THREE.Vector3(wp.waypoint?.x || 0, 0.15, wp.waypoint?.z || 0));
  }, [path]);

  const avoidanceWaypoints = useMemo(() => {
    return path.filter(wp => wp.is_avoidance_waypoint);
  }, [path]);

  return (
    <group>
      {/* Agent */}
      <group ref={agentRef} position={[pos.x, 0.3, pos.z]}>
        <Float speed={2}>
          <Sphere args={[0.18, 32, 32]}>
            <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={0.8} />
          </Sphere>
        </Float>
        
        {/* Shield indicator when avoiding */}
        {avoidanceWaypoints.length > 0 && (
          <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
            <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* Original path (dashed) */}
      {agent.movement_path?.length > 1 && (
        <Line
          points={agent.movement_path.map(wp => [wp.waypoint?.x || 0, 0.08, wp.waypoint?.z || 0])}
          color="#64748b"
          lineWidth={1}
          dashed
          transparent
          opacity={0.3}
        />
      )}

      {/* Optimized path with avoidances */}
      {pathPoints.length > 1 && (
        <Line points={pathPoints} color="#00f5ff" lineWidth={2.5} transparent opacity={0.8} />
      )}

      {/* Avoidance waypoint markers */}
      {showManeuvers && avoidanceWaypoints.map((wp, idx) => (
        <group key={idx} position={[wp.waypoint?.x || 0, 0.1, wp.waypoint?.z || 0]}>
          <Float speed={4}>
            <mesh>
              <octahedronGeometry args={[0.08, 0]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          </Float>
          
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.18, 16]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>

          <Html position={[0, 0.3, 0]} center>
            <div className="bg-green-500/20 border border-green-500/50 px-1 rounded text-xs text-green-300">
              Avoiding: {wp.avoiding_obstacle?.slice(0, 6)}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

// Obstacle with collision prediction
function ObstacleWithPrediction({ obstacle, collisionAnalysis = [], showAlternatives = true }) {
  const obstacleRef = useRef();
  const pos = obstacle.current_position || { x: 0, y: 0, z: 0 };
  const velocity = obstacle.velocity || { vx: 0, vz: 0 };

  const relevantCollisions = collisionAnalysis.filter(c => c.obstacle_id === obstacle.obstacle_id);
  const isHighRisk = relevantCollisions.some(c => c.collision_probability > 0.7);
  const isMediumRisk = relevantCollisions.some(c => c.collision_probability > 0.4);

  useFrame((state) => {
    if (obstacleRef.current) {
      // Pulse based on risk level
      if (isHighRisk) {
        obstacleRef.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 8) * 0.3;
      } else if (isMediumRisk) {
        obstacleRef.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      }
    }
  });

  const color = isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#64748b';

  // Predicted trajectory
  const trajectoryPoints = useMemo(() => {
    const points = [];
    for (let t = 0; t <= 5; t += 0.5) {
      points.push(new THREE.Vector3(
        pos.x + velocity.vx * t,
        0.1,
        pos.z + velocity.vz * t
      ));
    }
    return points;
  }, [pos, velocity]);

  return (
    <group>
      {/* Obstacle */}
      <group position={[pos.x, 0.25, pos.z]}>
        <Sphere ref={obstacleRef} args={[0.15, 16, 16]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isHighRisk ? 0.8 : 0.4} />
        </Sphere>

        {/* Direction indicator */}
        {(velocity.vx !== 0 || velocity.vz !== 0) && (
          <mesh 
            rotation={[0, Math.atan2(velocity.vz, velocity.vx) + Math.PI / 2, 0]} 
            position={[velocity.vx * 0.3, 0, velocity.vz * 0.3]}
          >
            <coneGeometry args={[0.04, 0.12, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        )}
      </group>

      {/* Avoidance buffer zone */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[pos.x, 0.03, pos.z]}>
        <ringGeometry args={[obstacle.avoidance_buffer_meters || 0.5, (obstacle.avoidance_buffer_meters || 0.5) + 0.08, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Predicted trajectory */}
      {trajectoryPoints.length > 1 && (
        <Line points={trajectoryPoints} color={color} lineWidth={1.5} dashed transparent opacity={0.4} />
      )}

      {/* Collision warning markers */}
      {relevantCollisions.map((collision, idx) => (
        <group key={idx} position={[collision.predicted_obstacle_position?.x || pos.x, 0.5, collision.predicted_obstacle_position?.z || pos.z]}>
          <Html center>
            <div className={`px-2 py-1 rounded text-xs ${isHighRisk ? 'bg-red-500/30 border-red-500 text-red-300' : 'bg-orange-500/30 border-orange-500 text-orange-300'} border animate-pulse`}>
              ⚠️ {(collision.collision_probability * 100).toFixed(0)}% risk in {collision.time_to_collision_seconds?.toFixed(1)}s
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

// Main scene
function AvoidanceScene({ agents, obstacles, avoidanceData, showManeuvers }) {
  const collisionAnalysis = avoidanceData?.collision_details || [];

  return (
    <group>
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#050510" />
      </Box>
      <gridHelper args={[16, 32, '#203050', '#0a1525']} position={[6, 0.03, 5]} />

      {obstacles.map((obstacle, idx) => (
        <ObstacleWithPrediction
          key={obstacle.obstacle_id || idx}
          obstacle={obstacle}
          collisionAnalysis={collisionAnalysis}
        />
      ))}

      {agents.map((agent, idx) => (
        <AgentWithAvoidance
          key={agent.id || idx}
          agent={agent}
          avoidanceData={avoidanceData}
          showManeuvers={showManeuvers}
        />
      ))}
    </group>
  );
}

export default function EnhancedObstacleAvoidanceVisualizer3D() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [avoidanceData, setAvoidanceData] = useState(null);
  const [showManeuvers, setShowManeuvers] = useState(true);

  const { data: agents = [] } = useQuery({
    queryKey: ['avoidance-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
    initialData: [],
    refetchInterval: 2000
  });

  const { data: obstacles = [] } = useQuery({
    queryKey: ['avoidance-obstacles'],
    queryFn: () => base44.entities.PredictiveObstacle.list('-last_updated', 30),
    initialData: [],
    refetchInterval: 1500
  });

  const planAvoidanceMutation = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('proactive-avoidance-planner', {
        agent_id: agentId,
        look_ahead_seconds: 15
      });
      return response.data;
    },
    onSuccess: (data) => {
      setAvoidanceData(data);
      const maneuvers = data.path_optimization?.maneuvers_applied || 0;
      const collisions = data.analysis?.high_risk_collisions || 0;
      
      if (maneuvers > 0) {
        toast.success(`Applied ${maneuvers} avoidance maneuvers, avoided ${collisions} high-risk collisions`);
      } else if (collisions === 0) {
        toast.info('Path is clear - no avoidance needed');
      }
      queryClient.invalidateQueries(['avoidance-agents']);
    }
  });

  const totalHighRisk = avoidanceData?.analysis?.high_risk_collisions || 0;
  const totalMediumRisk = (avoidanceData?.analysis?.potential_collisions || 0) - totalHighRisk;
  const maneuversApplied = avoidanceData?.path_optimization?.maneuvers_applied || 0;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Proactive Obstacle Avoidance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedAgent?.agent_id || ''}
              onChange={(e) => {
                const agent = agents.find(a => a.agent_id === e.target.value);
                setSelectedAgent(agent);
              }}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm flex-1"
            >
              <option value="">Select Agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.agent_id}>
                  {agent.agent_id?.slice(0, 12)} - {agent.current_activity || 'Idle'}
                </option>
              ))}
            </select>

            <Button
              onClick={() => selectedAgent && planAvoidanceMutation.mutate(selectedAgent.agent_id)}
              disabled={planAvoidanceMutation.isPending || !selectedAgent}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600"
            >
              {planAvoidanceMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Planning</>
              ) : (
                <><Route className="w-4 h-4 mr-2" /> Plan Avoidance</>
              )}
            </Button>

            <Button
              variant={showManeuvers ? 'default' : 'outline'}
              onClick={() => setShowManeuvers(!showManeuvers)}
              size="sm"
            >
              <Navigation className="w-4 h-4 mr-2" /> Maneuvers
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" /> High Risk
              </p>
              <p className={`text-xl font-bold ${totalHighRisk > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                {totalHighRisk}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-400" /> Medium Risk
              </p>
              <p className={`text-xl font-bold ${totalMediumRisk > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                {totalMediumRisk}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-400" /> Maneuvers
              </p>
              <p className="text-green-400 text-xl font-bold">{maneuversApplied}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Obstacles Tracked</p>
              <p className="text-white text-xl font-bold">{obstacles.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[550px]">
            <Canvas camera={{ position: [12, 10, 12], fov: 50 }}>
              <ambientLight intensity={0.25} />
              <pointLight position={[10, 12, 10]} intensity={1} />
              <pointLight position={[-5, 8, -5]} intensity={0.5} color="#10b981" />

              <AvoidanceScene
                agents={agents}
                obstacles={obstacles}
                avoidanceData={avoidanceData}
                showManeuvers={showManeuvers}
              />

              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {avoidanceData?.avoidance_maneuvers?.length > 0 && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Available Avoidance Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {avoidanceData.avoidance_maneuvers.slice(0, 3).map((maneuver, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Collision #{idx + 1}</span>
                    <Badge className={`${maneuver.recommended_action === 'stop' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {maneuver.recommended_action}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-700/50 rounded p-2">
                      <p className="text-slate-400">Primary</p>
                      <p className="text-cyan-400">{maneuver.primary_avoidance.type}</p>
                      <p className="text-slate-500">+{maneuver.primary_avoidance.time_penalty_seconds}s</p>
                    </div>
                    <div className="bg-slate-700/50 rounded p-2">
                      <p className="text-slate-400">Alternative</p>
                      <p className="text-purple-400">{maneuver.alternative_avoidance.type}</p>
                      <p className="text-slate-500">+{maneuver.alternative_avoidance.time_penalty_seconds}s</p>
                    </div>
                    <div className="bg-slate-700/50 rounded p-2">
                      <p className="text-slate-400">Wait</p>
                      <p className="text-green-400">{maneuver.wait_option.wait_duration_seconds}s</p>
                      <p className="text-slate-500">{(maneuver.wait_option.safety_improvement * 100).toFixed(0)}% safe</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Html, Float, Trail, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Bell, AlertTriangle, Lightbulb, Users, Thermometer, Check, X, Loader2, RefreshCw, Zap } from 'lucide-react';

// Ultra assistance bubble with rich animations
function UltraAssistanceBubble3D({ assistance, position, onAccept, onDismiss }) {
  const bubbleRef = useRef();
  const auraRef = useRef();
  const [expanded, setExpanded] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bubbleRef.current) {
      bubbleRef.current.position.y = position[1] + Math.sin(t * 2.5) * 0.12;
      
      if (assistance.assistance_content?.severity === 'critical') {
        bubbleRef.current.scale.setScalar(1 + Math.sin(t * 8) * 0.15);
      } else {
        bubbleRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.06);
      }
    }

    if (auraRef.current) {
      auraRef.current.scale.setScalar(1.8 + Math.sin(t * 2) * 0.25);
      auraRef.current.material.opacity = 0.12 + Math.sin(t * 4) * 0.06;
    }
  });

  const severityColors = {
    info: '#3b82f6',
    suggestion: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444'
  };

  const typeIcons = {
    warning: '⚠️',
    suggestion: '💡',
    delegation: '👥',
    environmental: '🌡️',
    safety: '🛡️',
    optimization: '⚡'
  };

  const color = severityColors[assistance.assistance_content?.severity] || '#64748b';
  const confidence = assistance.prediction_data?.confidence || 0.7;

  return (
    <group position={position} onClick={() => setExpanded(!expanded)}>
      {/* Outer aura */}
      <Sphere ref={auraRef} args={[0.35, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </Sphere>

      {/* Main bubble with trail */}
      <Trail width={0.2} length={10} color={color} attenuation={(t) => t * t}>
        <Float speed={2.5} floatIntensity={0.4}>
          <Sphere ref={bubbleRef} args={[0.16, 24, 24]}>
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.7} 
              metalness={0.6}
              roughness={0.3}
            />
          </Sphere>
        </Float>
      </Trail>

      {/* Sparkles for high confidence */}
      {confidence > 0.8 && (
        <Sparkles count={15} scale={0.8} size={2} speed={0.5} color={color} />
      )}

      {/* Critical pulse rings */}
      {assistance.assistance_content?.severity === 'critical' && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[0.25, 0.3, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[0.35, 0.4, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      <Html position={[0.35, 0.25, 0]} center={false}>
        <div 
          className={`bg-black/95 text-white rounded-xl shadow-2xl transition-all ${expanded ? 'p-4 min-w-80' : 'p-3 min-w-56'}`}
          style={{ borderColor: color, borderWidth: 2, borderStyle: 'solid', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{typeIcons[assistance.assistance_type] || '📢'}</span>
            <div className="flex-1">
              <p className="font-bold text-sm">{assistance.assistance_content?.title}</p>
              <p className="text-xs text-slate-400">{assistance.assistance_type}</p>
            </div>
            <Badge 
              className={`${assistance.assistance_content?.severity === 'critical' ? 'bg-red-500' : 'bg-slate-700'} text-xs`}
            >
              {assistance.assistance_content?.severity}
            </Badge>
          </div>
          
          <p className="text-slate-300 text-xs mb-3">{assistance.assistance_content?.message}</p>
          
          {/* Confidence bar */}
          {confidence && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Confidence</span>
                <span className="text-xs" style={{ color }}>{(confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded overflow-hidden">
                <div className="h-full transition-all" style={{ width: `${confidence * 100}%`, backgroundColor: color }} />
              </div>
            </div>
          )}

          {expanded && assistance.assistance_content?.recommended_actions && (
            <div className="space-y-2 mb-3">
              <p className="text-xs text-slate-400">Recommended Actions:</p>
              {assistance.assistance_content.recommended_actions.map((action, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded p-2">
                  <p className="text-white text-xs font-medium mb-1">{action.action_name}</p>
                  <p className="text-slate-400 text-xs mb-2">{action.description}</p>
                  {action.estimated_benefit && (
                    <p className="text-green-400 text-xs">✓ {action.estimated_benefit}</p>
                  )}
                  <Button
                    size="sm"
                    className="w-full mt-2 text-xs"
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept && onAccept(assistance, action);
                    }}
                  >
                    {action.auto_executable && <Zap className="w-3 h-3 mr-1" />}
                    Execute
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {!expanded && assistance.assistance_content?.recommended_actions?.slice(0, 1).map((action, idx) => (
              <Button
                key={idx}
                size="sm"
                className="flex-1 text-xs"
                style={{ backgroundColor: color }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept && onAccept(assistance, action);
                }}
              >
                {action.action_name}
              </Button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-slate-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss && onDismiss(assistance);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Html>
    </group>
  );
}

// Agent with animated status
function UltraAgentWithAssistance({ agent, assistances, thoughts }) {
  const agentRef = useRef();
  const pos = agent.current_location || { x: 0, y: 0, z: 0 };
  const agentAssistances = assistances.filter(a => a.agent_id === agent.agent_id && a.status === 'pending');
  const agentThoughts = thoughts.filter(t => t.agent_id === agent.agent_id).slice(0, 2);

  useFrame((state) => {
    if (agentRef.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.06;
      agentRef.current.scale.setScalar(breathe);
    }
  });

  const hasWarnings = agentAssistances.some(a => a.assistance_content?.severity === 'critical' || a.assistance_type === 'warning');
  const color = hasWarnings ? '#f59e0b' : agent.projection_status === 'active' ? '#00f5ff' : '#64748b';

  return (
    <group position={[pos.x, 0.35, pos.z]}>
      <Trail width={0.18} length={12} color={color} attenuation={(t) => t * t}>
        <Sphere ref={agentRef} args={[0.2, 32, 32]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} metalness={0.7} roughness={0.2} />
        </Sphere>
      </Trail>

      {/* Notification badge */}
      {agentAssistances.length > 0 && (
        <Html position={[0.25, 0.35, 0]} center>
          <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
            {agentAssistances.length}
          </div>
        </Html>
      )}

      {/* Activity indicator */}
      {agent.current_activity && (
        <Html position={[0, -0.3, 0]} center>
          <div className="bg-slate-800/90 px-2 py-1 rounded text-xs text-slate-300">
            {agent.current_activity}
          </div>
        </Html>
      )}
    </group>
  );
}

// Main scene
function UltraAssistanceScene({ agents, assistances, thoughts, onAcceptAssistance, onDismissAssistance }) {
  return (
    <group>
      <Box args={[14, 0.05, 10]} position={[5, 0, 3]}>
        <meshStandardMaterial color="#050510" metalness={0.8} roughness={0.2} />
      </Box>
      <gridHelper args={[14, 28, '#1a3a60', '#0a1a35']} position={[5, 0.03, 3]} />

      {agents.map((agent, idx) => (
        <UltraAgentWithAssistance key={agent.id || idx} agent={agent} assistances={assistances} thoughts={thoughts} />
      ))}

      {assistances.filter(a => a.status === 'pending').map((assistance, idx) => {
        const agent = agents.find(a => a.agent_id === assistance.agent_id);
        const pos = agent?.current_location || { x: idx * 2, y: 0, z: 0 };
        
        return (
          <UltraAssistanceBubble3D
            key={assistance.id || idx}
            assistance={assistance}
            position={[pos.x + 0.6, 1.2, pos.z]}
            onAccept={onAcceptAssistance}
            onDismiss={onDismissAssistance}
          />
        );
      })}
    </group>
  );
}

export default function UltraProactiveAssistancePanel3D() {
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ['ultra-assistance-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
    initialData: [],
    refetchInterval: 2000
  });

  const { data: assistances = [] } = useQuery({
    queryKey: ['ultra-proactive-assistances'],
    queryFn: () => base44.entities.ProactiveAssistance.list('-created_date', 25),
    initialData: [],
    refetchInterval: 3000
  });

  const { data: thoughts = [] } = useQuery({
    queryKey: ['ultra-assistance-thoughts'],
    queryFn: () => base44.entities.AgentThoughtProcess.list('-timestamp', 20),
    initialData: [],
    refetchInterval: 2000
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('proactive-assistance-engine', {
        scan_all_contexts: true,
        include_predictions: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.assistance_offers || 0} assistance opportunities`);
      queryClient.invalidateQueries(['ultra-proactive-assistances']);
    }
  });

  const handleAccept = async (assistance, action) => {
    await base44.entities.ProactiveAssistance.update(assistance.id, {
      status: 'accepted',
      user_response: {
        accepted: true,
        action_taken: action.action_id,
        responded_at: new Date().toISOString()
      }
    });
    toast.success(`Executing: ${action.action_name}`);
    queryClient.invalidateQueries(['ultra-proactive-assistances']);
  };

  const handleDismiss = async (assistance) => {
    await base44.entities.ProactiveAssistance.update(assistance.id, {
      status: 'dismissed',
      user_response: { accepted: false, responded_at: new Date().toISOString() }
    });
    queryClient.invalidateQueries(['ultra-proactive-assistances']);
  };

  const pendingAssistances = assistances.filter(a => a.status === 'pending');
  const warnings = pendingAssistances.filter(a => a.assistance_type === 'warning' || a.assistance_content?.severity === 'critical');
  const suggestions = pendingAssistances.filter(a => a.assistance_type === 'suggestion' || a.assistance_type === 'optimization');
  const environmental = pendingAssistances.filter(a => a.assistance_type === 'environmental');
  const delegations = pendingAssistances.filter(a => a.assistance_type === 'delegation');

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Ultra Proactive Assistance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600"
          >
            {scanMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Deep Scan for Assistance</>
            )}
          </Button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 border-l-4 border-red-500">
              <AlertTriangle className="w-5 h-5 text-red-400 mb-1" />
              <p className="text-2xl font-bold text-red-400">{warnings.length}</p>
              <p className="text-slate-400 text-xs">Warnings</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border-l-4 border-green-500">
              <Lightbulb className="w-5 h-5 text-green-400 mb-1" />
              <p className="text-2xl font-bold text-green-400">{suggestions.length}</p>
              <p className="text-slate-400 text-xs">Suggestions</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border-l-4 border-cyan-500">
              <Thermometer className="w-5 h-5 text-cyan-400 mb-1" />
              <p className="text-2xl font-bold text-cyan-400">{environmental.length}</p>
              <p className="text-slate-400 text-xs">Environmental</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border-l-4 border-purple-500">
              <Users className="w-5 h-5 text-purple-400 mb-1" />
              <p className="text-2xl font-bold text-purple-400">{delegations.length}</p>
              <p className="text-slate-400 text-xs">Delegations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">3D Assistance Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[550px]">
            <Canvas camera={{ position: [9, 7, 9], fov: 52 }}>
              <ambientLight intensity={0.2} />
              <pointLight position={[10, 12, 10]} intensity={0.9} />
              <pointLight position={[-5, 8, -5]} intensity={0.5} color="#f59e0b" />
              <pointLight position={[5, 5, 5]} intensity={0.4} color="#ec4899" />
              <spotLight position={[0, 15, 0]} angle={0.6} penumbra={0.5} intensity={0.5} color="#00f5ff" />

              <UltraAssistanceScene
                agents={agents}
                assistances={assistances}
                thoughts={thoughts}
                onAcceptAssistance={handleAccept}
                onDismissAssistance={handleDismiss}
              />

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.3} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {pendingAssistances.length > 0 && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Pending Assistances</span>
              <Badge className="bg-amber-500">{pendingAssistances.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {pendingAssistances.map(assistance => {
                const severityBg = {
                  critical: 'border-red-500 bg-red-500/10',
                  warning: 'border-orange-500 bg-orange-500/10',
                  suggestion: 'border-green-500 bg-green-500/10',
                  info: 'border-blue-500 bg-blue-500/10'
                };
                
                return (
                  <div key={assistance.id} className={`border-2 rounded-xl p-4 ${severityBg[assistance.assistance_content?.severity] || 'border-slate-600'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-bold">{assistance.assistance_content?.title}</p>
                          <Badge className="text-xs">{assistance.assistance_type}</Badge>
                        </div>
                        <p className="text-slate-300 text-sm">{assistance.assistance_content?.message}</p>
                        {assistance.prediction_data?.confidence && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1 bg-slate-700 rounded overflow-hidden">
                              <div 
                                className="h-full bg-cyan-400" 
                                style={{ width: `${assistance.prediction_data.confidence * 100}%` }} 
                              />
                            </div>
                            <span className="text-xs text-slate-400">{(assistance.prediction_data.confidence * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {assistance.assistance_content?.recommended_actions?.map((action, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          onClick={() => handleAccept(assistance, action)}
                          className="text-xs"
                        >
                          {action.action_name}
                        </Button>
                      ))}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismiss(assistance)}
                        className="text-xs text-slate-400"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
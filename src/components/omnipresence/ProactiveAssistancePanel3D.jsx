import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Bell, AlertTriangle, Lightbulb, Users, Thermometer, Check, X, Loader2, RefreshCw } from 'lucide-react';

// Assistance notification bubble
function AssistanceBubble3D({ assistance, position, onAccept, onDismiss }) {
  const bubbleRef = useRef();
  const [expanded, setExpanded] = useState(false);

  useFrame((state) => {
    if (bubbleRef.current) {
      bubbleRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      if (assistance.assistance_content?.severity === 'critical') {
        bubbleRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.1);
      }
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

  return (
    <group ref={bubbleRef} position={position} onClick={() => setExpanded(!expanded)}>
      <Float speed={2}>
        <Sphere args={[0.15, 16, 16]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </Sphere>
      </Float>

      {/* Pulse ring for critical */}
      {assistance.assistance_content?.severity === 'critical' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.25, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      <Html position={[0.3, 0.2, 0]} center={false}>
        <div 
          className={`bg-black/95 text-white rounded-lg shadow-xl transition-all ${expanded ? 'p-4 min-w-64' : 'p-2'}`}
          style={{ borderColor: color, borderWidth: 1, borderStyle: 'solid' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span>{typeIcons[assistance.assistance_type] || '📢'}</span>
            <span className="font-bold text-sm">{assistance.assistance_content?.title}</span>
          </div>
          
          {expanded && (
            <>
              <p className="text-slate-300 text-xs mb-3">{assistance.assistance_content?.message}</p>
              
              {assistance.assistance_content?.recommended_actions?.length > 0 && (
                <div className="space-y-2">
                  {assistance.assistance_content.recommended_actions.map((action, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      className="w-full text-xs"
                      style={{ backgroundColor: color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAccept && onAccept(assistance, action);
                      }}
                    >
                      {action.action_name}
                    </Button>
                  ))}
                </div>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                className="w-full mt-2 text-xs text-slate-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss && onDismiss(assistance);
                }}
              >
                Dismiss
              </Button>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}

// Agent with assistance indicators
function AgentWithAssistance({ agent, assistances }) {
  const agentRef = useRef();
  const pos = agent.current_location || { x: 0, y: 0, z: 0 };
  const agentAssistances = assistances.filter(a => a.agent_id === agent.agent_id && a.status === 'pending');

  useFrame((state) => {
    if (agentRef.current) {
      agentRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03);
    }
  });

  const hasWarnings = agentAssistances.some(a => a.assistance_type === 'warning');
  const color = hasWarnings ? '#f59e0b' : '#00f5ff';

  return (
    <group position={[pos.x, 0.3, pos.z]}>
      <Sphere ref={agentRef} args={[0.18, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </Sphere>

      {/* Notification count */}
      {agentAssistances.length > 0 && (
        <Html position={[0.2, 0.3, 0]} center>
          <div className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {agentAssistances.length}
          </div>
        </Html>
      )}
    </group>
  );
}

// Main scene
function AssistanceScene({ agents, assistances, onAcceptAssistance, onDismissAssistance }) {
  return (
    <group>
      <Box args={[14, 0.05, 10]} position={[5, 0, 3]}>
        <meshStandardMaterial color="#050510" />
      </Box>
      <gridHelper args={[14, 28, '#1a2a40', '#0a1525']} position={[5, 0.03, 3]} />

      {agents.map((agent, idx) => (
        <AgentWithAssistance key={agent.id || idx} agent={agent} assistances={assistances} />
      ))}

      {assistances.filter(a => a.status === 'pending').map((assistance, idx) => {
        const agent = agents.find(a => a.agent_id === assistance.agent_id);
        const pos = agent?.current_location || { x: idx * 2, y: 0, z: 0 };
        
        return (
          <AssistanceBubble3D
            key={assistance.id || idx}
            assistance={assistance}
            position={[pos.x + 0.5, 1, pos.z]}
            onAccept={onAcceptAssistance}
            onDismiss={onDismissAssistance}
          />
        );
      })}
    </group>
  );
}

export default function ProactiveAssistancePanel3D() {
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ['assistance-agents'],
    queryFn: () => base44.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
    initialData: []
  });

  const { data: assistances = [] } = useQuery({
    queryKey: ['proactive-assistances'],
    queryFn: () => base44.entities.ProactiveAssistance.list('-created_date', 20),
    initialData: [],
    refetchInterval: 5000
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('proactive-assistance-engine', {
        scan_all_contexts: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.assistance_offers} assistance opportunities`);
      queryClient.invalidateQueries(['proactive-assistances']);
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
    queryClient.invalidateQueries(['proactive-assistances']);
  };

  const handleDismiss = async (assistance) => {
    await base44.entities.ProactiveAssistance.update(assistance.id, {
      status: 'dismissed',
      user_response: {
        accepted: false,
        responded_at: new Date().toISOString()
      }
    });
    queryClient.invalidateQueries(['proactive-assistances']);
  };

  const pendingAssistances = assistances.filter(a => a.status === 'pending');
  const warnings = pendingAssistances.filter(a => a.assistance_type === 'warning');
  const suggestions = pendingAssistances.filter(a => a.assistance_type === 'suggestion' || a.assistance_type === 'delegation');
  const environmental = pendingAssistances.filter(a => a.assistance_type === 'environmental');

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Proactive Assistance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            className="bg-gradient-to-r from-amber-600 to-orange-600"
          >
            {scanMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Scan for Assistance</>
            )}
          </Button>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-400" /> Warnings</p>
              <p className={`text-xl font-bold ${warnings.length > 0 ? 'text-red-400' : 'text-slate-500'}`}>{warnings.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1">
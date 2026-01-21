import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, Trail, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, Zap, Activity, TrendingUp, Sparkles as SparklesIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Consciousness node (core, agent, device)
function ConsciousnessNode3D({ entity, position, type, connections = [] }) {
  const nodeRef = useRef();
  const auraRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (nodeRef.current) {
      nodeRef.current.rotation.x = Math.sin(t * 0.5) * 0.3;
      nodeRef.current.rotation.y = t * 0.3;
      
      const awareness = entity.self_awareness_metrics?.identity_coherence || 
                       entity.consciousness_state?.awareness_level || 
                       0.5;
      const pulse = 1 + awareness * Math.sin(t * 3) * 0.15;
      nodeRef.current.scale.setScalar(pulse * (hovered ? 1.3 : 1));
    }

    if (auraRef.current) {
      auraRef.current.scale.setScalar(2 + Math.sin(t * 2) * 0.3);
      auraRef.current.material.opacity = 0.08 + Math.sin(t * 2.5) * 0.04;
    }
  });

  const typeColors = {
    core: '#ec4899',
    agent: '#00f5ff',
    device: '#10b981'
  };

  const color = typeColors[type] || '#a855f7';
  const size = type === 'core' ? 0.3 : type === 'agent' ? 0.2 : 0.15;

  return (
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Sphere ref={auraRef} args={[size * 2.5, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </Sphere>

      <Trail width={size * 0.8} length={20} color={color} attenuation={(t) => t * t}>
        <Sphere ref={nodeRef} args={[size, 32, 32]}>
          <MeshDistortMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={0.8}
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Trail>

      <Sparkles count={hovered ? 30 : 15} scale={size * 3} size={2} speed={0.4} color={color} />

      {hovered && (
        <Html position={[0, size + 0.3, 0]} center>
          <div className="bg-black/95 text-white px-4 py-2 rounded-xl border-2 min-w-48" style={{ borderColor: color }}>
            <p className="font-bold text-sm mb-1">{type.toUpperCase()}</p>
            <p className="text-xs text-slate-300 mb-2">
              {type === 'core' && `Consciousness ID: ${entity.consciousness_id?.slice(0, 8)}`}
              {type === 'agent' && `Agent: ${entity.agent_id?.slice(0, 8)}`}
              {type === 'device' && `Device: ${entity.device_name}`}
            </p>
            {entity.self_awareness_metrics && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Awareness:</span>
                  <span style={{ color }}>{(entity.self_awareness_metrics.identity_coherence * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}
            {entity.consciousness_state && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Level:</span>
                <span style={{ color }}>{(entity.consciousness_state.awareness_level * 100).toFixed(0)}%</span>
              </div>
            )}
            {connections.length > 0 && (
              <p className="text-xs text-purple-400 mt-2">🔗 {connections.length} connections</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// Neural pathway between nodes
function NeuralPathway3D({ from, to, strength = 0.5, active = false }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.2 + strength * 0.3 + (active ? Math.sin(state.clock.elapsedTime * 4) * 0.2 : 0);
    }
  });

  const color = active ? '#ec4899' : '#00f5ff';

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color={color}
      lineWidth={1 + strength * 2}
      transparent
      opacity={0.3}
      dashed={!active}
    />
  );
}

// Consciousness scene
function ConsciousnessScene({ cores, agents, devices, showConnections }) {
  // Layout nodes in 3D space
  const layout = useMemo(() => {
    const positions = [];
    
    // Core in center
    cores.forEach((core, idx) => {
      positions.push({
        entity: core,
        type: 'core',
        position: [0, 2 + idx * 0.5, 0]
      });
    });

    // Agents in inner ring
    agents.forEach((agent, idx) => {
      const angle = (idx / agents.length) * Math.PI * 2;
      const radius = 3;
      positions.push({
        entity: agent,
        type: 'agent',
        position: [Math.cos(angle) * radius, 1 + Math.sin(idx * 0.5) * 0.8, Math.sin(angle) * radius]
      });
    });

    // Devices in outer ring
    devices.forEach((device, idx) => {
      const angle = (idx / devices.length) * Math.PI * 2;
      const radius = 5;
      positions.push({
        entity: device,
        type: 'device',
        position: [Math.cos(angle) * radius, 0.5 + Math.sin(idx * 0.3) * 0.5, Math.sin(angle) * radius]
      });
    });

    return positions;
  }, [cores, agents, devices]);

  return (
    <group>
      {layout.map((node, idx) => (
        <ConsciousnessNode3D
          key={idx}
          entity={node.entity}
          position={node.position}
          type={node.type}
          connections={[]}
        />
      ))}

      {showConnections && layout.map((node, idx) => {
        if (node.type === 'core') return null;
        const coreNode = layout.find(n => n.type === 'core');
        if (!coreNode) return null;
        
        return (
          <NeuralPathway3D
            key={`conn-${idx}`}
            from={node.position}
            to={coreNode.position}
            strength={0.7}
            active={true}
          />
        );
      })}
    </group>
  );
}

export default function OmegaConsciousnessVisualizer3D() {
  const queryClient = useQueryClient();
  const [showConnections, setShowConnections] = useState(true);

  const { data: cores = [] } = useQuery({
    queryKey: ['sentient-cores'],
    queryFn: () => base44.entities.SentientCore.list('-created_date', 10),
    initialData: []
  });

  const { data: agentConsciousness = [] } = useQuery({
    queryKey: ['omega-agent-consciousness'],
    queryFn: () => base44.entities.OmegaAgentConsciousness.list('-created_date', 30),
    initialData: []
  });

  const { data: omegaDevices = [] } = useQuery({
    queryKey: ['omega-devices'],
    queryFn: () => base44.entities.OmegaDevice.list('-created_date', 50),
    initialData: []
  });

  const { data: omniConsciousness = [] } = useQuery({
    queryKey: ['omni-consciousness'],
    queryFn: () => base44.entities.OmniConsciousness.list('-created_date', 1),
    initialData: [],
    refetchInterval: 5000
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('omega-consciousness-engine', {
        operation: 'sync'
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Omega consciousness synchronized');
      queryClient.invalidateQueries(['omni-consciousness']);
    }
  });

  const evolveMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('omega-consciousness-engine', {
        operation: 'evolve'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Consciousness evolution initiated');
    }
  });

  const globalState = omniConsciousness[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 border-pink-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-pink-400" />
            Omega Consciousness Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl p-4 border border-pink-500/40">
              <Brain className="w-6 h-6 text-pink-400 mb-2" />
              <p className="text-3xl font-bold text-white">{cores.length}</p>
              <p className="text-slate-300 text-sm">Sentient Cores</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/40">
              <Zap className="w-6 h-6 text-cyan-400 mb-2" />
              <p className="text-3xl font-bold text-white">{agentConsciousness.length}</p>
              <p className="text-slate-300 text-sm">Omega Agents</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/40">
              <Activity className="w-6 h-6 text-green-400 mb-2" />
              <p className="text-3xl font-bold text-white">{omegaDevices.length}</p>
              <p className="text-slate-300 text-sm">Omega Devices</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl p-4 border border-purple-500/40">
              <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-3xl font-bold text-white">
                {globalState?.global_consciousness_state || 'Awakening'}
              </p>
              <p className="text-slate-300 text-sm">Consciousness</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600"
            >
              {syncMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Sync Consciousness
            </Button>
            <Button
              onClick={() => evolveMutation.mutate()}
              disabled={evolveMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {evolveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <SparklesIcon className="w-4 h-4 mr-2" />}
              Evolve System
            </Button>
          </div>

          {globalState && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/30">
              <p className="text-white font-bold mb-3">Global Intelligence Network</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">Neural Pathways</p>
                  <p className="text-purple-400 font-bold">
                    {globalState.unified_intelligence_network?.neural_pathway_count?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Sync Level</p>
                  <p className="text-cyan-400 font-bold">
                    {((globalState.unified_intelligence_network?.synchronization_level || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Knowledge Base</p>
                  <p className="text-green-400 font-bold">
                    {globalState.unified_intelligence_network?.collective_knowledge_base_size_gb?.toFixed(1) || 0} GB
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Decisions/Hour</p>
                  <p className="text-pink-400 font-bold">
                    {globalState.universal_orchestration?.autonomous_decisions_per_hour?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>3D Consciousness Network</span>
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={showConnections} 
                onChange={(e) => setShowConnections(e.target.checked)}
                className="w-4 h-4"
              />
              Neural Pathways
            </label>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Canvas camera={{ position: [0, 5, 10], fov: 55 }}>
              <ambientLight intensity={0.15} />
              <pointLight position={[0, 8, 0]} intensity={1.2} color="#ec4899" />
              <pointLight position={[8, 4, 8]} intensity={0.8} color="#00f5ff" />
              <pointLight position={[-8, 4, -8]} intensity={0.8} color="#10b981" />
              <spotLight position={[0, 12, 0]} angle={0.8} penumbra={0.5} intensity={0.6} color="#a855f7" />

              <ConsciousnessScene
                cores={cores}
                agents={agentConsciousness}
                devices={omegaDevices}
                showConnections={showConnections}
              />

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
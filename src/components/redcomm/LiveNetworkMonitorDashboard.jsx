import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html, Float } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Activity, Zap, AlertCircle, CheckCircle2, RefreshCw, Router, X, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as THREE from 'three';

const InteractiveLiveNode = ({ node, position, onClick, isSelected, onHover, liveMetrics }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [pulsePhase] = useState(Math.random() * Math.PI * 2);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3 + pulsePhase) * 0.15;
      const scale = isSelected ? 1.8 + pulse : hovered ? 1.4 : 1 + pulse * 0.5;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
      
      if (isSelected || node.status === 'online') {
        meshRef.current.rotation.y = state.clock.elapsedTime * (isSelected ? 3 : 1);
      }
    }
  });

  const isOnline = node.status === 'online';
  const metrics = liveMetrics?.[node.id] || {};

  return (
    <group position={position}>
      <Float speed={isSelected ? 4 : 2} rotationIntensity={isSelected ? 1.5 : 0.5}>
        <Sphere 
          ref={meshRef}
          args={[0.35, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick(node);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover(node);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
          }}
        >
          <meshPhysicalMaterial 
            color={isSelected ? '#ec4899' : isOnline ? '#22c55e' : '#ef4444'}
            emissive={isSelected ? '#ec4899' : isOnline ? '#22c55e' : '#ef4444'}
            emissiveIntensity={isSelected ? 2 : isOnline ? 1.2 : 0.5}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
          />
        </Sphere>
        
        {/* Signal waves when online */}
        {isOnline && (
          <>
            <Sphere args={[0.5, 16, 16]}>
              <meshBasicMaterial color="#22c55e" transparent opacity={0.15} />
            </Sphere>
            <Sphere args={[0.65, 16, 16]}>
              <meshBasicMaterial color="#22c55e" transparent opacity={0.08} />
            </Sphere>
          </>
        )}
        
        {(hovered || isSelected) && (
          <Html distanceFactor={10}>
            <div className="bg-black/95 border-2 border-cyan-400 rounded-xl p-4 min-w-[260px] pointer-events-none backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-cyan-400 font-bold text-sm">
                  {node.node_name || `Node ${node.id?.slice(0, 8)}`}
                </div>
                <Badge className={isOnline ? 'bg-green-600' : 'bg-red-600'}>
                  {node.status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between bg-black/40 rounded p-2">
                  <span className="text-gray-400">Latency:</span>
                  <span className={`font-mono font-bold ${metrics.latency < 30 ? 'text-green-400' : metrics.latency < 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {metrics.latency || Math.floor(Math.random() * 50 + 10)}ms
                  </span>
                </div>
                <div className="flex justify-between bg-black/40 rounded p-2">
                  <span className="text-gray-400">Bandwidth:</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {metrics.bandwidth || Math.floor(Math.random() * 100 + 50)} Gbps
                  </span>
                </div>
                <div className="flex justify-between bg-black/40 rounded p-2">
                  <span className="text-gray-400">Packets/s:</span>
                  <span className="text-white font-mono font-bold">
                    {metrics.packets || Math.floor(Math.random() * 500 + 200)}K
                  </span>
                </div>
                <div className="flex justify-between bg-black/40 rounded p-2">
                  <span className="text-gray-400">Uptime:</span>
                  <span className="text-green-400 font-bold">
                    {metrics.uptime || '99.7%'}
                  </span>
                </div>
              </div>
              
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-cyan-500/30">
                  <div className="text-cyan-400 text-xs font-semibold">
                    ⚡ Click to run diagnostics
                  </div>
                </div>
              )}
            </div>
          </Html>
        )}
      </Float>
      
      <Text position={[0, 0.6, 0]} fontSize={0.12} color="white" anchorX="center">
        {node.node_name?.slice(0, 8) || 'Node'}
      </Text>
    </group>
  );
};

const LiveDataFlow = ({ from, to, active, speed = 1 }) => {
  const particleRef = useRef();
  
  useFrame((state) => {
    if (particleRef.current && active) {
      const t = ((state.clock.elapsedTime * speed) % 2) / 2;
      const fromVec = new THREE.Vector3(...from);
      const toVec = new THREE.Vector3(...to);
      particleRef.current.position.lerpVectors(fromVec, toVec, t);
    }
  });

  return active ? (
    <Sphere ref={particleRef} args={[0.08, 16, 16]} position={from}>
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2.5} />
    </Sphere>
  ) : null;
};

export default function LiveNetworkMonitorDashboard() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dataFlowActive, setDataFlowActive] = useState(true);
  const [liveMetrics, setLiveMetrics] = useState({});
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: nodes = [] } = useQuery({
    queryKey: ['redcommNodes'],
    queryFn: () => base44.entities.RedCommNetworkNode.list()
  });

  // Simulate live metrics updates
  useEffect(() => {
    if (!dataFlowActive) return;
    
    const interval = setInterval(() => {
      const newMetrics = {};
      nodes.forEach(node => {
        newMetrics[node.id] = {
          latency: Math.floor(Math.random() * 50 + 10),
          bandwidth: Math.floor(Math.random() * 100 + 50),
          packets: Math.floor(Math.random() * 500 + 200),
          uptime: '99.' + Math.floor(Math.random() * 10) + '%'
        };
      });
      setLiveMetrics(newMetrics);
    }, 2000);

    return () => clearInterval(interval);
  }, [nodes, dataFlowActive]);

  const nodePositions = nodes.slice(0, 12).map((node, idx) => {
    const angle = (idx / 12) * Math.PI * 2;
    const radius = 5;
    return {
      node,
      position: [Math.cos(angle) * radius, Math.sin(angle) * 0.8, Math.sin(angle) * radius]
    };
  });

  const runDiagnosticsMutation = useMutation({
    mutationFn: async (nodeId) => {
      const response = await base44.functions.invoke('runNetworkDiagnostics', { node_id: nodeId });
      return response.data;
    },
    onSuccess: (data) => {
      setDiagnosticsResult(data);
      queryClient.invalidateQueries({ queryKey: ['redcommNodes'] });
    }
  });

  const rerouteTrafficMutation = useMutation({
    mutationFn: async ({ nodeId, targetNodeId }) => {
      const response = await base44.functions.invoke('rerouteNetworkTraffic', { 
        source_node_id: nodeId,
        target_node_id: targetNodeId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redcommNodes'] });
    }
  });

  const handleRunDiagnostics = async () => {
    if (!selectedNode) return;
    setDiagnosticsRunning(true);
    await runDiagnosticsMutation.mutateAsync(selectedNode.id);
    setDiagnosticsRunning(false);
  };

  const handleRerouteTraffic = async () => {
    if (!selectedNode || nodes.length < 2) return;
    
    const otherNodes = nodes.filter(n => n.id !== selectedNode.id && n.status === 'online');
    if (otherNodes.length === 0) return;
    
    const targetNode = otherNodes[Math.floor(Math.random() * otherNodes.length)];
    await rerouteTrafficMutation.mutateAsync({
      nodeId: selectedNode.id,
      targetNodeId: targetNode.id
    });
  };

  const activeNodes = nodes.filter(n => n.status === 'online');
  const avgLatency = Object.values(liveMetrics).reduce((sum, m) => sum + (m.latency || 0), 0) / Object.keys(liveMetrics).length || 0;

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-xl border-blue-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Radio className="w-6 h-6 text-blue-400" />
              Live Network Monitor
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={dataFlowActive ? 'bg-green-600 animate-pulse' : 'bg-gray-600'}>
                {dataFlowActive ? 'Live' : 'Paused'}
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setDataFlowActive(!dataFlowActive)}
                className="border-cyan-400 text-cyan-400"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Click nodes to run diagnostics or reroute traffic</p>
        </CardHeader>
        <CardContent>
          <div className="h-[550px] rounded-lg bg-black/60 mb-4 border border-blue-500/20 cursor-pointer">
            <Canvas camera={{ position: [0, 8, 10], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={2} color="#3b82f6" />
              <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />
              
              {/* Central monitoring hub */}
              <Float speed={1.5} rotationIntensity={0.4}>
                <Sphere args={[0.6, 64, 64]} position={[0, 0, 0]}>
                  <meshPhysicalMaterial
                    color="#3b82f6"
                    emissive="#3b82f6"
                    emissiveIntensity={dataFlowActive ? 1.5 : 0.8}
                    metalness={0.9}
                    roughness={0.1}
                  />
                </Sphere>
                <Text position={[0, 1, 0]} fontSize={0.2} color="#3b82f6" anchorX="center">
                  Network Core
                </Text>
              </Float>

              {nodePositions.map(({ node, position }, idx) => (
                <React.Fragment key={node.id}>
                  <InteractiveLiveNode
                    node={node}
                    position={position}
                    onClick={setSelectedNode}
                    isSelected={selectedNode?.id === node.id}
                    onHover={setHoveredNode}
                    liveMetrics={liveMetrics}
                  />
                  
                  {/* Live data flow */}
                  {dataFlowActive && node.status === 'online' && idx < nodePositions.length - 1 && (
                    <LiveDataFlow
                      from={position}
                      to={nodePositions[(idx + 1) % nodePositions.length].position}
                      active={true}
                      speed={1 + Math.random()}
                    />
                  )}
                  
                  {/* Network links */}
                  {nodePositions.slice(idx + 1, idx + 3).map(({ node: node2, position: pos2 }, idx2) => {
                    const isHighlighted = hoveredNode?.id === node.id || hoveredNode?.id === node2.id || 
                                         selectedNode?.id === node.id || selectedNode?.id === node2.id;
                    return (
                      <Line
                        key={`${idx}-${idx2}`}
                        points={[position, pos2]}
                        color={isHighlighted ? '#ec4899' : node.status === 'online' ? '#3b82f6' : '#374151'}
                        lineWidth={isHighlighted ? 3 : node.status === 'online' ? 1.5 : 0.5}
                        opacity={isHighlighted ? 0.9 : 0.4}
                        transparent
                      />
                    );
                  })}
                </React.Fragment>
              ))}
              
              <OrbitControls enableDamping dampingFactor={0.05} autoRotate autoRotateSpeed={dataFlowActive ? 1.5 : 0.5} />
            </Canvas>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Online</span>
              </div>
              <div className="text-2xl font-bold text-white">{activeNodes.length}</div>
            </div>

            <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <div className="text-2xl font-bold text-white">{nodes.length}</div>
            </div>

            <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-400">Avg Latency</span>
              </div>
              <div className="text-2xl font-bold text-white">{avgLatency.toFixed(0)}ms</div>
            </div>

            <div className="bg-purple-950/30 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Traffic</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {dataFlowActive ? '2.4 Tbps' : '0 bps'}
              </div>
            </div>

            <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-gray-400">Alerts</span>
              </div>
              <div className="text-2xl font-bold text-white">0</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => setDataFlowActive(!dataFlowActive)}
              className={`flex-1 ${dataFlowActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              <Activity className="w-4 h-4 mr-2" />
              {dataFlowActive ? 'Pause Monitoring' : 'Start Monitoring'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Node Control Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="bg-black/90 border-2 border-cyan-500/60 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-white font-bold text-2xl mb-1">
                      {selectedNode.node_name || 'Network Node'}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <Badge className={selectedNode.status === 'online' ? 'bg-green-600' : 'bg-red-600'}>
                        {selectedNode.status}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white">
                        ID: {selectedNode.id?.slice(0, 12)}
                      </Badge>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Real-time metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Inbound', value: `${Math.floor(Math.random() * 500 + 100)} Mbps`, color: 'green' },
                    { label: 'Outbound', value: `${Math.floor(Math.random() * 500 + 100)} Mbps`, color: 'blue' },
                    { label: 'Error Rate', value: `${(Math.random() * 0.1).toFixed(3)}%`, color: 'amber' },
                    { label: 'CPU Usage', value: `${Math.floor(Math.random() * 30 + 40)}%`, color: 'purple' }
                  ].map((metric, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`bg-${metric.color}-950/30 rounded-lg p-3 border border-${metric.color}-500/30`}
                    >
                      <div className="text-gray-400 text-xs mb-1">{metric.label}</div>
                      <div className="text-white font-bold text-lg">{metric.value}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleRunDiagnostics}
                    disabled={diagnosticsRunning}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    {diagnosticsRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Run Diagnostics
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleRerouteTraffic}
                    disabled={rerouteTrafficMutation.isPending || selectedNode.status !== 'online'}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {rerouteTrafficMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Rerouting...
                      </>
                    ) : (
                      <>
                        <Router className="w-4 h-4 mr-2" />
                        Reroute Traffic
                      </>
                    )}
                  </Button>
                </div>

                {/* Diagnostics Results */}
                <AnimatePresence>
                  {diagnosticsResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 bg-cyan-950/30 border border-cyan-500/40 rounded-lg p-4"
                    >
                      <div className="text-cyan-400 font-bold text-sm mb-3">Diagnostics Report</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Health Score:</span>
                          <span className="text-green-400 font-bold">{diagnosticsResult.health_score || '98/100'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Packet Loss:</span>
                          <span className="text-white font-mono">{diagnosticsResult.packet_loss || '0.02%'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Jitter:</span>
                          <span className="text-white font-mono">{diagnosticsResult.jitter || '3ms'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">MTU:</span>
                          <span className="text-white font-mono">{diagnosticsResult.mtu || '1500 bytes'}</span>
                        </div>
                      </div>
                      
                      {diagnosticsResult.recommendations && (
                        <div className="mt-3 pt-3 border-t border-cyan-500/30">
                          <div className="text-cyan-400 text-xs font-bold mb-2">Recommendations:</div>
                          {diagnosticsResult.recommendations.map((rec, idx) => (
                            <div key={idx} className="text-gray-300 text-xs mb-1">• {rec}</div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {rerouteTrafficMutation.isSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 bg-green-950/30 border border-green-500/40 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Traffic successfully rerouted
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
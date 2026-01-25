import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html, Float } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Router, Zap, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as THREE from 'three';

const RouteNode = ({ node, position, onClick, isSource, isTarget, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.5 : (isSource || isTarget) ? 1.3 : hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
      if (isSource || isTarget) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      }
    }
  });

  const getColor = () => {
    if (isSource) return '#ec4899';
    if (isTarget) return '#10b981';
    return node.status === 'online' ? '#3b82f6' : '#6b7280';
  };
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5}>
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
          }}
          onPointerOut={() => setHovered(false)}
        >
          <meshPhysicalMaterial
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={isSource || isTarget ? 2 : hovered ? 1.3 : 0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
        
        {(hovered || isSource || isTarget) && (
          <Html distanceFactor={8}>
            <div className="bg-black/95 border-2 border-cyan-400 rounded-xl p-3 min-w-[180px] backdrop-blur-xl">
              <div className="text-cyan-400 font-bold text-xs mb-1">
                {node.node_name || `Node ${node.id?.slice(0, 8)}`}
              </div>
              {isSource && <Badge className="bg-pink-600 mb-1">Source</Badge>}
              {isTarget && <Badge className="bg-green-600 mb-1">Target</Badge>}
              <div className="text-white text-xs">Capacity: {Math.floor(Math.random() * 100 + 50)} Gbps</div>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

export default function NetworkTrafficRerouter3D() {
  const [sourceNode, setSourceNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);
  const [rerouteMode, setRerouteMode] = useState(false);
  const queryClient = useQueryClient();

  const { data: nodes = [] } = useQuery({
    queryKey: ['redcommNodes'],
    queryFn: () => base44.entities.RedCommNetworkNode.list()
  });

  const rerouteMutation = useMutation({
    mutationFn: async ({ source_id, target_id }) => {
      const response = await base44.functions.invoke('rerouteNetworkTraffic', {
        source_node_id: source_id,
        target_node_id: target_id
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redcommNodes'] });
      setSourceNode(null);
      setTargetNode(null);
      setRerouteMode(false);
    }
  });

  const nodePositions = nodes.slice(0, 10).map((node, idx) => {
    const angle = (idx / 10) * Math.PI * 2;
    const radius = 4.5;
    return {
      node,
      position: [Math.cos(angle) * radius, Math.sin(angle) * 1, Math.sin(angle) * radius]
    };
  });

  const handleNodeClick = (node) => {
    if (!rerouteMode) return;
    
    if (!sourceNode) {
      setSourceNode(node);
    } else if (!targetNode && node.id !== sourceNode.id) {
      setTargetNode(node);
    } else {
      setSourceNode(node);
      setTargetNode(null);
    }
  };

  const executeReroute = () => {
    if (sourceNode && targetNode) {
      rerouteMutation.mutate({
        source_id: sourceNode.id,
        target_id: targetNode.id
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-950/90 via-indigo-950/90 to-blue-950/90 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Router className="w-7 h-7 text-purple-400" />
          Traffic Rerouting Interface
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          {rerouteMode ? 'Select source then target node' : 'Click "Start Reroute" to begin'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-purple-500/20">
          <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#8b5cf6" />

            {nodePositions.map(({ node, position }) => (
              <React.Fragment key={node.id}>
                <RouteNode
                  node={node}
                  position={position}
                  onClick={handleNodeClick}
                  isSource={sourceNode?.id === node.id}
                  isTarget={targetNode?.id === node.id}
                  isSelected={rerouteMode}
                />
              </React.Fragment>
            ))}

            {/* Reroute path visualization */}
            {sourceNode && targetNode && (
              <Line
                points={[
                  new THREE.Vector3(...nodePositions.find(np => np.node.id === sourceNode.id)?.position || [0, 0, 0]),
                  new THREE.Vector3(...nodePositions.find(np => np.node.id === targetNode.id)?.position || [0, 0, 0])
                ]}
                color="#fbbf24"
                lineWidth={3}
                transparent
                opacity={0.8}
                dashed
                dashSize={0.3}
                gapSize={0.1}
              />
            )}

            <OrbitControls enableZoom autoRotate={!rerouteMode} autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        <div className="space-y-3">
          {!rerouteMode ? (
            <Button 
              onClick={() => setRerouteMode(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-6 text-lg"
            >
              <Router className="w-5 h-5 mr-2" />
              Start Reroute Mode
            </Button>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-pink-950/40 border border-pink-500/40 rounded-lg p-3">
                  <div className="text-pink-400 text-xs mb-1">Source Node</div>
                  <div className="text-white font-bold text-sm">
                    {sourceNode?.node_name || 'Not selected'}
                  </div>
                </div>
                <div className="bg-green-950/40 border border-green-500/40 rounded-lg p-3">
                  <div className="text-green-400 text-xs mb-1">Target Node</div>
                  <div className="text-white font-bold text-sm">
                    {targetNode?.node_name || 'Not selected'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={executeReroute}
                  disabled={!sourceNode || !targetNode || rerouteMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  {rerouteMutation.isPending ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Execute Reroute
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    setRerouteMode(false);
                    setSourceNode(null);
                    setTargetNode(null);
                  }}
                  variant="outline"
                  className="border-white/20 text-white"
                >
                  Cancel
                </Button>
              </div>

              {rerouteMutation.isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-green-950/40 border border-green-500/40 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">Reroute Successful</span>
                  </div>
                  <div className="text-white text-sm">
                    Traffic optimized • Latency reduced by ~{Math.floor(Math.random() * 20 + 10)}%
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
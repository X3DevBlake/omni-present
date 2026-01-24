import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Cone, Html, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Radio, Satellite, Globe } from 'lucide-react';

const MeshNode = ({ position, node, onClick, isActive }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const pulse = isActive ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2 : 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const colors = {
    ground: '#10b981',
    tactical: '#3b82f6',
    satellite: '#fbbf24'
  };

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={colors[node.type]}
          emissive={colors[node.type]}
          emissiveIntensity={isActive ? 0.9 : 0.5}
        />
      </Sphere>
      {isActive && (
        <Html distanceFactor={8}>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
            <div className="font-bold">{node.name}</div>
            <div className="text-gray-400">Bandwidth: {node.bandwidth}</div>
            <div className="text-gray-400">Latency: {node.latency}ms</div>
          </div>
        </Html>
      )}
      <Text position={[0, -0.6, 0]} fontSize={0.12} color="white" anchorX="center">
        {node.name}
      </Text>
    </group>
  );
};

const DataStream = ({ start, end, bandwidth, protocol }) => {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current) {
      const flow = (state.clock.elapsedTime % 2) / 2;
      lineRef.current.material.opacity = 0.3 + flow * 0.5;
    }
  });

  const colorMap = {
    'SCION': '#3b82f6',
    'DTN': '#fbbf24',
    'THz': '#8b5cf6'
  };

  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...start), new THREE.Vector3(...end)]}
      color={colorMap[protocol] || '#10b981'}
      lineWidth={Math.log(bandwidth) / 2}
      transparent
      opacity={0.6}
    />
  );
};

const SatelliteOrbit = ({ radius, count }) => {
  const satellites = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.3, Math.sin(angle) * radius];
  });

  return (
    <>
      {satellites.map((pos, idx) => (
        <Sphere key={idx} args={[0.15, 16, 16]} position={pos}>
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.7} />
        </Sphere>
      ))}
    </>
  );
};

export default function RedCommMeshVisualizer3D() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showSatellites, setShowSatellites] = useState(true);

  const nodes = [
    { id: 'ground1', name: 'Body', type: 'ground', pos: [-4, -2, 0], bandwidth: '10Gbps', latency: 5 },
    { id: 'ground2', name: 'Brain', type: 'ground', pos: [4, -2, 0], bandwidth: '10Gbps', latency: 5 },
    { id: 'tactical1', name: 'RedComm Node', type: 'tactical', pos: [0, 0, 0], bandwidth: '100Gbps', latency: 10 },
    { id: 'sat1', name: 'Starshield', type: 'satellite', pos: [0, 5, 0], bandwidth: '1Tbps', latency: 30 }
  ];

  const links = [
    { from: 'ground1', to: 'tactical1', protocol: 'SCION', bandwidth: 10 },
    { from: 'ground2', to: 'tactical1', protocol: 'SCION', bandwidth: 10 },
    { from: 'tactical1', to: 'sat1', protocol: 'DTN', bandwidth: 100 }
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            RedComm XG: Planetary Mesh Network
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowSatellites(!showSatellites)}
            variant="outline"
            className="border-white/20 text-white"
          >
            <Satellite className="w-4 h-4 mr-2" />
            {showSatellites ? 'Hide' : 'Show'} Orbit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* Earth representation */}
            <Sphere args={[1.5, 64, 64]} position={[0, -6, 0]}>
              <meshStandardMaterial
                color="#1e40af"
                emissive="#1e3a8a"
                emissiveIntensity={0.3}
                transparent
                opacity={0.3}
              />
            </Sphere>

            {/* Network nodes */}
            {nodes.map((node) => (
              <MeshNode
                key={node.id}
                position={node.pos}
                node={node}
                onClick={() => setSelectedNode(node)}
                isActive={selectedNode?.id === node.id}
              />
            ))}

            {/* Data streams */}
            {links.map((link, idx) => {
              const fromNode = nodes.find(n => n.id === link.from);
              const toNode = nodes.find(n => n.id === link.to);
              return (
                <DataStream
                  key={idx}
                  start={fromNode.pos}
                  end={toNode.pos}
                  bandwidth={link.bandwidth}
                  protocol={link.protocol}
                />
              );
            })}

            {/* Satellite constellation */}
            {showSatellites && <SatelliteOrbit radius={7} count={12} />}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-300">Ground Devices</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-300">THz Backhaul (100Gbps)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-gray-300">LEO Satellites (1Tbps)</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
            P_rx = P_tx + G_tx + G_rx - L_FS - L_atm
            <br />
            <span className="text-blue-400">
              6G THz: 100Gbps-1Tbps | Latency: 30-50ms (LEO)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Badge className="bg-purple-500 justify-center">SCION Path-Aware</Badge>
            <Badge className="bg-amber-500 justify-center">DTN Store-Forward</Badge>
          </div>

          <p className="text-sm text-gray-300">
            RedComm XG integrates 6G terahertz mesh (100-300 GHz) with Starshield satellite constellation, 
            using SCION for sovereign routing and DTN for interplanetary resilience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
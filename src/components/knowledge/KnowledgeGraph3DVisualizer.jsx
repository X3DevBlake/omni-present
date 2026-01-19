import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

function KnowledgeNode({ node, position, onClick, isSelected }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      if (isSelected) {
        meshRef.current.scale.setScalar(1.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
      }
    }
  });

  const nodeColors = {
    concept: '#a855f7',
    entity: '#00f5ff',
    document: '#00ff88',
    activity: '#ff8800',
    skill: '#ff0066',
    memory: '#4488ff',
  };

  const color = nodeColors[node.node_type] || '#888888';
  const size = 0.3 + (node.confidence_score || 0.5) * 0.5;

  return (
    <group position={position} onClick={onClick}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1 : 0.5}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Confidence ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size + 0.1, size + 0.2, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={node.confidence_score || 0.5} 
        />
      </mesh>

      <Text
        position={[0, -size - 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        maxWidth={2}
      >
        {node.label}
      </Text>

      {/* Access count indicator */}
      {node.access_count > 10 && (
        <Sphere args={[0.1, 16, 16]} position={[size + 0.3, 0, 0]}>
          <meshBasicMaterial color="#ffcc00" />
        </Sphere>
      )}
    </group>
  );
}

function KnowledgeEdge({ start, end, relationshipType }) {
  const points = [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ];

  const edgeColors = {
    related_to: '#00f5ff',
    derived_from: '#a855f7',
    uses: '#00ff88',
    influences: '#ff8800',
  };

  return (
    <Line
      points={points}
      color={edgeColors[relationshipType] || '#ffffff40'}
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  );
}

export default function KnowledgeGraph3DVisualizer({ agentId, onNodeSelect }) {
  const [selectedNode, setSelectedNode] = React.useState(null);

  const { data: nodes = [] } = useQuery({
    queryKey: ['knowledge-graph-nodes', agentId],
    queryFn: async () => {
      const result = await base44.entities.KnowledgeGraphNode.filter(
        agentId ? { agent_id: agentId } : {}
      );
      return result;
    },
    refetchInterval: 10000,
  });

  const positions = useMemo(() => {
    // Force-directed layout simulation
    return nodes.map((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      const radius = 5 + Math.random() * 3;
      const height = (Math.random() - 0.5) * 4;
      
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius,
      ];
    });
  }, [nodes]);

  const edges = useMemo(() => {
    const edgeList = [];
    nodes.forEach((node, index) => {
      (node.connected_nodes || []).forEach(connectedId => {
        const connectedIndex = nodes.findIndex(n => n.id === connectedId);
        if (connectedIndex !== -1 && connectedIndex > index) {
          edgeList.push({
            start: positions[index],
            end: positions[connectedIndex],
            type: node.relationship_types?.[connectedId] || 'related_to',
          });
        }
      });
    });
    return edgeList;
  }, [nodes, positions]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

        {nodes.map((node, index) => (
          <KnowledgeNode
            key={node.id}
            node={node}
            position={positions[index]}
            isSelected={selectedNode?.id === node.id}
            onClick={() => {
              setSelectedNode(node);
              onNodeSelect?.(node);
            }}
          />
        ))}

        {edges.map((edge, i) => (
          <KnowledgeEdge
            key={i}
            start={edge.start}
            end={edge.end}
            relationshipType={edge.type}
          />
        ))}

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No knowledge graph data available</p>
        </div>
      )}
    </div>
  );
}
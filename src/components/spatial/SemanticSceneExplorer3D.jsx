import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Box, Sphere } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function SpatialNode({ node, onClick }) {
  const meshRef = useRef();
  const isAgent = node.node_type === 'agent';
  const isDynamic = node.dynamic_state?.is_moving;
  
  useFrame((state) => {
    if (meshRef.current && isDynamic) {
      meshRef.current.rotation.y += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const color = useMemo(() => {
    const colorMap = {
      wall: '#888888',
      floor: '#666666',
      furniture: '#8B4513',
      agent: '#00FF00',
      device: '#0088FF',
      hazard: '#FF0000',
      poi: '#FFD700',
      dynamic_object: '#FF00FF'
    };
    return colorMap[node.node_type] || '#CCCCCC';
  }, [node.node_type]);

  const position = [
    node.spatial_coordinates?.x || 0,
    node.spatial_coordinates?.y || 0,
    node.spatial_coordinates?.z || 0
  ];

  return (
    <group position={position} onClick={() => onClick(node)}>
      {isAgent ? (
        <Sphere ref={meshRef} args={[0.5, 16, 16]}>
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
      ) : (
        <Box ref={meshRef} args={[1, 1, 1]}>
          <meshStandardMaterial 
            color={color}
            transparent
            opacity={isDynamic ? 0.8 : 0.6}
          />
        </Box>
      )}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {node.node_type}
      </Text>
      {node.confidence_score && (
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.2}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
        >
          {(node.confidence_score * 100).toFixed(0)}%
        </Text>
      )}
    </group>
  );
}

function RelationshipLine({ from, to, type }) {
  const points = useMemo(() => [
    [from.x || 0, from.y || 0, from.z || 0],
    [to.x || 0, to.y || 0, to.z || 0]
  ], [from, to]);

  const color = type === 'connected_to' ? '#00FF00' : '#0088FF';

  return (
    <Line 
      points={points} 
      color={color}
      lineWidth={2}
      dashed
      dashScale={50}
      dashSize={3}
      dashOffset={0}
    />
  );
}

function SceneContent({ nodes, selectedNode, onNodeClick }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0088FF" />
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={50}
        minDistance={5}
      />

      {nodes.map((node, idx) => (
        <SpatialNode 
          key={node.id || idx} 
          node={node}
          onClick={onNodeClick}
        />
      ))}

      {/* Grid helper */}
      <gridHelper args={[20, 20, '#444444', '#222222']} />
    </>
  );
}

export default function SemanticSceneExplorer3D({ nodes = [], title = "Semantic Scene Graph" }) {
  const [selectedNode, setSelectedNode] = React.useState(null);

  const stats = useMemo(() => {
    return {
      total: nodes.length,
      agents: nodes.filter(n => n.node_type === 'agent').length,
      dynamic: nodes.filter(n => n.dynamic_state?.is_moving).length,
      avgConfidence: nodes.length > 0 
        ? (nodes.reduce((sum, n) => sum + (n.confidence_score || 0), 0) / nodes.length * 100).toFixed(1)
        : 0
    };
  }, [nodes]);

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          {title}
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-slate-800 text-white">
              {stats.total} Nodes
            </Badge>
            <Badge variant="outline" className="bg-green-900 text-green-200">
              {stats.agents} Agents
            </Badge>
            <Badge variant="outline" className="bg-purple-900 text-purple-200">
              {stats.dynamic} Dynamic
            </Badge>
            <Badge variant="outline" className="bg-yellow-900 text-yellow-200">
              {stats.avgConfidence}% Confidence
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full rounded-lg overflow-hidden bg-black">
          <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000000', 10, 50]} />
            <SceneContent 
              nodes={nodes}
              selectedNode={selectedNode}
              onNodeClick={setSelectedNode}
            />
          </Canvas>
        </div>
        
        {selectedNode && (
          <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h4 className="text-white font-semibold mb-2">Selected Node</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-400">Type:</div>
              <div className="text-white">{selectedNode.node_type}</div>
              <div className="text-slate-400">Position:</div>
              <div className="text-white">
                ({selectedNode.spatial_coordinates?.x?.toFixed(1)}, 
                 {selectedNode.spatial_coordinates?.y?.toFixed(1)}, 
                 {selectedNode.spatial_coordinates?.z?.toFixed(1)})
              </div>
              <div className="text-slate-400">Confidence:</div>
              <div className="text-white">
                {((selectedNode.confidence_score || 0) * 100).toFixed(1)}%
              </div>
              {selectedNode.semantic_tags?.length > 0 && (
                <>
                  <div className="text-slate-400">Tags:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.semantic_tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
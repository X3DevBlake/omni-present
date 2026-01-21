import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Line, Html, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Network, Scan, Loader2, Eye, Layers } from 'lucide-react';

function SemanticObject({ node, onSelect, isSelected }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  
  const pos = node.position || { x: 0, y: 0, z: 0 };
  const dims = node.dimensions || { width: 0.5, height: 0.5, depth: 0.5 };

  useFrame((state) => {
    if (ref.current) {
      if (isSelected) {
        ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.05);
      }
    }
  });

  const typeColors = {
    furniture: '#f59e0b',
    appliance: '#3b82f6',
    door: '#10b981',
    window: '#06b6d4',
    wall: '#64748b',
    floor: '#334155',
    decoration: '#a855f7',
    plant: '#22c55e'
  };

  const color = typeColors[node.object_type] || '#ffffff';

  return (
    <group
      position={[pos.x, pos.y + (dims.height || 0.5) / 2, pos.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect && onSelect(node)}
    >
      <Box ref={ref} args={[dims.width || 0.5, dims.height || 0.5, dims.depth || 0.5]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 0.6 : 0.2}
          transparent
          opacity={node.properties?.interactable ? 0.9 : 0.6}
          wireframe={!node.properties?.interactable}
        />
      </Box>

      {/* Interactable indicator */}
      {node.properties?.interactable && (
        <Float speed={3}>
          <Sphere args={[0.08, 16, 16]} position={[0, dims.height / 2 + 0.15, 0]}>
            <meshBasicMaterial color="#00f5ff" />
          </Sphere>
        </Float>
      )}

      {(hovered || isSelected) && (
        <Html position={[0, dims.height / 2 + 0.4, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-40 shadow-xl">
            <p className="font-bold" style={{ color }}>{node.label}</p>
            <p className="text-slate-400">{node.object_type}</p>
            {node.properties?.semantic_tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {node.properties.semantic_tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="bg-slate-700 px-1 rounded text-xs">{tag}</span>
                ))}
              </div>
            )}
            <p className="text-green-400 text-xs mt-1">Confidence: {((node.confidence || 0.9) * 100).toFixed(0)}%</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function RelationshipEdge({ from, to, relationship }) {
  const relationshipColors = {
    on_top_of: '#f59e0b',
    next_to: '#3b82f6',
    inside: '#10b981',
    contains: '#a855f7',
    supports: '#06b6d4',
    blocks: '#ef4444',
    connected_to: '#ec4899'
  };

  const color = relationshipColors[relationship] || '#64748b';

  const midPoint = new THREE.Vector3(
    (from.x + to.x) / 2,
    Math.max(from.y, to.y) + 0.5,
    (from.z + to.z) / 2
  );

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(from.x, from.y, from.z),
    midPoint,
    new THREE.Vector3(to.x, to.y, to.z)
  );

  const points = curve.getPoints(20);

  return (
    <Line points={points} color={color} lineWidth={2} dashed transparent opacity={0.5} />
  );
}

function NavigationWaypoint({ waypoint }) {
  const ref = useRef();
  const pos = waypoint.position || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <group position={[pos.x, 0.1, pos.z]}>
      <mesh ref={ref}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 8]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.6} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function SceneGraph3D({ graph, selectedNode, onSelectNode, showRelationships, showWaypoints }) {
  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];
  const waypoints = graph?.navigation_mesh?.waypoints || [];

  const getNodePosition = (nodeId) => {
    const node = nodes.find(n => n.node_id === nodeId);
    return node?.position || { x: 0, y: 0.5, z: 0 };
  };

  return (
    <Canvas camera={{ position: [10, 8, 10], fov: 55 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 12, 10]} intensity={1} />
      <pointLight position={[-5, 10, -5]} intensity={0.5} color="#a855f7" />

      {/* Floor */}
      <Box args={[16, 0.05, 14]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#080815" />
      </Box>
      <gridHelper args={[16, 16, '#1e3a5f', '#0f172a']} position={[6, 0.03, 5]} />

      {/* Semantic objects */}
      {nodes.map((node, idx) => (
        <SemanticObject
          key={node.node_id || idx}
          node={node}
          isSelected={selectedNode?.node_id === node.node_id}
          onSelect={onSelectNode}
        />
      ))}

      {/* Relationships */}
      {showRelationships && edges.map((edge, idx) => (
        <RelationshipEdge
          key={idx}
          from={getNodePosition(edge.from_node)}
          to={getNodePosition(edge.to_node)}
          relationship={edge.relationship}
        />
      ))}

      {/* Navigation waypoints */}
      {showWaypoints && waypoints.map((wp, idx) => (
        <NavigationWaypoint key={wp.waypoint_id || idx} waypoint={wp} />
      ))}

      <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}

export default function SemanticSceneGraph3D() {
  const queryClient = useQueryClient();
  const [selectedNode, setSelectedNode] = useState(null);
  const [showRelationships, setShowRelationships] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);

  const { data: semanticGraphs = [] } = useQuery({
    queryKey: ['semantic-graphs'],
    queryFn: () => base44.entities.EnvironmentSemanticGraph.list('-created_date', 5),
    initialData: []
  });

  const buildGraphMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('build-semantic-scene-graph', {
        scan_data: {
          room_dimensions: { width: 12, depth: 10, height: 3 },
          timestamp: new Date().toISOString()
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Semantic graph built! ${data.summary?.total_objects || 0} objects detected`);
      queryClient.invalidateQueries(['semantic-graphs']);
    }
  });

  const currentGraph = semanticGraphs[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-400" />
            Semantic Scene Graph
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => buildGraphMutation.mutate()}
              disabled={buildGraphMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {buildGraphMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing</>
              ) : (
                <><Scan className="w-4 h-4 mr-2" /> Build Scene Graph</>
              )}
            </Button>

            <Button
              variant={showRelationships ? 'default' : 'outline'}
              onClick={() => setShowRelationships(!showRelationships)}
              size="sm"
            >
              <Layers className="w-4 h-4 mr-2" />
              Relationships
            </Button>

            <Button
              variant={showWaypoints ? 'default' : 'outline'}
              onClick={() => setShowWaypoints(!showWaypoints)}
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Waypoints
            </Button>
          </div>

          {currentGraph?.ai_analysis && (
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Room Type</p>
                <p className="text-white font-bold">{currentGraph.ai_analysis.room_type || 'Unknown'}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Objects</p>
                <p className="text-white font-bold">{currentGraph.nodes?.length || 0}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Relationships</p>
                <p className="text-white font-bold">{currentGraph.edges?.length || 0}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Safety Score</p>
                <p className="text-white font-bold">{currentGraph.ai_analysis.safety_score || 0}/100</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">3D Scene Graph Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[550px]">
            <SceneGraph3D
              graph={currentGraph}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              showRelationships={showRelationships}
              showWaypoints={showWaypoints}
            />
          </div>
        </CardContent>
      </Card>

      {selectedNode && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Selected: {selectedNode.label}
              <Badge>{selectedNode.object_type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Position</p>
                <p className="text-white">
                  X: {selectedNode.position?.x?.toFixed(2)}, Y: {selectedNode.position?.y?.toFixed(2)}, Z: {selectedNode.position?.z?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Dimensions</p>
                <p className="text-white">
                  {selectedNode.dimensions?.width?.toFixed(2)} x {selectedNode.dimensions?.height?.toFixed(2)} x {selectedNode.dimensions?.depth?.toFixed(2)}m
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Properties</p>
                <div className="flex gap-2">
                  {selectedNode.properties?.interactable && <Badge className="bg-green-500/20 text-green-400">Interactable</Badge>}
                  {selectedNode.properties?.movable && <Badge className="bg-blue-500/20 text-blue-400">Movable</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
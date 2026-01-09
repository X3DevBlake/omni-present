import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Search, GitBranch, Tag, Sparkles, Database } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

function KnowledgeNode({ position, data, onClick, selected, newNode }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !selected) {
      meshRef.current.rotation.y += 0.01;
    }
    if (meshRef.current && newNode) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => onClick(data)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={selected ? 1.5 : hovered ? 1.2 : 1}
      >
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={selected ? '#00f5ff' : data.color}
          emissive={data.color}
          emissiveIntensity={selected ? 1 : hovered ? 0.8 : 0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {data.label}
      </Text>
      {data.version && (
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.15}
          color="#a855f7"
          anchorX="center"
          anchorY="middle"
        >
          v{data.version}
        </Text>
      )}
    </group>
  );
}

function ConnectionLine({ start, end, active, strength = 1 }) {
  return (
    <Line
      points={[start, end]}
      color={active ? '#00f5ff' : '#a855f7'}
      lineWidth={active ? 2 : 1}
      opacity={strength * 0.8}
    />
  );
}

export default function EnhancedKnowledgeGraph3D() {
  const [nodes, setNodes] = useState([
    { id: 1, label: 'AI Models', category: 'core', color: '#00f5ff', connections: [2, 3, 4], version: '2.1', tags: ['ml', 'core'] },
    { id: 2, label: 'Training Data', category: 'data', color: '#a855f7', connections: [1, 5], version: '1.5', tags: ['data'] },
    { id: 3, label: 'Algorithms', category: 'core', color: '#ec4899', connections: [1, 4, 6], version: '3.0', tags: ['algorithms'] },
    { id: 4, label: 'Neural Networks', category: 'core', color: '#10b981', connections: [1, 3], version: '2.8', tags: ['nn', 'core'] },
    { id: 5, label: 'Datasets', category: 'data', color: '#f59e0b', connections: [2, 7], version: '1.2', tags: ['data'] },
    { id: 6, label: 'Deep Learning', category: 'core', color: '#3b82f6', connections: [3, 8], version: '2.5', tags: ['dl', 'core'] },
    { id: 7, label: 'Data Processing', category: 'data', color: '#ef4444', connections: [5], version: '1.8', tags: ['processing'] },
    { id: 8, label: 'Optimization', category: 'methods', color: '#14b8a6', connections: [6, 3], version: '2.0', tags: ['optimization'] }
  ]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [semanticResults, setSemanticResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [versionHistory, setVersionHistory] = useState({});
  const [autoExtractRunning, setAutoExtractRunning] = useState(false);
  const [newNodeIds, setNewNodeIds] = useState([]);

  const categories = ['all', 'core', 'data', 'methods'];

  useEffect(() => {
    if (searchTerm.length > 2) {
      performSemanticSearch();
    }
  }, [searchTerm]);

  const performSemanticSearch = async () => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Given the search query "${searchTerm}", find semantically related knowledge nodes from: ${nodes.map(n => n.label).join(', ')}. Return relevant node labels.`,
        response_json_schema: {
          type: 'object',
          properties: {
            related_nodes: { type: 'array', items: { type: 'string' } },
            relevance_scores: { type: 'object' }
          }
        }
      });
      setSemanticResults(response.related_nodes || []);
    } catch (error) {
      console.error('Semantic search failed:', error);
    }
  };

  const extractKnowledgeFromSource = async (source) => {
    setAutoExtractRunning(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract key knowledge concepts from: "${source}". Create nodes with labels, categories, and connections to existing knowledge.`,
        response_json_schema: {
          type: 'object',
          properties: {
            new_nodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  category: { type: 'string' },
                  connections_to: { type: 'array', items: { type: 'string' } },
                  tags: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      const colors = ['#00f5ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
      const extractedNodes = response.new_nodes.map((node, idx) => ({
        id: nodes.length + idx + 1,
        label: node.label,
        category: node.category || 'extracted',
        color: colors[idx % colors.length],
        connections: [],
        version: '1.0',
        tags: node.tags || [],
        extracted: true
      }));

      setNodes([...nodes, ...extractedNodes]);
      setNewNodeIds(extractedNodes.map(n => n.id));
      
      setTimeout(() => setNewNodeIds([]), 3000);
    } catch (error) {
      console.error('Knowledge extraction failed:', error);
    } finally {
      setAutoExtractRunning(false);
    }
  };

  const createNewVersion = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const currentVersion = parseFloat(node.version);
    const newVersion = (currentVersion + 0.1).toFixed(1);
    
    if (!versionHistory[nodeId]) {
      versionHistory[nodeId] = [{ version: node.version, timestamp: new Date().toISOString() }];
    }
    
    versionHistory[nodeId].push({ version: newVersion, timestamp: new Date().toISOString() });
    
    setNodes(nodes.map(n => 
      n.id === nodeId ? { ...n, version: newVersion } : n
    ));
    setVersionHistory({ ...versionHistory });
  };

  const getNodePosition = (index, total) => {
    const radius = 4;
    const angle = (index / total) * Math.PI * 2;
    const height = Math.sin(angle * 2) * 2;
    return [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ];
  };

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         semanticResults.includes(node.label);
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">AI-Enhanced Knowledge Graph 3D</h3>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => extractKnowledgeFromSource('recent agent interactions and learning data')}
              disabled={autoExtractRunning}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {autoExtractRunning ? 'Extracting...' : 'Auto-Extract'}
            </motion.button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Semantic search knowledge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            />
          </div>
          <div className="flex gap-2">
            {categories.map(cat => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border border-white/10 text-white/70'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="h-[600px] rounded-xl overflow-hidden bg-black/20">
          <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />

            {filteredNodes.map((node, index) => (
              <KnowledgeNode
                key={node.id}
                position={getNodePosition(index, filteredNodes.length)}
                data={node}
                onClick={setSelectedNode}
                selected={selectedNode?.id === node.id}
                newNode={newNodeIds.includes(node.id)}
              />
            ))}

            {filteredNodes.map((node, index) => {
              const nodePos = getNodePosition(index, filteredNodes.length);
              return node.connections.map(connId => {
                const connNode = filteredNodes.find(n => n.id === connId);
                if (!connNode) return null;
                const connIndex = filteredNodes.findIndex(n => n.id === connId);
                const connPos = getNodePosition(connIndex, filteredNodes.length);
                const active = selectedNode?.id === node.id || selectedNode?.id === connId;
                return (
                  <ConnectionLine
                    key={`${node.id}-${connId}`}
                    start={nodePos}
                    end={connPos}
                    active={active}
                  />
                );
              });
            })}

            <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        {/* Selected Node Info */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-bold text-lg">{selectedNode.label}</h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => createNewVersion(selectedNode.id)}
                className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 text-sm font-semibold flex items-center gap-2"
              >
                <GitBranch className="w-3 h-3" />
                New Version
              </motion.button>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
              <div>
                <span className="text-white/60">Category:</span>
                <span className="text-white ml-2">{selectedNode.category}</span>
              </div>
              <div>
                <span className="text-white/60">Version:</span>
                <span className="text-cyan-400 ml-2 font-bold">v{selectedNode.version}</span>
              </div>
              <div>
                <span className="text-white/60">Connections:</span>
                <span className="text-white ml-2">{selectedNode.connections.length}</span>
              </div>
            </div>
            {selectedNode.tags && (
              <div className="flex gap-2 flex-wrap mb-3">
                {selectedNode.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-white/70 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {versionHistory[selectedNode.id] && (
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-white/60 text-xs mb-2 font-semibold">Version History:</p>
                <div className="space-y-1">
                  {versionHistory[selectedNode.id].map((v, idx) => (
                    <div key={idx} className="text-xs text-white/70 flex justify-between">
                      <span>v{v.version}</span>
                      <span className="text-white/40">{new Date(v.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-cyan-400" />
              <p className="text-white/70 text-xs">Total Nodes</p>
            </div>
            <p className="text-white font-bold text-xl">{nodes.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="w-4 h-4 text-purple-400" />
              <p className="text-white/70 text-xs">Versions</p>
            </div>
            <p className="text-white font-bold text-xl">{Object.keys(versionHistory).length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-green-400" />
              <p className="text-white/70 text-xs">Categories</p>
            </div>
            <p className="text-white font-bold text-xl">{categories.length - 1}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <p className="text-white/70 text-xs">AI Extracted</p>
            </div>
            <p className="text-white font-bold text-xl">{nodes.filter(n => n.extracted).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
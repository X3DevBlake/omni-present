import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html, Float } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { DollarSign, TrendingUp, BarChart3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InteractiveWealthNode = ({ position, value, type, onClick, isSelected }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.5 : hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      meshRef.current.rotation.y = state.clock.elapsedTime * (isSelected ? 1 : 0.5);
    }
  });
  
  const typeColors = {
    trading: '#10b981',
    grid: '#8b5cf6',
    project: '#f59e0b',
    autonomous: '#3b82f6'
  };
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5}>
        <Sphere 
          ref={meshRef}
          args={[0.3, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onClick({ type, value, position });
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            color={typeColors[type]}
            emissive={typeColors[type]}
            emissiveIntensity={isSelected ? 1.5 : hovered ? 1.2 : 0.8}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
        
        {(hovered || isSelected) && (
          <Html distanceFactor={8}>
            <div className="bg-black/90 border border-green-400 rounded-lg p-3 min-w-[150px] pointer-events-none backdrop-blur-xl">
              <div className="text-green-400 font-bold text-xs mb-1 capitalize">{type} Stream</div>
              <div className="text-white text-lg font-bold">${(value / 1000).toFixed(0)}K</div>
              <div className="text-cyan-400 text-xs mt-1">Click for analysis</div>
            </div>
          </Html>
        )}
      </Float>
      
      <Text position={[0, 0.5, 0]} fontSize={0.12} color="white" anchorX="center">
        ${(value / 1000).toFixed(0)}K
      </Text>
    </group>
  );
};

export default function EnhancedInteractiveSentientFinance3D() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [analysisPanel, setAnalysisPanel] = useState(null);

  const wealthNodes = [
    { position: [-2, 1, 0], value: 45000, type: 'trading' },
    { position: [2, 1, 0], value: 32000, type: 'grid' },
    { position: [-2, -1, 0], value: 78000, type: 'project' },
    { position: [2, -1, 0], value: 56000, type: 'autonomous' }
  ];

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    
    // Generate analysis based on node type
    const analyses = {
      trading: {
        title: 'Algorithmic Trading',
        metrics: {
          'Win Rate': '68%',
          'Sharpe Ratio': '2.4',
          'Max Drawdown': '-12%',
          'Avg Return': '+15%/mo'
        },
        insights: ['High-frequency strategies performing well', 'Momentum indicators strong', 'Consider scaling position']
      },
      grid: {
        title: 'GRID Emissions',
        metrics: {
          'Staked Agents': '12',
          'Monthly ROI': '25%',
          'Total Staked': '$32K',
          'Rewards': '$8K/mo'
        },
        insights: ['Top performing agents identified', 'Diversification optimal', 'New agent opportunities available']
      },
      project: {
        title: 'Project Financing',
        metrics: {
          'Active Projects': '5',
          'IRR': '18%',
          'Total Invested': '$78K',
          'Risk Score': 'Low'
        },
        insights: ['Solar farm project ahead of schedule', 'Satellite launch on track', 'New opportunities in quantum']
      },
      autonomous: {
        title: 'Autonomous Networks',
        metrics: {
          'Network Size': '847 nodes',
          'Efficiency': '94%',
          'Uptime': '99.7%',
          'Revenue': '$56K/mo'
        },
        insights: ['Self-optimization active', 'Network expanding', 'Zero downtime this month']
      }
    };
    
    setAnalysisPanel(analyses[node.type]);
  };

  return (
    <div className="relative">
      <Card className="bg-gradient-to-br from-emerald-950/90 via-green-950/90 to-teal-950/90 backdrop-blur-xl border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-emerald-400" />
            Interactive Sentient Finance Engine
          </CardTitle>
          <p className="text-gray-300 text-sm mt-2">
            Click wealth nodes to analyze revenue streams in real-time
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-emerald-500/20 cursor-pointer">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={0.8} color="#10b981" />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

              {/* Central OML core */}
              <Float speed={1} rotationIntensity={0.3}>
                <group position={[0, 0, 0]}>
                  <Sphere args={[0.4, 32, 32]}>
                    <meshStandardMaterial
                      color="#fbbf24"
                      emissive="#fbbf24"
                      emissiveIntensity={1.2}
                      metalness={0.9}
                      roughness={0.1}
                    />
                  </Sphere>
                  <Text position={[0, 0.7, 0]} fontSize={0.15} color="#fbbf24" anchorX="center">
                    OML Core
                  </Text>
                </group>
              </Float>

              {/* Interactive wealth nodes */}
              {wealthNodes.map((node, idx) => (
                <React.Fragment key={idx}>
                  <InteractiveWealthNode
                    position={node.position}
                    value={node.value}
                    type={node.type}
                    onClick={handleNodeClick}
                    isSelected={selectedNode?.type === node.type}
                  />
                  <Line
                    points={[
                      new THREE.Vector3(0, 0, 0),
                      new THREE.Vector3(...node.position)
                    ]}
                    color={selectedNode?.type === node.type ? '#fbbf24' : '#10b981'}
                    lineWidth={selectedNode?.type === node.type ? 3 : 1}
                    transparent
                    opacity={selectedNode?.type === node.type ? 0.8 : 0.4}
                  />
                </React.Fragment>
              ))}

              <OrbitControls enableZoom autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {wealthNodes.map((node, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleNodeClick(node)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedNode?.type === node.type
                    ? 'border-green-400 bg-green-500/20'
                    : 'border-gray-700 bg-black/40 hover:border-gray-500'
                }`}
              >
                <div className="text-white text-sm font-bold capitalize">{node.type}</div>
                <div className="text-green-400 text-xs">${(node.value / 1000).toFixed(0)}K</div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Panel */}
      <AnimatePresence>
        {analysisPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4"
          >
            <Card className="bg-black/90 border-2 border-green-500/60 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-xl flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-400" />
                      {analysisPanel.title}
                    </h3>
                    <Badge className="mt-2 bg-green-600/40">Live Analysis</Badge>
                  </div>
                  <button onClick={() => setAnalysisPanel(null)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {Object.entries(analysisPanel.metrics).map(([key, value]) => (
                    <div key={key} className="bg-green-950/30 rounded-lg p-3 border border-green-500/20">
                      <div className="text-gray-400 text-xs">{key}</div>
                      <div className="text-white font-bold text-lg">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="text-green-400 text-sm font-bold">AI Insights:</div>
                  {analysisPanel.insights.map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-black/40 rounded p-3 text-gray-300 text-sm"
                    >
                      • {insight}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { GitBranch, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const CausalNode = ({ position, variable, isCause, isEffect }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const intensity = (isCause ? 1 : 0) + (isEffect ? 0.5 : 0);
      meshRef.current.material.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * intensity * 0.4;
    }
  });
  
  const color = isCause ? '#10b981' : isEffect ? '#3b82f6' : '#8b5cf6';
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.12} color="white" anchorX="center">
        {variable}
      </Text>
    </group>
  );
};

const CausalEdge = ({ from, to, strength }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
      color={strength > 0 ? '#10b981' : '#ef4444'}
      lineWidth={Math.abs(strength) * 3}
      transparent
      opacity={0.6}
    />
  );
};

export default function CausalReasoningEngine3D() {
  const [causalGraph, setCausalGraph] = useState(null);
  const [isReasoning, setIsReasoning] = useState(false);

  const runCausalInference = () => {
    setIsReasoning(true);
    
    // Simulate causal graph inference
    const variables = [
      { name: 'Market_Vol', pos: [-2, 2, 0], isCause: true, isEffect: false },
      { name: 'Portfolio', pos: [0, 0, 0], isCause: false, isEffect: true },
      { name: 'Risk', pos: [2, 1, 0], isCause: true, isEffect: true },
      { name: 'Returns', pos: [0, -2, 0], isCause: false, isEffect: true }
    ];
    
    const causal_edges = [
      { from: variables[0].pos, to: variables[1].pos, strength: 0.75 },
      { from: variables[2].pos, to: variables[1].pos, strength: -0.45 },
      { from: variables[1].pos, to: variables[3].pos, strength: 0.82 }
    ];
    
    setCausalGraph({ variables, edges: causal_edges });
    setTimeout(() => setIsReasoning(false), 1500);
  };

  return (
    <Card className="bg-gradient-to-br from-violet-950/90 via-fuchsia-950/90 to-purple-950/90 backdrop-blur-xl border-violet-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <GitBranch className="w-7 h-7 text-violet-400" />
          Causal Reasoning Engine
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Interactive causal inference and counterfactual analysis
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-violet-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#8b5cf6" />

            {causalGraph?.variables.map((variable, idx) => (
              <CausalNode
                key={idx}
                position={variable.pos}
                variable={variable.name}
                isCause={variable.isCause}
                isEffect={variable.isEffect}
              />
            ))}

            {causalGraph?.edges.map((edge, idx) => (
              <CausalEdge
                key={idx}
                from={edge.from}
                to={edge.to}
                strength={edge.strength}
              />
            ))}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        {causalGraph && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-black/60 rounded-lg p-4 border border-violet-500/30"
          >
            <div className="text-violet-400 text-sm font-bold mb-2">Causal Inference Results</div>
            <div className="space-y-1 text-xs">
              {causalGraph.edges.map((edge, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-300">Effect strength:</span>
                  <Badge className={edge.strength > 0 ? 'bg-green-600' : 'bg-red-600'}>
                    {edge.strength > 0 ? '+' : ''}{edge.strength.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <Button
          onClick={runCausalInference}
          disabled={isReasoning}
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isReasoning ? 'Analyzing...' : 'Run Causal Inference'}
        </Button>
      </CardContent>
    </Card>
  );
}
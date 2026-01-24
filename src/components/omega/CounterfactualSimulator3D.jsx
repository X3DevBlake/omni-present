import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as THREE from 'three';
import { GitBranch, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const OutcomeNode = ({ position, outcome, probability, isCounterfactual }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05;
      meshRef.current.scale.setScalar(0.25 + probability * 0.3 + pulse);
      meshRef.current.material.emissiveIntensity = 0.5 + probability * 0.8;
    }
  });
  
  const color = isCounterfactual ? '#ec4899' : '#10b981';
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.25, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={isCounterfactual ? 0.7 : 1}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.1} color="white" anchorX="center">
        {outcome}
      </Text>
      <Text position={[0, -0.4, 0]} fontSize={0.08} color={color} anchorX="center">
        {(probability * 100).toFixed(0)}%
      </Text>
    </group>
  );
};

const DecisionPath = ({ from, to, taken }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = taken ? 
        0.8 : 
        0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...from), new THREE.Vector3(...to)]}
      color={taken ? '#10b981' : '#ec4899'}
      lineWidth={taken ? 3 : 1.5}
      transparent
      opacity={0.6}
      dashed={!taken}
      dashSize={0.1}
      gapSize={0.05}
    />
  );
};

export default function CounterfactualSimulator3D() {
  const [scenario, setScenario] = useState('market_decision');
  const [simulation, setSimulation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const scenarios = {
    market_decision: {
      decision_point: 'Market Entry',
      actual_outcome: { label: 'Buy', probability: 0.85, result: '+12% ROI' },
      counterfactuals: [
        { label: 'Hold', probability: 0.65, result: '+3% ROI' },
        { label: 'Sell', probability: 0.45, result: '-5% ROI' }
      ]
    },
    resource_allocation: {
      decision_point: 'Resource Split',
      actual_outcome: { label: 'Equal', probability: 0.75, result: '0.82 fairness' },
      counterfactuals: [
        { label: 'Merit', probability: 0.68, result: '0.65 fairness' },
        { label: 'Random', probability: 0.35, result: '0.45 fairness' }
      ]
    }
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulation(scenarios[scenario]);
    setTimeout(() => setIsSimulating(false), 1000);
  };

  const actualPos = [0, 1.5, 0];
  const counterfactualPositions = [
    [-2, -1, 0],
    [2, -1, 0]
  ];

  return (
    <Card className="bg-gradient-to-br from-fuchsia-950/90 via-purple-950/90 to-violet-950/90 backdrop-blur-xl border-fuchsia-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <GitBranch className="w-7 h-7 text-fuchsia-400" />
          Counterfactual Simulator
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Explore alternative decision paths and their predicted outcomes
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger className="bg-black/60 border-fuchsia-500/30 text-white">
              <SelectValue placeholder="Select scenario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market_decision">Market Entry Decision</SelectItem>
              <SelectItem value="resource_allocation">Resource Allocation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-fuchsia-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#d946ef" />

            {simulation && (
              <>
                {/* Decision point */}
                <Text position={[0, 2.5, 0]} fontSize={0.15} color="#d946ef" anchorX="center">
                  {simulation.decision_point}
                </Text>

                {/* Actual outcome */}
                <OutcomeNode
                  position={actualPos}
                  outcome={simulation.actual_outcome.label}
                  probability={simulation.actual_outcome.probability}
                  isCounterfactual={false}
                />
                <DecisionPath from={[0, 2, 0]} to={actualPos} taken={true} />

                {/* Counterfactual outcomes */}
                {simulation.counterfactuals.map((cf, idx) => (
                  <React.Fragment key={idx}>
                    <OutcomeNode
                      position={counterfactualPositions[idx]}
                      outcome={cf.label}
                      probability={cf.probability}
                      isCounterfactual={true}
                    />
                    <DecisionPath from={[0, 2, 0]} to={counterfactualPositions[idx]} taken={false} />
                  </React.Fragment>
                ))}
              </>
            )}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        {simulation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 space-y-2"
          >
            <div className="bg-green-950/60 rounded-lg p-3 border border-green-500/30">
              <div className="flex justify-between items-center mb-1">
                <span className="text-green-400 text-sm font-bold">Actual Decision</span>
                <Badge className="bg-green-600">{simulation.actual_outcome.label}</Badge>
              </div>
              <div className="text-white text-xs">{simulation.actual_outcome.result}</div>
            </div>

            <div className="text-gray-400 text-xs font-bold mb-1">What if scenarios:</div>
            {simulation.counterfactuals.map((cf, idx) => (
              <div key={idx} className="bg-pink-950/40 rounded-lg p-3 border border-pink-500/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-pink-400 text-sm">{cf.label}</span>
                  <Badge className="bg-pink-600">{(cf.probability * 100).toFixed(0)}%</Badge>
                </div>
                <div className="text-gray-300 text-xs">{cf.result}</div>
              </div>
            ))}
          </motion.div>
        )}

        <Button
          onClick={runSimulation}
          disabled={isSimulating}
          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {isSimulating ? 'Simulating...' : 'Run Counterfactual Analysis'}
        </Button>
      </CardContent>
    </Card>
  );
}
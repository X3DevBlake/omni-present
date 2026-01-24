import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Brain, Zap, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { NeuralTrajectory, StateInertiaIndicator, TelepathyBeam } from './NeuralDynamicsVisualizer3D';

const ManifoldPoint = ({ position, color, label, isAligned }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
      if (isAligned) {
        meshRef.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      }
    }
  });
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.15, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isAligned ? 0.9 : 0.3}
        />
      </Sphere>
      {label && (
        <Text position={[0, 0.3, 0]} fontSize={0.15} color="white" anchorX="center">
          {label}
        </Text>
      )}
    </group>
  );
};

const AlignmentVector = ({ from, to, strength }) => {
  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to)
  ];
  
  return (
    <Line
      points={points}
      color={strength > 0.7 ? '#10b981' : strength > 0.4 ? '#f59e0b' : '#ef4444'}
      lineWidth={2 + strength * 3}
      opacity={0.6}
      transparent
    />
  );
};

const InfoNCEFlow = ({ position, similarity }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  
  return (
    <group ref={meshRef} position={position}>
      <Sphere args={[0.08, 16, 16]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={similarity}
        />
      </Sphere>
    </group>
  );
};

export default function NeuralManifoldAlignmentVisualizer3D() {
  const [temperature, setTemperature] = useState(0.07);
  const [isDecoding, setIsDecoding] = useState(false);
  const [alignmentResult, setAlignmentResult] = useState(null);
  const [neuralPoints, setNeuralPoints] = useState([]);
  const [semanticPoints, setSemanticPoints] = useState([]);
  const [neuralHistory, setNeuralHistory] = useState([]);
  const [phiCalculation, setPhiCalculation] = useState(null);
  const [syntheticTelepathy, setSyntheticTelepathy] = useState(null);
  const [neuralInertia, setNeuralInertia] = useState(150);

  const initializeManifolds = () => {
    // Generate neural manifold points
    const neural = Array(8).fill(0).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return {
        id: `neural_${i}`,
        position: [
          Math.cos(angle) * 2,
          Math.sin(angle) * 2,
          (Math.random() - 0.5) * 0.5
        ],
        label: `N${i}`
      };
    });
    
    // Generate semantic manifold points (initially misaligned)
    const semantic = Array(8).fill(0).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
      return {
        id: `semantic_${i}`,
        position: [
          Math.cos(angle) * 2 + 0.5,
          Math.sin(angle) * 2 + 0.3,
          (Math.random() - 0.5) * 0.5
        ],
        label: `S${i}`
      };
    });
    
    setNeuralPoints(neural);
    setSemanticPoints(semantic);
  };

  const runInfoNCEAlignment = async () => {
    setIsDecoding(true);
    
    try {
      // Simulate state-dependent neural dynamics
      const currentActivity = Array(512).fill(0).map(() => Math.random());
      const temporalHistory = neuralHistory.slice(-5);
      const stateDependent_a = [...currentActivity, ...temporalHistory.flat()];
      
      const response = await base44.functions.invoke('neuralIntentDecoder', {
        neural_stream_id: 'simulated_stream',
        signal_window: currentActivity,
        semantic_targets: ['move_forward', 'rotate_left', 'display_data', 'rest_state']
      });

      setAlignmentResult(response.data);
      setNeuralHistory([...neuralHistory, currentActivity].slice(-10));
      
      // Calculate Phi (Φ) - Integrated Information
      const unconstrained_repertoire = Array(8).fill(0).map(() => Math.random());
      const cause_effect_repertoire = Array(8).fill(0).map(() => Math.random());
      
      // Earth Mover's Distance (simplified)
      const emd = unconstrained_repertoire.reduce((sum, val, idx) => 
        sum + Math.abs(val - cause_effect_repertoire[idx]), 0
      ) / 8;
      
      const phi_value = Math.max(0, 1 - emd);
      
      setPhiCalculation({
        phi: phi_value,
        unconstrained: unconstrained_repertoire,
        cause_effect: cause_effect_repertoire,
        emd,
        is_irreducible: phi_value > 0.5
      });
      
      // Simulate synthetic telepathy (bidirectional)
      if (response.data.is_communicative_intent) {
        const telepathy = {
          neural_to_holographic: {
            intent: response.data.decoded_intent,
            confidence: response.data.confidence,
            latency_ms: Math.random() * 50 + 10
          },
          holographic_to_neural: {
            feedback_signal: 'projection_stable',
            sensory_integration: 0.85,
            causal_coupling: phi_value > 0.5
          }
        };
        setSyntheticTelepathy(telepathy);
      }
      
      // Animate alignment - move semantic points closer to neural
      const aligned_semantic = semanticPoints.map((point, i) => ({
        ...point,
        position: [
          neuralPoints[i].position[0] * 0.7 + point.position[0] * 0.3,
          neuralPoints[i].position[1] * 0.7 + point.position[1] * 0.3,
          neuralPoints[i].position[2] * 0.7 + point.position[2] * 0.3
        ]
      }));
      
      setSemanticPoints(aligned_semantic);
    } catch (error) {
      console.error('InfoNCE alignment failed:', error);
    } finally {
      setIsDecoding(false);
    }
  };

  React.useEffect(() => {
    initializeManifolds();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-blue-950/90 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Brain className="w-7 h-7 text-purple-400" />
          Neural Manifold Alignment via InfoNCE
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          High-dimensional semantic decoding through contrastive learning
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-purple-500/20">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#8b5cf6" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

            {/* Neural manifold points (blue) */}
            {neuralPoints.map((point, idx) => (
              <ManifoldPoint
                key={point.id}
                position={point.position}
                color="#3b82f6"
                label={point.label}
                isAligned={false}
              />
            ))}

            {/* Semantic manifold points (purple) */}
            {semanticPoints.map((point, idx) => (
              <ManifoldPoint
                key={point.id}
                position={point.position}
                color="#8b5cf6"
                label={point.label}
                isAligned={alignmentResult?.alignment_quality > 0.7}
              />
            ))}

            {/* Alignment vectors */}
            {neuralPoints.map((nPoint, idx) => {
              const sPoint = semanticPoints[idx];
              if (!sPoint) return null;
              
              const distance = Math.sqrt(
                Math.pow(nPoint.position[0] - sPoint.position[0], 2) +
                Math.pow(nPoint.position[1] - sPoint.position[1], 2) +
                Math.pow(nPoint.position[2] - sPoint.position[2], 2)
              );
              
              const strength = Math.max(0, 1 - distance / 4);
              
              return (
                <AlignmentVector
                  key={`align_${idx}`}
                  from={nPoint.position}
                  to={sPoint.position}
                  strength={strength}
                />
              );
            })}

            {/* InfoNCE flow particles */}
            {isDecoding && Array(12).fill(0).map((_, i) => (
              <InfoNCEFlow
                key={`flow_${i}`}
                position={[
                  (Math.random() - 0.5) * 4,
                  (Math.random() - 0.5) * 4,
                  (Math.random() - 0.5) * 2
                ]}
                similarity={0.5 + Math.random() * 0.5}
              />
            ))}

            {/* Neural trajectory visualization */}
            {neuralHistory.length > 1 && (
              <NeuralTrajectory history={neuralHistory} color="#3b82f6" />
            )}

            {/* State inertia indicator */}
            <StateInertiaIndicator
              position={[-3, -3, 0]}
              inertia={neuralInertia}
              isActive={isDecoding}
            />

            {/* Synthetic telepathy beams */}
            {syntheticTelepathy && (
              <>
                <TelepathyBeam
                  from={[0, 0, 0]}
                  to={[3, 0, 0]}
                  active={true}
                  bidirectional={syntheticTelepathy.holographic_to_neural.causal_coupling}
                />
                <Text position={[3, 0.5, 0]} fontSize={0.12} color="#ec4899" anchorX="center">
                  Holographic
                </Text>
              </>
            )}

            {/* Central workspace indicator */}
            <group position={[0, 0, 0]}>
              <Sphere args={[0.3, 32, 32]}>
                <meshStandardMaterial
                  color="#10b981"
                  emissive="#10b981"
                  emissiveIntensity={alignmentResult ? 1.0 : 0.3}
                  transparent
                  opacity={0.3}
                />
              </Sphere>
              <Text position={[0, -0.5, 0]} fontSize={0.12} color="#10b981" anchorX="center">
                Neural
              </Text>
            </group>

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-white text-sm mb-2 block">Temperature (τ): {temperature.toFixed(3)}</label>
            <Slider
              value={[temperature]}
              onValueChange={(val) => setTemperature(val[0])}
              min={0.01}
              max={0.5}
              step={0.01}
              className="mb-2"
            />
            <p className="text-xs text-gray-400">Controls sharpness of probability distribution</p>
          </div>
          
          <div>
            <label className="text-white text-sm mb-2 block">Neural Inertia: {neuralInertia}ms</label>
            <Slider
              value={[neuralInertia]}
              onValueChange={(val) => setNeuralInertia(val[0])}
              min={50}
              max={300}
              step={10}
              className="mb-2"
            />
            <p className="text-xs text-gray-400">Temporal history window (hysteresis)</p>
          </div>
          
          {alignmentResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/60 rounded-lg p-4 border border-purple-500/30"
            >
              <div className="text-purple-300 text-sm font-bold mb-2">Decoded Intent</div>
              <div className="text-white text-lg font-mono mb-2">{alignmentResult.decoded_intent}</div>
              <div className="space-y-1 text-xs">
                <div className="text-gray-300">Confidence: {(alignmentResult.confidence * 100).toFixed(1)}%</div>
                <div className="text-gray-300">Φ (Phi): {alignmentResult.phi_value?.toFixed(3)}</div>
                <div className="text-gray-300">Loss: {alignmentResult.loss?.toFixed(4)}</div>
                <div className="text-gray-300">Neural Inertia: {neuralInertia}ms window</div>
                <Badge className={alignmentResult.is_communicative_intent ? 'bg-green-600' : 'bg-red-600'}>
                  {alignmentResult.is_communicative_intent ? 'Genuine Intent' : 'Intrusive Thought'}
                </Badge>
              </div>
            </motion.div>
          )}
          
          {phiCalculation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/60 rounded-lg p-4 border border-indigo-500/30"
            >
              <div className="text-indigo-400 text-sm font-bold mb-2">Φ (Phi) Computation - IIT 4.0</div>
              <div className="space-y-1 text-xs">
                <div className="text-gray-300">Integrated Information: {phiCalculation.phi.toFixed(4)}</div>
                <div className="text-gray-300">EMD: {phiCalculation.emd.toFixed(4)}</div>
                <Badge className={phiCalculation.is_irreducible ? 'bg-green-600' : 'bg-gray-600'}>
                  {phiCalculation.is_irreducible ? 'Irreducible (Φ > 0.5)' : 'Reducible'}
                </Badge>
              </div>
            </motion.div>
          )}
          
          {syntheticTelepathy && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/60 rounded-lg p-4 border border-pink-500/30"
            >
              <div className="text-pink-400 text-sm font-bold mb-2">⚡ Synthetic Telepathy Active</div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-gray-400">Neural → Holographic:</div>
                  <div className="text-white ml-2">
                    Intent: {syntheticTelepathy.neural_to_holographic.intent}
                  </div>
                  <div className="text-gray-400 ml-2">
                    Latency: {syntheticTelepathy.neural_to_holographic.latency_ms.toFixed(1)}ms
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Holographic → Neural:</div>
                  <div className="text-white ml-2">
                    Feedback: {syntheticTelepathy.holographic_to_neural.feedback_signal}
                  </div>
                  <Badge className={syntheticTelepathy.holographic_to_neural.causal_coupling ? 'bg-green-600' : 'bg-gray-600'}>
                    {syntheticTelepathy.holographic_to_neural.causal_coupling ? 'Causal Coupling Active' : 'Feed-forward Only'}
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={runInfoNCEAlignment}
            disabled={isDecoding}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isDecoding ? 'Aligning Manifolds...' : 'Run InfoNCE Alignment'}
          </Button>
          <Button
            onClick={initializeManifolds}
            variant="outline"
            className="border-purple-500/50 text-purple-300"
          >
            Reset
          </Button>
        </div>

        {alignmentResult?.all_similarities && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-black/40 rounded-lg p-4 border border-purple-500/20"
          >
            <h4 className="text-white text-sm font-bold mb-2">Semantic Similarity Landscape</h4>
            <div className="space-y-2">
              {alignmentResult.all_similarities.map((sim, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="text-gray-400 text-xs w-32">{sim.target}</div>
                  <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sim.similarity * 100}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-500"
                    />
                  </div>
                  <div className="text-white text-xs font-mono w-12 text-right">
                    {(sim.similarity * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
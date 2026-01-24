import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as THREE from 'three';
import { Brain, Play, Download, Zap, TrendingUp, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';

const Neuron3D = ({ position, activation, layer, onClick, isSelected }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = isSelected ? 1.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2 : 1;
      meshRef.current.scale.setScalar(0.3 + activation * 0.4 * pulse);
      meshRef.current.rotation.y += 0.02;
    }
  });

  const layerColors = {
    input: '#ef4444',
    hidden: '#3b82f6',
    output: '#10b981'
  };

  return (
    <Sphere ref={meshRef} position={position} args={[0.3, 32, 32]} onClick={onClick}>
      <meshStandardMaterial
        color={layerColors[layer] || '#6b7280'}
        emissive={layerColors[layer] || '#000000'}
        emissiveIntensity={activation * 0.9}
        transparent
        opacity={0.9}
      />
    </Sphere>
  );
};

const Synapse3D = ({ start, end, weight, isActive }) => {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current && isActive) {
      const flow = (state.clock.elapsedTime % 1);
      lineRef.current.material.opacity = 0.3 + flow * 0.4;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...start), new THREE.Vector3(...end)]}
      color={weight > 0 ? '#10b981' : '#ef4444'}
      lineWidth={Math.abs(weight) * 3}
      transparent
      opacity={0.5}
    />
  );
};

const GradientFlow = ({ position, magnitude }) => {
  const coneRef = useRef();

  useFrame((state) => {
    if (coneRef.current) {
      coneRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.5;
    }
  });

  return (
    <group ref={coneRef} position={position}>
      <mesh rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.1, magnitude * 2, 16]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
};

export default function NeuralArchitectureStudio3D() {
  const [architecture, setArchitecture] = useState({
    inputLayer: 4,
    hiddenLayers: [8, 6],
    outputLayer: 3
  });

  const [activations, setActivations] = useState({});
  const [weights, setWeights] = useState({});
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLoss, setTrainingLoss] = useState(0.45);
  const [epoch, setEpoch] = useState(0);
  const [learningRate, setLearningRate] = useState(0.001);
  const [showGradients, setShowGradients] = useState(false);
  const [selectedNeuron, setSelectedNeuron] = useState(null);

  const trainNetworkMutation = useMutation({
    mutationFn: async (config) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `Simulate training step for neural network: ${JSON.stringify(config)}. Return updated loss and epoch.`,
        response_json_schema: {
          type: "object",
          properties: {
            loss: { type: "number" },
            epoch: { type: "number" },
            gradient_magnitudes: { type: "array", items: { type: "number" } }
          }
        }
      });
    },
    onSuccess: (data) => {
      setTrainingLoss(data.loss);
      setEpoch(data.epoch);
    }
  });

  const handleTrain = () => {
    setIsTraining(true);
    trainNetworkMutation.mutate({ architecture, learningRate });
    setTimeout(() => setIsTraining(false), 3000);
  };

  // Generate neuron positions
  const neurons = [];
  const synapses = [];

  // Input layer
  const layers = [
    { type: 'input', count: architecture.inputLayer },
    ...architecture.hiddenLayers.map((count) => ({ type: 'hidden', count })),
    { type: 'output', count: architecture.outputLayer }
  ];

  layers.forEach((layer, layerIdx) => {
    const x = layerIdx * 5 - (layers.length - 1) * 2.5;
    for (let i = 0; i < layer.count; i++) {
      const y = i * 1.2 - (layer.count - 1) * 0.6;
      const neuronId = `${layerIdx}-${i}`;
      neurons.push({
        id: neuronId,
        position: [x, y, 0],
        activation: activations[neuronId] || Math.random(),
        layer: layer.type
      });

      // Create synapses to next layer
      if (layerIdx < layers.length - 1) {
        const nextLayer = layers[layerIdx + 1];
        const nextX = (layerIdx + 1) * 5 - (layers.length - 1) * 2.5;
        for (let j = 0; j < nextLayer.count; j++) {
          const nextY = j * 1.2 - (nextLayer.count - 1) * 0.6;
          const synapseId = `${neuronId}-${layerIdx + 1}-${j}`;
          synapses.push({
            id: synapseId,
            start: [x, y, 0],
            end: [nextX, nextY, 0],
            weight: weights[synapseId] || (Math.random() - 0.5) * 2
          });
        }
      }
    }
  });

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-400" />
            Neural Architecture Studio
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={isTraining ? 'bg-green-500' : 'bg-gray-600'}>
              {isTraining ? <Activity className="w-3 h-3 mr-1 animate-pulse" /> : null}
              Epoch {epoch}
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 text-purple-300">
              Loss: {trainingLoss.toFixed(4)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] bg-black rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [0, 0, 20], fov: 70 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[15, 15, 15]} intensity={1} />
            <pointLight position={[-15, -15, -15]} intensity={0.5} color="#8b5cf6" />

            {/* Synapses (render first for depth) */}
            {synapses.map((synapse) => (
              <Synapse3D
                key={synapse.id}
                start={synapse.start}
                end={synapse.end}
                weight={synapse.weight}
                isActive={isTraining}
              />
            ))}

            {/* Neurons */}
            {neurons.map((neuron) => (
              <Neuron3D
                key={neuron.id}
                position={neuron.position}
                activation={neuron.activation}
                layer={neuron.layer}
                onClick={() => setSelectedNeuron(neuron)}
                isSelected={selectedNeuron?.id === neuron.id}
              />
            ))}

            {/* Gradient flows during training */}
            {showGradients && isTraining && neurons.filter(n => n.layer === 'hidden').map((neuron, idx) => (
              <GradientFlow
                key={`grad-${idx}`}
                position={neuron.position}
                magnitude={Math.random() * 0.5}
              />
            ))}

            {/* Layer labels */}
            <Text position={[-layers.length * 2.5, 4, 0]} fontSize={0.4} color="#ef4444">
              Input
            </Text>
            <Text position={[0, 4, 0]} fontSize={0.4} color="#3b82f6">
              Hidden
            </Text>
            <Text position={[layers.length * 2.5, 4, 0]} fontSize={0.4} color="#10b981">
              Output
            </Text>

            <OrbitControls enableZoom enablePan />
          </Canvas>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-white text-sm mb-2 block">Learning Rate</label>
            <Slider
              value={[learningRate * 1000]}
              onValueChange={(v) => setLearningRate(v[0] / 1000)}
              min={0.1}
              max={10}
              step={0.1}
            />
            <div className="text-gray-400 text-xs mt-1">{learningRate.toFixed(4)}</div>
          </div>
          <div>
            <label className="text-white text-sm mb-2 block">Dropout Rate</label>
            <Slider
              defaultValue={[20]}
              min={0}
              max={50}
              step={5}
            />
            <div className="text-gray-400 text-xs mt-1">0.20</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-center">
            <div className="text-xs text-gray-400">Total Params</div>
            <div className="text-white font-bold">{synapses.length}</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 text-center">
            <div className="text-xs text-gray-400">Neurons</div>
            <div className="text-white font-bold">{neurons.length}</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3 text-center">
            <div className="text-xs text-gray-400">Accuracy</div>
            <div className="text-white font-bold">{(100 - trainingLoss * 100).toFixed(1)}%</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleTrain}
            disabled={isTraining}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isTraining ? 'Training...' : 'Train Network'}
          </Button>
          <Button
            onClick={() => setShowGradients(!showGradients)}
            variant="outline"
            className="border-white/20 text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {showGradients ? 'Hide' : 'Show'} Gradients
          </Button>
          <Button
            variant="outline"
            className="border-white/20 text-white"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
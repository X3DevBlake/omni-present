import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Brain, Plus, Trash2, Zap } from 'lucide-react';
import * as THREE from 'three';

const Neuron = ({ position, activation, layer }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + activation * 0.3);
    }
  });

  const layerColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <Sphere ref={meshRef} position={position} args={[0.3, 32, 32]}>
      <meshStandardMaterial
        color={layerColors[layer % layerColors.length]}
        emissive={layerColors[layer % layerColors.length]}
        emissiveIntensity={activation}
      />
    </Sphere>
  );
};

const Connection = ({ start, end, weight }) => {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  
  return (
    <Line
      points={points}
      color={weight > 0.5 ? '#10b981' : '#6b7280'}
      lineWidth={weight * 2}
      transparent
      opacity={0.6}
    />
  );
};

export default function NeuralNetworkDesigner3D() {
  const [layers, setLayers] = useState([
    { neurons: 4, activations: [0.8, 0.6, 0.9, 0.7] },
    { neurons: 6, activations: [0.5, 0.7, 0.8, 0.6, 0.9, 0.5] },
    { neurons: 4, activations: [0.7, 0.8, 0.6, 0.9] },
    { neurons: 2, activations: [0.9, 0.8] }
  ]);

  const [isTraining, setIsTraining] = useState(false);

  const addLayer = () => {
    setLayers([...layers, { neurons: 4, activations: [0.5, 0.5, 0.5, 0.5] }]);
  };

  const removeLayer = (index) => {
    if (layers.length > 2) {
      setLayers(layers.filter((_, i) => i !== index));
    }
  };

  const positions = [];
  const connections = [];

  layers.forEach((layer, layerIdx) => {
    const layerPositions = [];
    const x = layerIdx * 4 - (layers.length - 1) * 2;
    
    for (let i = 0; i < layer.neurons; i++) {
      const y = i * 1.5 - (layer.neurons - 1) * 0.75;
      layerPositions.push([x, y, 0]);
      positions.push({ pos: [x, y, 0], activation: layer.activations[i], layer: layerIdx });
    }

    // Create connections to next layer
    if (layerIdx < layers.length - 1) {
      const nextX = (layerIdx + 1) * 4 - (layers.length - 1) * 2;
      for (let i = 0; i < layer.neurons; i++) {
        for (let j = 0; j < layers[layerIdx + 1].neurons; j++) {
          const nextY = j * 1.5 - (layers[layerIdx + 1].neurons - 1) * 0.75;
          connections.push({
            start: layerPositions[i],
            end: [nextX, nextY, 0],
            weight: Math.random()
          });
        }
      }
    }
  });

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-400" />
          Neural Network Designer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-black/40 rounded-lg h-96 mb-4">
          <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {connections.map((conn, idx) => (
              <Connection key={idx} start={conn.start} end={conn.end} weight={conn.weight} />
            ))}

            {positions.map((neuron, idx) => (
              <Neuron
                key={idx}
                position={neuron.pos}
                activation={neuron.activation}
                layer={neuron.layer}
              />
            ))}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {layers.map((layer, idx) => (
              <Badge key={idx} variant="outline" className="text-white border-white/20">
                Layer {idx + 1}: {layer.neurons}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={addLayer}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Layer
          </Button>
          <Button
            size="sm"
            onClick={() => setIsTraining(!isTraining)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isTraining ? 'Stop Training' : 'Train Network'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
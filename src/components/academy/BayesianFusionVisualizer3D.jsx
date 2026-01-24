import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Activity } from 'lucide-react';

const SensorData = ({ position, sensor, confidence }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 0.8 + confidence * 0.4;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={sensor.color}
          emissive={sensor.color}
          emissiveIntensity={confidence}
          transparent
          opacity={0.7 + confidence * 0.3}
        />
      </Sphere>
      <Text position={[0, -0.6, 0]} fontSize={0.15} color="white" anchorX="center">
        {sensor.name}
      </Text>
    </group>
  );
};

export default function BayesianFusionVisualizer3D() {
  const [sensors] = useState([
    { name: 'Camera', color: '#3b82f6', pos: [-3, 2, 0], confidence: 0.85 },
    { name: 'IMU', color: '#10b981', pos: [3, 2, 0], confidence: 0.75 },
    { name: 'Lidar', color: '#f59e0b', pos: [0, 3, 0], confidence: 0.9 }
  ]);

  const [fusedConfidence] = useState(0.95);

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Bayesian Sensor Fusion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Sensor inputs */}
            {sensors.map((sensor, idx) => (
              <React.Fragment key={idx}>
                <SensorData
                  position={sensor.pos}
                  sensor={sensor}
                  confidence={sensor.confidence}
                />
                {/* Connection to fusion center */}
                <Line
                  points={[sensor.pos, [0, 0, 0]]}
                  color={sensor.color}
                  lineWidth={2}
                  transparent
                  opacity={sensor.confidence}
                />
              </React.Fragment>
            ))}

            {/* Fused posterior */}
            <Sphere args={[0.8, 64, 64]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#8b5cf6"
                emissiveIntensity={fusedConfidence}
                transparent
                opacity={0.4}
              />
            </Sphere>
            <Text position={[0, -1.2, 0]} fontSize={0.25} color="white" anchorX="center">
              Posterior
            </Text>
            <Text position={[0, -1.6, 0]} fontSize={0.15} color="#10b981" anchorX="center">
              {(fusedConfidence * 100).toFixed(0)}% Confidence
            </Text>

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {sensors.map((sensor, idx) => (
              <div key={idx} className="text-center">
                <div className="text-xs text-gray-400">{sensor.name}</div>
                <Badge className="bg-blue-500 text-xs">
                  {(sensor.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
            P(Θ|D) = P(D|Θ)P(Θ) / P(D)
            <br />
            <span className="text-purple-400">Recursive belief update from multiple sensors</span>
          </div>

          <p className="text-sm text-gray-300">
            Extended Kalman Filter (EKF) fuses noisy sensor data using Bayesian updates,
            linearizing non-linear dynamics via Jacobian matrices for real-time edge processing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
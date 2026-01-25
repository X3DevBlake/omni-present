import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';
import * as THREE from 'three';

const DataStreamLine = ({ points, color, intensity }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4 + intensity) * 0.3;
    }
  });
  
  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={2}
      transparent
    />
  );
};

const MetricBar = ({ position, height, color, label, value }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = new THREE.Vector3(0.3, height, 0.3);
      meshRef.current.scale.lerp(targetScale, 0.1);
    }
  });
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, -0.8, 0]} fontSize={0.15} color="white" anchorX="center">
        {label}
      </Text>
      <Html distanceFactor={10} position={[0, height + 0.3, 0]}>
        <div className="bg-black/90 border border-cyan-400 rounded px-2 py-1 text-white text-xs font-bold">
          {value}
        </div>
      </Html>
    </group>
  );
};

export default function RealTimeNetworkAnalytics3D() {
  const [metrics, setMetrics] = useState({
    latency: 0,
    bandwidth: 0,
    throughput: 0,
    errors: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        latency: Math.floor(Math.random() * 50 + 20),
        bandwidth: Math.floor(Math.random() * 100 + 500),
        throughput: Math.floor(Math.random() * 80 + 60),
        errors: Math.floor(Math.random() * 5)
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-cyan-950/90 via-blue-950/90 to-indigo-950/90 backdrop-blur-xl border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-cyan-400" />
          Real-Time Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-cyan-500/20">
          <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#06b6d4" />
            
            {/* Metric bars */}
            <MetricBar 
              position={[-3, 0, 0]} 
              height={metrics.latency / 25} 
              color="#3b82f6" 
              label="Latency"
              value={`${metrics.latency}ms`}
            />
            <MetricBar 
              position={[-1, 0, 0]} 
              height={metrics.bandwidth / 150} 
              color="#10b981" 
              label="Bandwidth"
              value={`${metrics.bandwidth} Gbps`}
            />
            <MetricBar 
              position={[1, 0, 0]} 
              height={metrics.throughput / 50} 
              color="#8b5cf6" 
              label="Throughput"
              value={`${metrics.throughput}%`}
            />
            <MetricBar 
              position={[3, 0, 0]} 
              height={metrics.errors / 2} 
              color="#ef4444" 
              label="Errors"
              value={`${metrics.errors}`}
            />

            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Latency', value: `${metrics.latency}ms`, icon: Activity, color: 'blue' },
            { label: 'Bandwidth', value: `${metrics.bandwidth} Gbps`, icon: Zap, color: 'green' },
            { label: 'Throughput', value: `${metrics.throughput}%`, icon: TrendingUp, color: 'purple' },
            { label: 'Errors', value: metrics.errors, icon: Activity, color: 'red' }
          ].map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-${metric.color}-950/30 border border-${metric.color}-500/30 rounded-lg p-3`}
              >
                <Icon className={`w-4 h-4 text-${metric.color}-400 mb-1`} />
                <div className="text-white font-bold text-sm">{metric.value}</div>
                <div className="text-gray-400 text-xs">{metric.label}</div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
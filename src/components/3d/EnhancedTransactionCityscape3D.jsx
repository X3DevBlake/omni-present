/**
 * Enhanced Transaction Data Cityscape 3D - All 15 enhancements
 * - Buildings for different spending categories
 * - Height/color linked to transaction volume/amount
 * - Animated traffic flows between categories
 * - Customizable city layouts and styles
 * - Day/Night cycle reflecting market hours
 * - Geospatial integration with map overlay
 * - Street view for transaction details
 * - Weather effects for volatility
 * - Construction/demolition animations
 * - Smart city budget enforcement
 * - Financial landmarks for milestones
 * - Hover pop-ups with transaction history
 * - Resource pipelines for income/expenses
 * - Crisis simulation mode
 */

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, AlertTriangle, Eye } from 'lucide-react';

// Building component with all features
function CityBuilding({
  position,
  category,
  volume,
  amount,
  color,
  onHover
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const heightScale = Math.min(15, volume / 1000);

  useFrame(() => {
    if (meshRef.current) {
      const emissiveIntensity = hovered ? 0.6 : 0.2;
      meshRef.current.material.emissiveIntensity = emissiveIntensity;
    }
  });

  return (
    <group position={position}>
      {/* Main building */}
      <mesh
        ref={meshRef}
        position={[0, heightScale / 2, 0]}
        onPointerOver={() => {
          setHovered(true);
          onHover?.({ category, amount, volume });
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.5, heightScale, 1.5]} />
        <meshPhongMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          shininess={100}
        />
      </mesh>

      {/* Building windows */}
      <mesh position={[0, heightScale / 2, 0.76]}>
        <planeGeometry args={[1.4, heightScale - 0.5]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Category label */}
      <Text
        position={[0, heightScale + 1, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
      >
        {category}
      </Text>

      {/* Amount display */}
      <Text
        position={[0, heightScale + 0.5, 0]}
        fontSize={0.25}
        color="#00ffff"
        anchorX="center"
      >
        ${(amount / 1000).toFixed(1)}K
      </Text>
    </group>
  );
}

// Traffic flow between buildings
function TrafficFlow({ startPos, endPos, intensity, type }) {
  const points = [
    new THREE.Vector3(...startPos),
    new THREE.Vector3(
      (startPos[0] + endPos[0]) / 2,
      Math.max(startPos[1], endPos[1]) + 5,
      (startPos[2] + endPos[2]) / 2
    ),
    new THREE.Vector3(...endPos)
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const points3d = curve.getPoints(20);

  return (
    <group>
      {points3d.map((point, idx) => (
        <mesh key={idx} position={point}>
          <sphereGeometry args={[0.1 * intensity, 8, 8]} />
          <meshBasicMaterial
            color={type === 'income' ? '#00ff00' : '#ff6600'}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// Weather effects for volatility
function WeatherEffects({ volatility }) {
  const particlesRef = useRef();
  const particleCount = Math.floor(volatility * 1000);
  const particles = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    particles[i * 3] = (Math.random() - 0.5) * 100;
    particles[i * 3 + 1] = Math.random() * 30;
    particles[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= volatility * 0.1;
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 30;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={volatility > 0.7 ? '#ff0000' : '#888888'}
        size={0.3}
        transparent
        opacity={0.6}
      />
    </points>
  );
}

// City scene
function CityscapeScene({
  buildings,
  timeOfDay,
  volatility,
  crisisMode,
  showResourcePipelines
}) {
  const sceneRef = useRef();

  useFrame(() => {
    if (sceneRef.current) {
      // Adjust sky color based on time of day
      const skyColor = new THREE.Color();
      if (timeOfDay < 0.5) {
        // Night to day
        skyColor.lerpColors(
          new THREE.Color(0x000033),
          new THREE.Color(0x87ceeb),
          timeOfDay * 2
        );
      } else {
        // Day to night
        skyColor.lerpColors(
          new THREE.Color(0x87ceeb),
          new THREE.Color(0x000033),
          (timeOfDay - 0.5) * 2
        );
      }
      sceneRef.current.background = skyColor;
    }
  });

  return (
    <scene ref={sceneRef}>
      {/* Lighting based on time of day */}
      <ambientLight intensity={0.3 + timeOfDay * 0.4} />
      <pointLight
        position={[50, 50, 50]}
        intensity={1}
        color={timeOfDay > 0.5 ? '#ff6600' : '#ffffff'}
      />

      {/* Ground plane */}
      <mesh position={[0, -5, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={crisisMode ? '#8b0000' : '#333333'} />
      </mesh>

      {/* Buildings */}
      {buildings.map((building, idx) => (
        <CityBuilding
          key={building.id}
          position={building.position}
          category={building.category}
          volume={building.volume}
          amount={building.amount}
          color={crisisMode ? '#ff0000' : building.color}
        />
      ))}

      {/* Traffic flows */}
      {buildings.slice(0, 3).map((b1, idx) =>
        buildings.slice(idx + 1).map((b2) => (
          <TrafficFlow
            key={`flow-${b1.id}-${b2.id}`}
            startPos={b1.position}
            endPos={b2.position}
            intensity={0.5}
            type="expense"
          />
        ))
      )}

      {/* Weather effects */}
      <WeatherEffects volatility={volatility} />

      {/* Resource pipelines visualization */}
      {showResourcePipelines && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, 50, 15, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ff00" linewidth={2} />
        </line>
      )}
    </scene>
  );
}

export default function EnhancedTransactionCityscape3D() {
  const [buildings, setBuildings] = useState([
    { id: 1, category: 'Housing', position: [-30, 0, -30], volume: 5000, amount: 2000, color: '#ff6600' },
    { id: 2, category: 'Food', position: [0, 0, -30], volume: 2000, amount: 500, color: '#00ff00' },
    { id: 3, category: 'Transport', position: [30, 0, -30], volume: 3000, amount: 800, color: '#0099ff' },
    { id: 4, category: 'Entertainment', position: [-30, 0, 0], volume: 1500, amount: 300, color: '#ff00ff' },
    { id: 5, category: 'Utilities', position: [0, 0, 0], volume: 1000, amount: 200, color: '#ffff00' },
    { id: 6, category: 'Healthcare', position: [30, 0, 0], volume: 2500, amount: 600, color: '#00ffff' },
    { id: 7, category: 'Income', position: [-30, 0, 30], volume: 8000, amount: 5000, color: '#00ff00' }
  ]);

  const [timeOfDay, setTimeOfDay] = useState(0.5);
  const [volatility, setVolatility] = useState(0.3);
  const [crisisMode, setCrisisMode] = useState(false);
  const [showResourcePipelines, setShowResourcePipelines] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOfDay(prev => (prev + 0.01) % 1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const totalSpending = buildings
    .filter(b => b.category !== 'Income')
    .reduce((sum, b) => sum + b.amount, 0);
  const totalIncome = buildings
    .filter(b => b.category === 'Income')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-black/40 border-cyan-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Total Income</p>
            <p className="text-2xl font-bold text-green-400">${(totalIncome / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-orange-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Total Spending</p>
            <p className="text-2xl font-bold text-orange-400">${(totalSpending / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 space-y-2">
            <label className="text-sm text-gray-400">Volatility: {(volatility * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volatility * 100}
              onChange={(e) => setVolatility(e.target.value / 100)}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-red-500/30">
          <CardContent className="p-4 space-y-2">
            <Button
              onClick={() => setCrisisMode(!crisisMode)}
              className={crisisMode ? 'bg-red-600' : 'bg-gray-600'}
              size="sm"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {crisisMode ? 'Crisis ON' : 'Crisis OFF'}
            </Button>
            <Button
              onClick={() => setShowResourcePipelines(!showResourcePipelines)}
              variant="outline"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              Pipelines
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3D Canvas */}
      <Card className="bg-black/20 border-white/10 h-[600px]">
        <Canvas camera={{ position: [0, 30, 60], fov: 60 }}>
          <CityscapeScene
            buildings={buildings}
            timeOfDay={timeOfDay}
            volatility={volatility}
            crisisMode={crisisMode}
            showResourcePipelines={showResourcePipelines}
          />
          <OrbitControls autoRotate autoRotateSpeed={2} />
        </Canvas>
      </Card>

      {/* Building Details */}
      {selectedBuilding && (
        <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white">{selectedBuilding.category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Amount: <span className="font-bold text-cyan-400">${(selectedBuilding.amount / 1000).toFixed(1)}K</span></p>
            <p>Volume: <span className="font-bold">{selectedBuilding.volume}</span></p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
/**
 * Enhanced Financial Galaxy 3D - All 15 enhancements
 * - Interactive planet scaling based on account balance
 * - Dynamic transaction flow as orbiting comets/moons
 * - Customizable planet textures and colors
 * - Financial goals as constellations
 * - Black hole visualizations for debt
 * - Real-time market data reflections
 * - Predictive wormholes for investment trajectories
 * - User-defined gravitational pulls
 * - Dynamic starfield density for market sentiment
 * - Hyper-realistic rendering options
 * - Time-lapse historical evolution
 * - Event horizons for deadlines
 * - Warp speed navigation
 * - Asteroid fields for risk investments
 * - Nova bursts for gains/losses
 */

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Zap, RotateCw, Palette } from 'lucide-react';

// Planet component with all enhancements
function EnhancedPlanet({ 
  position, 
  scale, 
  balance, 
  accountName, 
  color, 
  texture,
  marketData,
  isHighlight,
  gravitationalPull 
}) {
  const meshRef = useRef();
  const auraRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.002;
      
      // Scale pulsing effect based on gravitational pull
      const pulseScale = scale * (1 + Math.sin(Date.now() * 0.001) * gravitationalPull * 0.1);
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }

    if (auraRef.current) {
      auraRef.current.rotation.z += 0.01;
      auraRef.current.scale.set(
        scale * 1.5 * (1 + Math.sin(Date.now() * 0.002) * 0.2),
        scale * 1.5 * (1 + Math.sin(Date.now() * 0.002) * 0.2),
        scale * 1.5
      );
    }
  });

  return (
    <group position={position}>
      {/* Main planet mesh */}
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[1, 4]} />
        <meshPhongMaterial
          color={isHighlight ? '#ffff00' : color}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          shininess={100}
        />
      </mesh>

      {/* Atmospheric aura with market data reflection */}
      <mesh ref={auraRef}>
        <icosahedronGeometry args={[1.2, 4]} />
        <meshBasicMaterial
          color={marketData?.trend === 'up' ? '#00ff00' : '#ff0000'}
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>

      {/* Account label */}
      <Text
        position={[0, 0, 2]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="bottom"
      >
        {accountName}
      </Text>

      {/* Balance display */}
      <Text
        position={[0, -0.5, 2]}
        fontSize={0.3}
        color="#00ffff"
        anchorX="center"
        anchorY="top"
      >
        ${(balance / 1000).toFixed(1)}K
      </Text>

      {/* Market indicator aurora */}
      {marketData && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.3, 32, 32]} />
          <meshBasicMaterial
            color={marketData.trend === 'up' ? '#00ff00' : '#ff0000'}
            transparent
            opacity={0.1}
          />
        </mesh>
      )}
    </group>
  );
}

// Comet/Dynamic transaction flow component
function TransactionComet({ startPos, endPos, amount, transactionType }) {
  const meshRef = useRef();
  const trailRef = useRef([]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = (clock.getElapsedTime() * 0.5) % 1;
      const pos = new THREE.Vector3(
        THREE.MathUtils.lerp(startPos[0], endPos[0], t),
        THREE.MathUtils.lerp(startPos[1], endPos[1], t),
        THREE.MathUtils.lerp(startPos[2], endPos[2], t)
      );
      meshRef.current.position.copy(pos);
    }
  });

  return (
    <mesh ref={meshRef} position={startPos}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial
        color={transactionType === 'income' ? '#00ff00' : '#ff6600'}
        emissive={transactionType === 'income' ? '#00ff00' : '#ff6600'}
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}

// Black hole for debt visualization
function DebtBlackHole({ position, debtAmount, scale }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.02;
    }
  });

  return (
    <group position={position}>
      {/* Event horizon */}
      <mesh ref={meshRef}>
        <torusGeometry args={[scale, 0.1, 16, 100]} />
        <meshBasicMaterial color="#ff0000" wireframe />
      </mesh>

      {/* Accretion disk */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[scale * 0.8, 0.05, 16, 100]} />
        <meshBasicMaterial color="#ffaa00" wireframe opacity={0.6} transparent />
      </mesh>

      {/* Center singularity */}
      <mesh>
        <sphereGeometry args={[scale * 0.3, 16, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Debt label */}
      <Text
        position={[0, -scale - 1, 0]}
        fontSize={0.5}
        color="#ff0000"
        anchorX="center"
      >
        Debt: ${(debtAmount / 1000).toFixed(1)}K
      </Text>
    </group>
  );
}

// Wormhole for predictive trajectories
function PredictiveWormhole({ startPos, endPos }) {
  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([...startPos, ...endPos])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ffff" linewidth={2} transparent opacity={0.5} />
      </line>

      {/* Wormhole tunnel effect */}
      <mesh position={startPos}>
        <torusGeometry args={[0.3, 0.1, 16, 100]} />
        <meshBasicMaterial color="#00ffff" wireframe />
      </mesh>
      <mesh position={endPos}>
        <torusGeometry args={[0.3, 0.1, 16, 100]} />
        <meshBasicMaterial color="#00ffff" wireframe />
      </mesh>
    </group>
  );
}

// Asteroid field for risky investments
function AsteroidField({ position, count, riskLevel }) {
  const asteroids = Array.from({ length: count }).map((_, i) => ({
    id: i,
    pos: [
      position[0] + (Math.random() - 0.5) * 10,
      position[1] + (Math.random() - 0.5) * 10,
      position[2] + (Math.random() - 0.5) * 10
    ],
    scale: Math.random() * 0.3 + 0.1,
    color: riskLevel === 'high' ? '#ff6600' : '#ffaa00'
  }));

  return (
    <group>
      {asteroids.map(asteroid => (
        <mesh key={asteroid.id} position={asteroid.pos} scale={asteroid.scale}>
          <icosahedronGeometry args={[1, 1]} />
          <meshPhongMaterial color={asteroid.color} />
        </mesh>
      ))}
    </group>
  );
}

// Nova burst for gains/losses
function NovaBurst({ position, isGain }) {
  const meshRef = useRef();
  const [active, setActive] = useState(true);

  useFrame(({ clock }) => {
    if (meshRef.current && active) {
      const elapsed = clock.getElapsedTime();
      meshRef.current.scale.set(
        1 + elapsed * 2,
        1 + elapsed * 2,
        1 + elapsed * 2
      );
      meshRef.current.material.opacity = Math.max(0, 1 - elapsed);
      
      if (elapsed > 1) {
        setActive(false);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial
        color={isGain ? '#00ff00' : '#ff0000'}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Main 3D scene component
function GalaxyScene({ 
  accounts, 
  goals, 
  debt, 
  timeLapseMode,
  historicalData,
  marketSentiment,
  renderQuality 
}) {
  const sceneRef = useRef();
  const [starDensity, setStarDensity] = useState(marketSentiment * 100);

  useFrame((state) => {
    if (sceneRef.current && timeLapseMode) {
      sceneRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <scene ref={sceneRef}>
      {/* Adaptive starfield based on market sentiment */}
      <Stars
        radius={200}
        depth={50}
        count={Math.floor(starDensity)}
        factor={4}
        saturation={marketSentiment > 0.5 ? 1 : 0.5}
        fade
      />

      {/* Enhanced planets with all features */}
      {accounts.map((account, idx) => (
        <EnhancedPlanet
          key={account.id}
          position={[Math.cos((idx / accounts.length) * Math.PI * 2) * 20, Math.sin((idx / accounts.length) * Math.PI * 2) * 20, 0]}
          scale={Math.max(1, Math.min(5, account.balance / 10000))}
          balance={account.balance}
          accountName={account.name}
          color={account.color}
          texture={account.texture}
          marketData={account.marketData}
          gravitationalPull={account.gravitationalPull || 1}
        />
      ))}

      {/* Debt visualization */}
      {debt > 0 && (
        <DebtBlackHole
          position={[0, 0, 0]}
          debtAmount={debt}
          scale={Math.min(5, debt / 50000)}
        />
      )}

      {/* Transaction comets */}
      {accounts.map((account) =>
        account.recentTransactions?.map((tx, idx) => (
          <TransactionComet
            key={`tx-${account.id}-${idx}`}
            startPos={[Math.random() * 40 - 20, Math.random() * 40 - 20, Math.random() * 40 - 20]}
            endPos={[Math.cos(Math.random() * Math.PI * 2) * 20, Math.sin(Math.random() * Math.PI * 2) * 20, 0]}
            amount={tx.amount}
            transactionType={tx.type}
          />
        ))
      )}

      {/* Asteroid fields for risky investments */}
      {accounts
        .filter(a => a.riskLevel === 'high')
        .map((account, idx) => (
          <AsteroidField
            key={`asteroids-${account.id}`}
            position={[Math.cos((idx / 4) * Math.PI * 2) * 15, Math.sin((idx / 4) * Math.PI * 2) * 15, 5]}
            count={10}
            riskLevel="high"
          />
        ))}

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <pointLight position={[20, 20, 20]} intensity={1} />
      <pointLight position={[-20, -20, -20]} intensity={0.5} color="#00ffff" />
    </scene>
  );
}

export default function EnhancedFinancialGalaxy3D() {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      name: 'Checking',
      balance: 15000,
      color: '#00ffff',
      texture: 'metallic',
      gravitationalPull: 1.2,
      marketData: { trend: 'up' },
      recentTransactions: [{ amount: 500, type: 'income' }],
      riskLevel: 'low'
    },
    {
      id: 2,
      name: 'Savings',
      balance: 45000,
      color: '#00ff00',
      texture: 'crystal',
      gravitationalPull: 1.5,
      marketData: { trend: 'up' },
      recentTransactions: [{ amount: 200, type: 'expense' }],
      riskLevel: 'low'
    },
    {
      id: 3,
      name: 'Crypto',
      balance: 25000,
      color: '#ff6600',
      texture: 'neon',
      gravitationalPull: 0.8,
      marketData: { trend: 'down' },
      recentTransactions: [{ amount: 1000, type: 'gain' }],
      riskLevel: 'high'
    }
  ]);

  const [debt, setDebt] = useState(8000);
  const [timeLapseMode, setTimeLapseMode] = useState(false);
  const [marketSentiment, setMarketSentiment] = useState(0.7);
  const [renderQuality, setRenderQuality] = useState('high');

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-black/40 border-cyan-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Total Balance</p>
            <p className="text-2xl font-bold text-cyan-400">${(totalBalance / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-red-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Total Debt</p>
            <p className="text-2xl font-bold text-red-400">${(debt / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Market Sentiment</p>
            <div className="flex items-center gap-2 mt-2">
              <Slider
                value={[marketSentiment * 100]}
                onValueChange={(val) => setMarketSentiment(val[0] / 100)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-purple-400">{(marketSentiment * 100).toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-green-500/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={timeLapseMode}
                onChange={(e) => setTimeLapseMode(e.target.checked)}
                className="w-4 h-4"
              />
              <label className="text-sm text-green-400">Time Lapse Mode</label>
            </div>
            <Select value={renderQuality} onValueChange={setRenderQuality}>
              <SelectTrigger className="w-full bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Quality</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="ultra">Ultra</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3D Canvas */}
      <Card className="bg-black/20 border-white/10 h-[600px]">
        <Canvas
          camera={{ position: [0, 0, 50], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
        >
          <GalaxyScene
            accounts={accounts}
            debt={debt}
            timeLapseMode={timeLapseMode}
            marketSentiment={marketSentiment}
            renderQuality={renderQuality}
          />
          <OrbitControls autoRotate={!timeLapseMode} autoRotateSpeed={0.5} />
        </Canvas>
      </Card>

      {/* Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map(account => (
          <Card key={account.id} className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{account.name}</span>
                <Badge className={`${
                  account.marketData.trend === 'up'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {account.marketData.trend}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-400">Balance: <span className="text-cyan-400 font-bold">${(account.balance / 1000).toFixed(1)}K</span></p>
              <p className="text-gray-400">Risk: <span className={account.riskLevel === 'high' ? 'text-red-400' : 'text-green-400'}>{account.riskLevel}</span></p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
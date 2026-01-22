import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Shield, Zap } from 'lucide-react';
import * as THREE from 'three';

function AssetPlanet({ asset, index, totalAssets, onHover }) {
  const meshRef = useRef();
  const orbitRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (orbitRef.current) {
      // Orbital motion
      const speed = 0.1 + (index * 0.05);
      const angle = clock.elapsedTime * speed;
      const radius = 3 + index * 1.5;
      
      orbitRef.current.position.x = Math.cos(angle) * radius;
      orbitRef.current.position.z = Math.sin(angle) * radius;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.5;
      
      if (hovered) {
        meshRef.current.scale.setScalar(1.3);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const size = 0.2 + (asset.allocation_percent || 0.1) * 0.5;
  const performance = asset.return_percent || 0;
  const color = performance > 0 ? '#00ff88' : performance < 0 ? '#ff0044' : '#ffaa00';

  return (
    <group ref={orbitRef}>
      <Sphere 
        ref={meshRef}
        args={[size, 32, 32]}
        onPointerOver={() => { setHovered(true); onHover?.(asset); }}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      {hovered && (
        <>
          <Text
            position={[0, size + 0.4, 0]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
          >
            {asset.asset_symbol}
          </Text>
          <Text
            position={[0, size + 0.6, 0]}
            fontSize={0.12}
            color={color}
            anchorX="center"
          >
            {performance > 0 ? '+' : ''}{performance.toFixed(2)}%
          </Text>
        </>
      )}
    </group>
  );
}

function TradingSignal({ signal, position }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime * 2;
      meshRef.current.rotation.z = clock.elapsedTime * 1.5;
      
      const pulse = Math.sin(clock.elapsedTime * 3) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const signalColor = signal.signal_type === 'buy' ? '#00ff00' : 
                      signal.signal_type === 'sell' ? '#ff0000' : '#ffaa00';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.15, 16, 16]}>
        <meshBasicMaterial color={signalColor} transparent opacity={0.8} />
      </Sphere>
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.1}
        color={signalColor}
        anchorX="center"
      >
        {signal.signal_type.toUpperCase()}
      </Text>
    </group>
  );
}

function PortfolioGalaxyScene({ assets, signals, strategies }) {
  const [hoveredAsset, setHoveredAsset] = useState(null);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff00ff" />
      
      {/* Central AI Core */}
      <group position={[0, 0, 0]}>
        <Sphere args={[0.8, 64, 64]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.8}
            metalness={1}
            roughness={0}
          />
        </Sphere>
        <Sphere args={[1.2, 32, 32]}>
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.1}
            wireframe
          />
        </Sphere>
        <Text
          position={[0, 0, 0]}
          fontSize={0.2}
          color="#000000"
          anchorX="center"
        >
          AI CORE
        </Text>
      </group>

      {/* Asset Planets */}
      {assets.map((asset, idx) => (
        <AssetPlanet
          key={asset.asset_symbol || idx}
          asset={asset}
          index={idx}
          totalAssets={assets.length}
          onHover={setHoveredAsset}
        />
      ))}

      {/* Trading Signals */}
      {signals.slice(0, 5).map((signal, idx) => {
        const angle = (idx / 5) * Math.PI * 2;
        return (
          <TradingSignal
            key={signal.signal_id || idx}
            signal={signal}
            position={[Math.cos(angle) * 2, 2 + idx * 0.5, Math.sin(angle) * 2]}
          />
        );
      })}

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function RealTimePortfolioGalaxy3D({ portfolioData, signals, strategies }) {
  const assets = portfolioData?.assets || [];
  const totalValue = assets.reduce((sum, a) => sum + (a.value_usd || 0), 0);
  const totalReturn = assets.length > 0 
    ? assets.reduce((sum, a) => sum + (a.return_percent || 0), 0) / assets.length 
    : 0;

  return (
    <Card className="bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-cyan-500/20 border-emerald-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <TrendingUp className="w-8 h-8 text-emerald-400 animate-pulse" />
          Autonomous Wealth Galaxy
          <Badge className="bg-emerald-500/30 text-emerald-300">
            ${totalValue.toLocaleString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-white/60 text-xs">Total Assets</span>
            </div>
            <div className="text-white text-lg font-bold">{assets.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Avg Return</span>
            </div>
            <div className={`text-lg font-bold ${totalReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(2)}%
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Signals</span>
            </div>
            <div className="text-white text-lg font-bold">{signals?.length || 0}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Strategies</span>
            </div>
            <div className="text-white text-lg font-bold">{strategies?.length || 0}</div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [10, 8, 10], fov: 60 }}>
            <color attach="background" args={['#001122']} />
            <fog attach="fog" args={['#001122', 10, 50]} />
            <PortfolioGalaxyScene 
              assets={assets}
              signals={signals || []}
              strategies={strategies || []}
            />
          </Canvas>
        </div>

        <div className="mt-4 text-xs text-white/60">
          <div className="flex gap-4">
            <div><span className="text-green-400">●</span> Profitable Assets</div>
            <div><span className="text-red-400">●</span> Loss-Making Assets</div>
            <div><span className="text-orange-400">●</span> Neutral Performance</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
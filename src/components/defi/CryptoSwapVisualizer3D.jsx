import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function TokenNode({ position, token, color }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Sphere>
      <Text position={[0, -0.8, 0]} fontSize={0.3} color="white">
        {token}
      </Text>
    </group>
  );
}

function SwapPath({ from, to, active }) {
  const points = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(...to)
    );
    return curve.getPoints(50);
  }, [from, to]);

  return (
    <Line
      points={points}
      color={active ? '#22d3ee' : '#475569'}
      lineWidth={active ? 3 : 1}
      dashed={!active}
      dashScale={20}
      dashSize={0.5}
      gapSize={0.3}
    />
  );
}

function ParticleFlow({ from, to, active }) {
  const particleRef = useRef();
  
  useFrame((state) => {
    if (particleRef.current && active) {
      const t = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(...from),
        new THREE.Vector3(0, 2, 0),
        new THREE.Vector3(...to)
      );
      const point = curve.getPoint(t);
      particleRef.current.position.set(point.x, point.y, point.z);
    }
  });

  if (!active) return null;

  return (
    <Sphere ref={particleRef} args={[0.15, 16, 16]}>
      <meshBasicMaterial color="#fbbf24" />
    </Sphere>
  );
}

export default function CryptoSwapVisualizer3D({ fromToken, toToken, swaps }) {
  const tokenPositions = {
    ETH: [-3, 0, 0],
    BTC: [-1.5, 0, 0],
    USDT: [0, 0, 0],
    USDC: [1.5, 0, 0],
    OMNI: [3, 0, 0],
    DAI: [0, 0, 1.5]
  };

  const tokenColors = {
    ETH: '#627eea',
    BTC: '#f7931a',
    USDT: '#26a17b',
    USDC: '#2775ca',
    OMNI: '#8b5cf6',
    DAI: '#f5ac37'
  };

  const recentTokenPairs = useMemo(() => {
    return swaps.slice(0, 5).map(swap => ({
      from: tokenPositions[swap.from_token] || [0, 0, 0],
      to: tokenPositions[swap.to_token] || [0, 0, 0],
      active: swap.status === 'processing'
    }));
  }, [swaps]);

  return (
    <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Render Token Nodes */}
      {Object.entries(tokenPositions).map(([token, pos]) => (
        <TokenNode
          key={token}
          position={pos}
          token={token}
          color={tokenColors[token] || '#6366f1'}
        />
      ))}

      {/* Current Swap Path */}
      {tokenPositions[fromToken] && tokenPositions[toToken] && (
        <>
          <SwapPath
            from={tokenPositions[fromToken]}
            to={tokenPositions[toToken]}
            active={true}
          />
          <ParticleFlow
            from={tokenPositions[fromToken]}
            to={tokenPositions[toToken]}
            active={true}
          />
        </>
      )}

      {/* Recent Swap Paths */}
      {recentTokenPairs.map((pair, idx) => (
        <SwapPath key={idx} from={pair.from} to={pair.to} active={pair.active} />
      ))}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={15}
      />
    </Canvas>
  );
}
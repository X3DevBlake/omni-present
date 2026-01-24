import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Rocket, Clock } from 'lucide-react';

const Planet = ({ position, name, color, radius }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[radius, 64, 64]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </Sphere>
      <Text position={[0, radius + 0.5, 0]} fontSize={0.3} color="white" anchorX="center">
        {name}
      </Text>
    </group>
  );
};

const DTNBundle = ({ start, end, progress, status }) => {
  const bundleRef = useRef();

  useFrame(() => {
    if (bundleRef.current && status === 'transmitting') {
      const pos = new THREE.Vector3(...start).lerp(new THREE.Vector3(...end), progress);
      bundleRef.current.position.copy(pos);
    }
  });

  return (
    <>
      <Line
        points={[new THREE.Vector3(...start), new THREE.Vector3(...end)]}
        color="#fbbf24"
        lineWidth={1}
        dashed
        dashScale={10}
        transparent
        opacity={0.4}
      />
      {status === 'transmitting' && (
        <Sphere ref={bundleRef} args={[0.15, 16, 16]}>
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={1}
          />
        </Sphere>
      )}
    </>
  );
};

export default function InterplanetaryDTNVisualizer3D() {
  const [transmitting, setTransmitting] = useState(false);
  const [bundleProgress, setBundleProgress] = useState(0);
  const [destination, setDestination] = useState('moon');

  const planets = {
    earth: { pos: [-5, 0, 0], name: 'Earth', color: '#3b82f6', radius: 0.8 },
    moon: { pos: [0, 2, 0], name: 'Moon', color: '#9ca3af', radius: 0.3 },
    mars: { pos: [6, -1, 0], name: 'Mars', color: '#dc2626', radius: 0.6 }
  };

  const latencies = {
    moon: 2.5, // seconds
    mars: 180  // 3-22 minutes average
  };

  React.useEffect(() => {
    if (transmitting) {
      const interval = setInterval(() => {
        setBundleProgress(p => {
          if (p >= 1) {
            setTransmitting(false);
            return 0;
          }
          return p + 0.01;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [transmitting]);

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-amber-400" />
          Interplanetary DTN (Bundle Protocol v7)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-gradient-to-b from-black to-indigo-950 rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />

            {/* Celestial bodies */}
            <Planet {...planets.earth} />
            <Planet {...planets.moon} />
            <Planet {...planets.mars} />

            {/* DTN Bundle transmission */}
            <DTNBundle
              start={planets.earth.pos}
              end={planets[destination].pos}
              progress={bundleProgress}
              status={transmitting ? 'transmitting' : 'idle'}
            />

            {/* Lagrange point relay (L4/L5) */}
            <Sphere args={[0.2, 16, 16]} position={[2, 3, 0]}>
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#8b5cf6"
                emissiveIntensity={0.6}
              />
            </Sphere>
            <Text position={[2, 3.6, 0]} fontSize={0.15} color="white" anchorX="center">
              L4 Relay
            </Text>

            {/* Star field */}
            {Array.from({ length: 100 }).map((_, i) => {
              const pos = [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
              ];
              return (
                <Sphere key={i} args={[0.02, 4, 4]} position={pos}>
                  <meshBasicMaterial color="#ffffff" />
                </Sphere>
              );
            })}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => { setDestination('moon'); setBundleProgress(0); }}
              className={destination === 'moon' ? 'bg-blue-600' : 'bg-gray-700'}
            >
              Moon Link
            </Button>
            <Button
              size="sm"
              onClick={() => { setDestination('mars'); setBundleProgress(0); }}
              className={destination === 'mars' ? 'bg-red-600' : 'bg-gray-700'}
            >
              Mars Link
            </Button>
          </div>

          <Button
            onClick={() => { setTransmitting(true); setBundleProgress(0); }}
            disabled={transmitting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {transmitting ? `Transmitting ${(bundleProgress * 100).toFixed(0)}%` : 'Send DTN Bundle'}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
              <div className="text-xs text-gray-400">Latency</div>
              <div className="text-white font-bold">{latencies[destination]}s</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
              <div className="text-xs text-gray-400">Protocol</div>
              <div className="text-white font-bold">BPv7</div>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
            DTN Store-and-Forward:
            <br />- Custody Transfer until ACK
            <br />- Wavelength: 1064nm (DeepSky)
            <br />- Chronos "Ghost Twin" for latency masking
          </div>

          <div className="flex gap-2">
            <Badge className="bg-amber-500">RFC 9171</Badge>
            <Badge className="bg-green-500">Partition Tolerant</Badge>
          </div>

          <p className="text-sm text-gray-300">
            DTN enables Omni-Present agents across planets. Bundles stored in non-volatile memory 
            until communication window, with Chronos AI predicting remote states.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
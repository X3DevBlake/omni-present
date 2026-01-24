import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Flame } from 'lucide-react';

const Atom3D = ({ position, velocity, element }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current && velocity) {
      meshRef.current.position.x += velocity.x * 0.01;
      meshRef.current.position.y += velocity.y * 0.01;
      meshRef.current.position.z += velocity.z * 0.01;

      // Boundary conditions
      const limit = 5;
      if (Math.abs(meshRef.current.position.x) > limit) velocity.x *= -1;
      if (Math.abs(meshRef.current.position.y) > limit) velocity.y *= -1;
      if (Math.abs(meshRef.current.position.z) > limit) velocity.z *= -1;
    }
  });

  const elementColors = {
    'C': '#6b7280',
    'O': '#ef4444',
    'N': '#3b82f6',
    'H': '#e5e7eb'
  };

  return (
    <Sphere ref={meshRef} args={[0.3, 32, 32]} position={position}>
      <meshStandardMaterial
        color={elementColors[element] || '#6b7280'}
        emissive={elementColors[element] || '#000000'}
        emissiveIntensity={0.4}
      />
    </Sphere>
  );
};

export default function MolecularDynamicsSimulator3D() {
  const [isRunning, setIsRunning] = useState(false);
  const [temperature, setTemperature] = useState(300);
  const [atoms, setAtoms] = useState([
    { id: 0, element: 'C', pos: [0, 0, 0], vel: { x: 0.1, y: 0, z: 0 } },
    { id: 1, element: 'O', pos: [1.5, 0, 0], vel: { x: -0.1, y: 0.1, z: 0 } },
    { id: 2, element: 'N', pos: [0, 1.5, 0], vel: { x: 0, y: -0.1, z: 0.1 } },
    { id: 3, element: 'H', pos: [-1, 0, 1], vel: { x: 0.05, y: 0.05, z: -0.05 } }
  ]);

  const kineticEnergy = atoms.reduce((sum, atom) => {
    const speed = Math.sqrt(atom.vel.x ** 2 + atom.vel.y ** 2 + atom.vel.z ** 2);
    return sum + 0.5 * speed ** 2;
  }, 0);

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-400" />
          Molecular Dynamics Simulator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [8, 8, 8], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Simulation box */}
            <mesh>
              <boxGeometry args={[10, 10, 10]} />
              <meshBasicMaterial color="#1e40af" wireframe transparent opacity={0.2} />
            </mesh>

            {/* Atoms */}
            {isRunning && atoms.map((atom) => (
              <Atom3D
                key={atom.id}
                position={atom.pos}
                velocity={atom.vel}
                element={atom.element}
              />
            ))}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">
              Temperature: {temperature}K
            </label>
            <Slider
              value={[temperature]}
              onValueChange={(v) => setTemperature(v[0])}
              min={100}
              max={1000}
              step={10}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">Atoms</div>
              <div className="text-white font-bold">{atoms.length}</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">KE</div>
              <div className="text-white font-bold">{kineticEnergy.toFixed(2)}</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">Temp</div>
              <div className="text-white font-bold">{temperature}K</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'Pause' : 'Start'} MD
            </Button>
            <Button
              onClick={() => setIsRunning(false)}
              variant="outline"
              className="border-white/20 text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
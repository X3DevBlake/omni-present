import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cone, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import * as THREE from 'three';
import { Zap } from 'lucide-react';

const OpticalWaveguide = ({ voltage }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const phase = voltage * Math.sin(state.clock.elapsedTime * 5);
      meshRef.current.material.emissiveIntensity = 0.3 + Math.abs(phase) * 0.7;
    }
  });

  return (
    <Box ref={meshRef} args={[6, 0.1, 0.1]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#3b82f6"
        emissive="#3b82f6"
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </Box>
  );
};

const ElectricField = ({ voltage, position }) => {
  const arrowRef = useRef();

  useFrame(() => {
    if (arrowRef.current) {
      arrowRef.current.scale.y = voltage * 2;
    }
  });

  return (
    <group position={position} ref={arrowRef}>
      <Cone args={[0.1, 0.5, 16]} rotation={[0, 0, voltage > 0 ? 0 : Math.PI]}>
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={Math.abs(voltage)} />
      </Cone>
    </group>
  );
};

export default function TFLNModulatorVisualizer3D() {
  const [voltage, setVoltage] = useState(0.5);

  const r33 = 30.8; // pm/V
  const ne = 2.14;
  const deltaIndex = -(0.5 * Math.pow(ne, 3) * r33 * voltage) / 10000;
  const phaseShift = (2 * Math.PI / 1.55) * deltaIndex * 5; // Simplified for 5mm length

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          TFLN Electro-Optic Modulator (Pockels Effect)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
          <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Lithium Niobate substrate */}
            <Box args={[7, 0.3, 2]} position={[0, -0.5, 0]}>
              <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.2} />
            </Box>

            {/* Optical waveguide */}
            <OpticalWaveguide voltage={voltage} />

            {/* Electrodes */}
            <Box args={[6, 0.05, 0.3]} position={[0, 0.3, 0]}>
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </Box>
            <Box args={[6, 0.05, 0.3]} position={[0, -0.3, 0]}>
              <meshStandardMaterial color="#60a5fa" metalness={0.9} roughness={0.1} />
            </Box>

            {/* Electric field visualization */}
            {[-2, 0, 2].map((x) => (
              <ElectricField key={x} voltage={voltage} position={[x, 0, 0]} />
            ))}

            {/* Input light */}
            <Cone args={[0.2, 0.8, 32]} position={[-4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <meshStandardMaterial
                color="#ef4444"
                emissive="#dc2626"
                emissiveIntensity={0.8}
              />
            </Cone>
            <Text position={[-5, 0, 0]} fontSize={0.15} color="white">Input</Text>

            {/* Output light (modulated) */}
            <Cone args={[0.2, 0.8, 32]} position={[4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <meshStandardMaterial
                color="#10b981"
                emissive="#059669"
                emissiveIntensity={0.5 + voltage * 0.5}
              />
            </Cone>
            <Text position={[5, 0, 0]} fontSize={0.15} color="white">Output</Text>

            {/* Phase shift visualization */}
            {Math.abs(phaseShift) > 0.1 && (
              <Html position={[0, 1.5, 0]} center>
                <Badge className="bg-purple-500">
                  Phase: {phaseShift.toFixed(2)} rad
                </Badge>
              </Html>
            )}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="bg-black/40 rounded-lg p-4 space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">
              Applied Voltage (V): {voltage.toFixed(2)}V
            </label>
            <Slider
              value={[voltage]}
              onValueChange={(v) => setVoltage(v[0])}
              min={0}
              max={1}
              step={0.05}
            />
          </div>

          <div className="text-xs text-gray-400 font-mono bg-black/60 rounded p-3">
            Δn_e ≈ -(1/2)n_e³r₃₃E_z
            <br />
            <span className="text-blue-400">r₃₃ = {r33} pm/V | n_e = {ne}</span>
            <br />
            <span className="text-green-400">Δn = {deltaIndex.toFixed(6)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">Bandwidth</div>
              <div className="text-white font-bold text-sm">110+ GHz</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">V_π·L</div>
              <div className="text-white font-bold text-sm">0.55 V·cm</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-center">
              <div className="text-xs text-gray-400">Energy</div>
              <div className="text-white font-bold text-sm">&lt;5 fJ/bit</div>
            </div>
          </div>

          <p className="text-sm text-gray-300">
            TFLN modulators use the Pockels effect for sub-volt, ultra-low-power optical switching. 
            Essential for "always-on" Omni-Present edge devices.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
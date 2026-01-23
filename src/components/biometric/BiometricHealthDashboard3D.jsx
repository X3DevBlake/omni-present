import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Torus } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Activity, Droplet, Thermometer, Wind, Zap } from 'lucide-react';
import * as THREE from 'three';

function VitalOrb({ vital, position, color, label, value }) {
  const meshRef = useRef();
  const orbitRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 3) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (orbitRef.current) {
      orbitRef.current.rotation.y = clock.elapsedTime;
    }
  });

  const normalizedValue = value / 100; // Normalize to 0-1

  return (
    <group position={position}>
      <group ref={orbitRef}>
        <Torus args={[0.6, 0.02, 16, 64]}>
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </Torus>
      </group>
      
      <Sphere ref={meshRef} args={[0.4, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={normalizedValue}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Text
        position={[0, 0.8, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {label}
      </Text>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
      >
        {value.toFixed(0)}
      </Text>
    </group>
  );
}

function HealthWaveform({ data, color }) {
  const lineRef = useRef();

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.position.x = -Math.sin(clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 50; i++) {
      const x = (i - 25) * 0.2;
      const y = Math.sin(i * 0.3) * 0.5 + (Math.random() - 0.5) * 0.2;
      const z = 0;
      pts.push([x, y, z]);
    }
    return pts;
  }, []);

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
}

function BiometricScene({ biometricData }) {
  const vitals = biometricData?.vital_signs || {};
  const stress = biometricData?.stress_indicators || {};
  const metabolic = biometricData?.metabolic_data || {};

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff0080" />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#00ffff" />
      
      <Text
        position={[0, 4, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
      >
        BIOMETRIC HEALTH MATRIX
      </Text>

      {/* Vital Signs Orbs */}
      <VitalOrb
        vital="heart_rate"
        position={[-3, 1, 0]}
        color="#ff0055"
        label="Heart Rate"
        value={vitals.heart_rate_bpm || 72}
      />
      <VitalOrb
        vital="oxygen"
        position={[0, 2, -3]}
        color="#00aaff"
        label="O₂ Sat"
        value={vitals.oxygen_saturation || 98}
      />
      <VitalOrb
        vital="temperature"
        position={[3, 1, 0]}
        color="#ff8800"
        label="Temp °C"
        value={vitals.body_temperature_celsius || 37}
      />
      <VitalOrb
        vital="stress"
        position={[0, -1, 3]}
        color="#ffff00"
        label="Stress"
        value={(stress.stress_score || 0.3) * 100}
      />
      <VitalOrb
        vital="glucose"
        position={[-2, -1, -2]}
        color="#00ff88"
        label="Glucose"
        value={metabolic.glucose_level || 95}
      />
      <VitalOrb
        vital="fatigue"
        position={[2, -1, -2]}
        color="#aa00ff"
        label="Energy"
        value={100 - ((stress.fatigue_level || 0.2) * 100)}
      />

      {/* Central Health Core */}
      <Sphere args={[0.6, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
          wireframe
        />
      </Sphere>

      {/* Health Waveforms */}
      <group position={[0, -3, 0]}>
        <HealthWaveform data={vitals} color="#ff0055" />
      </group>

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={0.7}
      />
    </>
  );
}

export default function BiometricHealthDashboard3D({ biometricData }) {
  const healthScore = biometricData?.ai_health_analysis?.overall_health_score || 0.85;
  const anomalies = biometricData?.ai_health_analysis?.anomalies_detected?.length || 0;
  const heartRate = biometricData?.vital_signs?.heart_rate_bpm || 72;

  return (
    <Card className="bg-gradient-to-br from-red-500/20 via-pink-500/20 to-purple-500/20 border-red-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Heart className="w-8 h-8 text-red-400 animate-pulse" />
          Biometric Health Matrix
          <Badge className="bg-red-500/30 text-red-300">
            HEALTH: {(healthScore * 100).toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-red-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-white/60 text-xs">Heart Rate</span>
            </div>
            <div className="text-white text-lg font-bold">{heartRate} BPM</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-4 h-4 text-blue-400" />
              <span className="text-white/60 text-xs">O₂ Sat</span>
            </div>
            <div className="text-white text-lg font-bold">
              {biometricData?.vital_signs?.oxygen_saturation || 98}%
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-white/60 text-xs">Temp</span>
            </div>
            <div className="text-white text-lg font-bold">
              {biometricData?.vital_signs?.body_temperature_celsius || 37}°C
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-yellow-400" />
              <span className="text-white/60 text-xs">Anomalies</span>
            </div>
            <div className="text-white text-lg font-bold">{anomalies}</div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
            <color attach="background" args={['#0a0005']} />
            <fog attach="fog" args={['#0a0005', 5, 35]} />
            <BiometricScene biometricData={biometricData || {}} />
          </Canvas>
        </div>

        {biometricData?.ai_health_analysis?.recommendations && (
          <div className="mt-4 bg-black/40 p-4 rounded-lg border border-green-500/30">
            <div className="text-green-400 font-bold mb-2">AI Health Recommendations:</div>
            <ul className="space-y-1">
              {biometricData.ai_health_analysis.recommendations.slice(0, 3).map((rec, idx) => (
                <li key={idx} className="text-white/70 text-sm">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
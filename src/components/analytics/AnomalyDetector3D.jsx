import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';

function AnomalyMarker({ anomaly, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && !anomaly.resolved) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const getColor = () => {
    if (anomaly.severity > 0.8) return '#ff4444';
    if (anomaly.severity > 0.5) return '#ff8800';
    return '#ffaa00';
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <Sphere args={[0.2 + anomaly.severity * 0.3, 16, 16]}>
          <meshStandardMaterial
            color={getColor()}
            emissive={getColor()}
            emissiveIntensity={anomaly.resolved ? 0.2 : 0.8}
            opacity={anomaly.resolved ? 0.3 : 1}
            transparent
          />
        </Sphere>
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.08} color="white">
        {anomaly.anomaly_type}
      </Text>
      {anomaly.resolved && (
        <Text position={[0, 0.5, 0]} fontSize={0.08} color="#44ff44">
          ✓
        </Text>
      )}
    </group>
  );
}

function DetectionRing({ accuracy }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[2, 0.1, 16, 100]} />
      <meshStandardMaterial
        color="#00f5ff"
        emissive="#00f5ff"
        emissiveIntensity={accuracy}
        wireframe
      />
    </mesh>
  );
}

export default function AnomalyDetector3D({ detector }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff8800" />
        
        {detector && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#ff8800">
              {detector.detector_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {detector.detection_method?.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color="#44ff44">
              Accuracy: {(detector.detection_accuracy * 100).toFixed(1)}%
            </Text>

            <DetectionRing accuracy={detector.detection_accuracy} />

            {detector.anomalies_detected?.slice(0, 8).map((anomaly, i) => {
              const angle = (i / Math.min(detector.anomalies_detected.length, 8)) * Math.PI * 2;
              return (
                <AnomalyMarker
                  key={i}
                  anomaly={anomaly}
                  position={[Math.cos(angle) * 3, Math.sin(angle) * 2, 0]}
                />
              );
            })}

            <group position={[0, -3, 0]}>
              <Text fontSize={0.15} color="#ff8800">
                {detector.anomalies_detected?.filter(a => !a.resolved).length || 0} Active Anomalies
              </Text>
              <Text position={[0, -0.4, 0]} fontSize={0.12} color="#44ff44">
                FPR: {(detector.false_positive_rate * 100).toFixed(2)}%
              </Text>
              {detector.learning_enabled && (
                <Text position={[0, -0.8, 0]} fontSize={0.12} color="#a855f7">
                  🧠 Adaptive Learning Enabled
                </Text>
              )}
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
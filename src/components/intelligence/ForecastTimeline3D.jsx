import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function PredictionPoint({ prediction, position, index }) {
  const pointRef = useRef();

  useFrame((state) => {
    if (pointRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
      pointRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }
  });

  const confidence = prediction.confidence_score || 0.5;
  const color = new THREE.Color();
  color.setHSL(confidence * 0.3, 0.8, 0.5);

  return (
    <group position={position}>
      <Sphere ref={pointRef} args={[0.15, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>

      <Text
        position={[0, 0.4, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
      >
        {Math.round(prediction.predicted_value)}
      </Text>
    </group>
  );
}

function ConfidenceCone({ from, to, interval }) {
  const points = [];
  const steps = 10;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const pos = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...from),
      new THREE.Vector3(...to),
      t
    );
    points.push(pos);
  }

  return (
    <Line
      points={points}
      color="#6366f1"
      lineWidth={2}
      transparent
      opacity={0.3}
    />
  );
}

export default function ForecastTimeline3D({ forecasts }) {
  const forecast = forecasts.find(f => f.status === 'active') || forecasts[0];
  
  const positions = React.useMemo(() => {
    const predictions = forecast?.predictions || [];
    return predictions.slice(0, 10).map((_, idx) => {
      return [
        idx * 0.8 - 3.5,
        Math.sin(idx * 0.5) * 0.5,
        0
      ];
    });
  }, [forecast]);

  return (
    <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

      <Text position={[0, 3, 0]} fontSize={0.3} color="white" anchorX="center">
        Predictive Timeline
      </Text>

      {forecast && (
        <>
          {forecast.predictions?.slice(0, 10).map((pred, idx) => (
            <PredictionPoint
              key={idx}
              prediction={pred}
              position={positions[idx]}
              index={idx}
            />
          ))}

          {positions.slice(0, -1).map((pos, idx) => (
            <ConfidenceCone
              key={`cone-${idx}`}
              from={pos}
              to={positions[idx + 1]}
              interval={forecast.predictions[idx]?.confidence_interval}
            />
          ))}
        </>
      )}

      <OrbitControls
        enableZoom={true}
        minDistance={4}
        maxDistance={15}
      />
    </Canvas>
  );
}
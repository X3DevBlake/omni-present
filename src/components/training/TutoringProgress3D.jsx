import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function ProgressSphere({ position, exercise, color }) {
  const meshRef = useRef();
  const scale = exercise.score ? 0.5 + (exercise.score / 200) : 0.3;
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[scale, 32, 32]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.4}
        />
      </Sphere>
      <Text
        position={[0, scale + 0.3, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {exercise.exercise_name?.slice(0, 15)}
      </Text>
      <Text
        position={[0, -(scale + 0.3), 0]}
        fontSize={0.1}
        color={color}
        anchorX="center"
      >
        {exercise.score || 0}%
      </Text>
    </group>
  );
}

function LearningPath({ exercises }) {
  const points = useMemo(() => {
    const pts = [];
    exercises.forEach((_, i) => {
      const angle = (i / exercises.length) * Math.PI * 2;
      const radius = 3;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius - (i * 0.2),
        0
      ));
    });
    return pts;
  }, [exercises]);

  return <Line points={points} color="#a855f7" lineWidth={2} />;
}

export default function TutoringProgress3D({ session }) {
  const exercises = session?.training_exercises || [];
  const completed = exercises.filter(e => e.completion_status === 'completed');

  const getExerciseColor = (exercise) => {
    if (exercise.completion_status === 'completed') {
      return exercise.score >= 80 ? '#10b981' : exercise.score >= 60 ? '#fbbf24' : '#ef4444';
    } else if (exercise.completion_status === 'in_progress') {
      return '#3b82f6';
    }
    return '#6b7280';
  };

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden relative">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

        <LearningPath exercises={exercises} />

        {exercises.map((exercise, i) => {
          const angle = (i / exercises.length) * Math.PI * 2;
          const radius = 3;
          return (
            <ProgressSphere
              key={i}
              position={[
                Math.cos(angle) * radius,
                Math.sin(angle) * radius - (i * 0.2),
                0
              ]}
              exercise={exercise}
              color={getExerciseColor(exercise)}
            />
          );
        })}

        {/* Center progress indicator */}
        <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#a855f7" 
            emissive="#a855f7" 
            emissiveIntensity={0.6}
            wireframe
          />
        </Sphere>
        <Text position={[0, 0, 1]} fontSize={0.4} color="white">
          {session?.progress_percentage?.toFixed(0) || 0}%
        </Text>

        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
      </Canvas>

      <div className="absolute top-4 left-4 bg-black/60 p-4 rounded-lg backdrop-blur-sm">
        <div className="text-white text-sm font-bold mb-2">
          {session?.session_name || 'Tutoring Session'}
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Completed:</span>
            <span className="text-green-400">{completed.length}/{exercises.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Avg Score:</span>
            <span className="text-cyan-400">
              {completed.length > 0 
                ? (completed.reduce((sum, e) => sum + (e.score || 0), 0) / completed.length).toFixed(0)
                : 0}%
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Status:</span>
            <span className={`${session?.session_status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
              {session?.session_status || 'scheduled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
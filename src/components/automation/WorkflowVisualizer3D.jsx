import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

function WorkflowStep({ step, position, index, totalSteps }) {
  const stepRef = useRef();

  useFrame((state) => {
    if (stepRef.current) {
      const offset = Math.sin(state.clock.elapsedTime * 2 + index * 0.5) * 0.1;
      stepRef.current.position.y = position[1] + offset;
    }
  });

  const stepColors = {
    'function': '#3b82f6',
    'integration': '#10b981',
    'decision': '#f59e0b',
    'loop': '#8b5cf6',
    'parallel': '#ec4899'
  };

  const color = stepColors[step.step_type] || '#6366f1';

  return (
    <group position={position}>
      <RoundedBox ref={stepRef} args={[0.8, 0.5, 0.5]} radius={0.05}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.4}
        />
      </RoundedBox>

      <Text
        position={[0, -0.5, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {step.step_name?.substring(0, 12)}
      </Text>

      <Text
        position={[0, 0.5, 0]}
        fontSize={0.08}
        color="#94a3b8"
        anchorX="center"
      >
        Step {index + 1}/{totalSteps}
      </Text>
    </group>
  );
}

function ConnectionArrow({ from, to }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#22d3ee" linewidth={2} />
    </line>
  );
}

function WorkflowCard({ workflow, onExecute }) {
  return (
    <Html position={[0, -3, 0]} center>
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 w-[300px]">
        <h3 className="text-white font-bold mb-2">{workflow.template_name}</h3>
        <p className="text-slate-400 text-xs mb-3">
          {workflow.steps?.length || 0} steps • {workflow.category}
        </p>
        <button
          onClick={() => onExecute?.(workflow)}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
        >
          Execute Workflow
        </button>
      </div>
    </Html>
  );
}

export default function WorkflowVisualizer3D({ workflows, onExecute }) {
  const selectedWorkflow = workflows[0];

  const stepPositions = React.useMemo(() => {
    const steps = selectedWorkflow?.steps || [];
    return steps.map((_, idx) => {
      const x = (idx - steps.length / 2) * 1.5;
      return [x, 0, 0];
    });
  }, [selectedWorkflow]);

  return (
    <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />

      {selectedWorkflow && (
        <>
          {/* Workflow Steps */}
          {selectedWorkflow.steps?.map((step, idx) => (
            <WorkflowStep
              key={idx}
              step={step}
              position={stepPositions[idx]}
              index={idx}
              totalSteps={selectedWorkflow.steps.length}
            />
          ))}

          {/* Connection Arrows */}
          {selectedWorkflow.steps?.map((_, idx) => {
            if (idx < selectedWorkflow.steps.length - 1) {
              return (
                <ConnectionArrow
                  key={`arrow-${idx}`}
                  from={stepPositions[idx]}
                  to={stepPositions[idx + 1]}
                />
              );
            }
            return null;
          })}

          <WorkflowCard workflow={selectedWorkflow} onExecute={onExecute} />
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
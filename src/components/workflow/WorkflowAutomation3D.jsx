import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox, Line } from '@react-three/drei';
import * as THREE from 'three';

function WorkflowStep({ step, position, index, isActive }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      // Pulsing animation for active step
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(pulse);
    }
  });
  
  const color = isActive ? '#10b981' : step.success ? '#3b82f6' : '#64748b';
  
  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[0.8, 0.5, 0.3]}
        radius={0.05}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.5 : 0.2}
        />
      </RoundedBox>
      
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        maxWidth={0.7}
      >
        {step.step_name}
      </Text>
      
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.08}
        color="#fbbf24"
        anchorX="center"
      >
        Step {index + 1}
      </Text>
    </group>
  );
}

export default function WorkflowAutomation3D({ workflow, currentStep = 0 }) {
  const positions = React.useMemo(() => {
    if (!workflow?.steps) return [];
    
    return workflow.steps.map((_, idx) => {
      const x = (idx - workflow.steps.length / 2) * 2;
      return [x, 0, 0];
    });
  }, [workflow]);
  
  if (!workflow) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No workflow configured</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Workflow steps */}
      {workflow.steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <WorkflowStep
            step={step}
            position={positions[idx]}
            index={idx}
            isActive={idx === currentStep}
          />
          
          {/* Connection line to next step */}
          {idx < workflow.steps.length - 1 && (
            <Line
              points={[
                [positions[idx][0] + 0.4, 0, 0],
                [positions[idx + 1][0] - 0.4, 0, 0]
              ]}
              color="#00f5ff"
              lineWidth={3}
            />
          )}
        </React.Fragment>
      ))}
      
      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
      >
        {workflow.workflow_name}
      </Text>
      
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="#00f5ff"
        anchorX="center"
      >
        {workflow.success_count}/{workflow.execution_count} Successful
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={3}
        maxDistance={15}
      />
    </Canvas>
  );
}
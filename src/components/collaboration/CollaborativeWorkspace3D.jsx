import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function Participant({ participant, position }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && participant.active) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const getTypeColor = () => {
    switch (participant.participant_type) {
      case 'human': return '#00f5ff';
      case 'ai_agent': return '#a855f7';
      case 'ai_facilitator': return '#44ff44';
      default: return '#ffffff';
    }
  };

  const getShape = () => {
    switch (participant.participant_type) {
      case 'human': return <sphereGeometry args={[0.3, 32, 32]} />;
      case 'ai_agent': return <octahedronGeometry args={[0.3]} />;
      case 'ai_facilitator': return <torusGeometry args={[0.25, 0.1, 16, 32]} />;
      default: return <sphereGeometry args={[0.3, 16, 16]} />;
    }
  };

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        {getShape()}
        <meshStandardMaterial
          color={getTypeColor()}
          emissive={getTypeColor()}
          emissiveIntensity={participant.active ? 0.6 : 0.2}
        />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.1} color="white">
        {participant.role}
      </Text>
      {participant.active && (
        <Sphere args={[0.05, 16, 16]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={1} />
        </Sphere>
      )}
    </group>
  );
}

function CollaborationLines({ participants }) {
  return (
    <>
      {participants?.flatMap((p1, i) =>
        participants.slice(i + 1).map((p2, j) => {
          const angle1 = (i / participants.length) * Math.PI * 2;
          const angle2 = ((i + j + 1) / participants.length) * Math.PI * 2;
          
          const points = [
            new THREE.Vector3(Math.cos(angle1) * 3, Math.sin(angle1) * 2, 0),
            new THREE.Vector3(Math.cos(angle2) * 3, Math.sin(angle2) * 2, 0)
          ];
          
          return (
            <Line
              key={`${i}-${j}`}
              points={points}
              color="#00f5ff"
              lineWidth={1}
              opacity={0.3}
              transparent
            />
          );
        })
      )}
    </>
  );
}

function ArtifactNodes({ artifacts }) {
  return (
    <group position={[0, 0, 0]}>
      {artifacts?.slice(0, 5).map((artifact, i) => {
        const angle = (i / Math.min(artifacts.length, 5)) * Math.PI * 2;
        
        return (
          <group key={i} position={[Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0]}>
            <mesh>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial
                color="#ec4899"
                emissive="#ec4899"
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function CollaborativeWorkspace3D({ workspace }) {
  return (
    <div className="w-full h-[600px] bg-black/20 rounded-lg">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
        
        {workspace && (
          <>
            <Text position={[0, 4.5, 0]} fontSize={0.4} color="#00f5ff">
              {workspace.workspace_name}
            </Text>
            <Text position={[0, 3.8, 0]} fontSize={0.2} color="#ffffff">
              {workspace.workspace_type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text position={[0, 3.3, 0]} fontSize={0.18} color="#44ff44">
              {workspace.participants?.filter(p => p.active).length} Active Participants
            </Text>

            <CollaborationLines participants={workspace.participants} />
            <ArtifactNodes artifacts={workspace.shared_artifacts} />

            {workspace.participants?.map((participant, i) => {
              const angle = (i / workspace.participants.length) * Math.PI * 2;
              return (
                <Participant
                  key={i}
                  participant={participant}
                  position={[Math.cos(angle) * 3, Math.sin(angle) * 2, 0]}
                />
              );
            })}

            {workspace.ai_facilitator?.enabled && (
              <group position={[0, -3, 0]}>
                <Text fontSize={0.15} color="#44ff44">
                  🤖 AI Facilitator Active
                </Text>
                <Text position={[0, -0.4, 0]} fontSize={0.12} color="#ffffff">
                  {workspace.ai_facilitator.insights_generated} Insights | {workspace.ai_facilitator.suggestions_provided} Suggestions
                </Text>
              </group>
            )}

            <group position={[0, -4, 0]}>
              <Text fontSize={0.12} color="#00f5ff">
                Quality: {(workspace.collaboration_metrics?.collaboration_quality * 100).toFixed(0)}%
              </Text>
            </group>
          </>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
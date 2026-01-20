import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

function KnowledgeParticle({ position, targetPosition }) {
  const particleRef = useRef();
  const progress = useRef(0);

  useFrame((state) => {
    if (particleRef.current) {
      progress.current = (Math.sin(state.clock.elapsedTime) + 1) / 2;
      particleRef.current.position.lerpVectors(
        new THREE.Vector3(...position),
        new THREE.Vector3(...targetPosition),
        progress.current
      );
    }
  });

  return (
    <Sphere ref={particleRef} args={[0.08, 16, 16]}>
      <meshBasicMaterial color="#fbbf24" />
    </Sphere>
  );
}

function AgentNode({ agentId, position, isSource }) {
  const nodeRef = useRef();

  useFrame(() => {
    if (nodeRef.current) {
      nodeRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={nodeRef} args={[isSource ? 0.5 : 0.3, 32, 32]}>
        <meshStandardMaterial
          color={isSource ? '#10b981' : '#3b82f6'}
          emissive={isSource ? '#10b981' : '#3b82f6'}
          emissiveIntensity={isSource ? 0.7 : 0.4}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>

      <Text
        position={[0, isSource ? -0.8 : -0.5, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {isSource ? 'Source' : 'Target'}
      </Text>

      {/* Glow Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[isSource ? 0.6 : 0.4, 0.03, 16, 100]} />
        <meshBasicMaterial
          color={isSource ? '#10b981' : '#3b82f6'}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

export default function KnowledgeTransferFlow3D({ transfers }) {
  const activeTransfers = transfers.filter(t => 
    t.transfer_status === 'in_progress' || t.transfer_status === 'completed'
  ).slice(0, 10);

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fbbf24" />

      <Text position={[0, 4, 0]} fontSize={0.35} color="white" anchorX="center">
        Knowledge Transfer Network
      </Text>

      {activeTransfers.map((transfer, idx) => {
        const sourcePos = [-3, Math.sin(idx) * 2, 0];
        
        return (
          <React.Fragment key={transfer.id}>
            {/* Source Agent */}
            <AgentNode
              agentId={transfer.source_agent_id}
              position={sourcePos}
              isSource={true}
            />

            {/* Target Agents */}
            {transfer.target_agents?.slice(0, 5).map((targetId, targetIdx) => {
              const angle = (targetIdx / 5) * Math.PI * 2;
              const radius = 3;
              const targetPos = [
                sourcePos[0] + Math.cos(angle) * radius,
                sourcePos[1] + Math.sin(angle * 2) * 0.5,
                sourcePos[2] + Math.sin(angle) * radius
              ];

              return (
                <React.Fragment key={targetId}>
                  <AgentNode
                    agentId={targetId}
                    position={targetPos}
                    isSource={false}
                  />
                  <KnowledgeParticle
                    position={sourcePos}
                    targetPosition={targetPos}
                  />
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={18}
      />
    </Canvas>
  );
}
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

function ParticipantNode({ participant, position, networkHealth }) {
  const nodeRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      nodeRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      nodeRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }
  });

  const typeColors = {
    'agent': '#3b82f6',
    'human': '#10b981',
    'system': '#8b5cf6'
  };

  const color = typeColors[participant.participant_type] || '#6366f1';

  return (
    <group position={position}>
      <Sphere
        ref={nodeRef}
        args={[0.3, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.3}
        />
      </Sphere>

      {hovered && (
        <Html position={[0, 0.6, 0]} center>
          <div className="bg-slate-900/95 backdrop-blur-sm border border-cyan-500 rounded-lg p-2 min-w-[120px]">
            <p className="text-white font-bold text-xs">{participant.role}</p>
            <p className="text-cyan-400 text-xs">
              Score: {Math.round(participant.contribution_score || 0)}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

function NetworkHub({ network, position }) {
  const hubRef = useRef();

  useFrame(() => {
    if (hubRef.current) {
      hubRef.current.rotation.y += 0.005;
    }
  });

  const healthColor = new THREE.Color();
  healthColor.setHSL((network.network_health / 100) * 0.3, 0.8, 0.5);

  return (
    <group position={position}>
      <Sphere ref={hubRef} args={[0.6, 32, 32]}>
        <meshStandardMaterial
          color={healthColor}
          emissive={healthColor}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Text position={[0, 1, 0]} fontSize={0.2} color="white" anchorX="center">
        {network.network_name}
      </Text>

      <Text position={[0, -1, 0]} fontSize={0.12} color="#22d3ee" anchorX="center">
        Health: {Math.round(network.network_health || 0)}%
      </Text>
    </group>
  );
}

function CommunicationBeam({ from, to, strength }) {
  const beamRef = useRef();

  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
    }
  });

  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];

  return (
    <line ref={beamRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0.3 * strength}
        linewidth={strength * 3}
      />
    </line>
  );
}

export default function CollaborationNetwork3D({ networks }) {
  const primaryNetwork = networks[0];

  const participantPositions = React.useMemo(() => {
    const participants = primaryNetwork?.participants || [];
    return participants.map((_, idx) => {
      const angle = (idx / participants.length) * Math.PI * 2;
      const radius = 3;
      return [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * radius
      ];
    });
  }, [primaryNetwork]);

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />

      {primaryNetwork && (
        <>
          {/* Network Hub */}
          <NetworkHub network={primaryNetwork} position={[0, 0, 0]} />

          {/* Participants */}
          {primaryNetwork.participants?.map((participant, idx) => (
            <ParticipantNode
              key={idx}
              participant={participant}
              position={participantPositions[idx]}
              networkHealth={primaryNetwork.network_health}
            />
          ))}

          {/* Communication Beams */}
          {primaryNetwork.communication_graph?.slice(0, 15).map((comm, idx) => {
            const fromIdx = primaryNetwork.participants?.findIndex(p => p.participant_id === comm.from_id);
            const toIdx = primaryNetwork.participants?.findIndex(p => p.participant_id === comm.to_id);
            if (fromIdx >= 0 && toIdx >= 0) {
              return (
                <CommunicationBeam
                  key={idx}
                  from={participantPositions[fromIdx]}
                  to={participantPositions[toIdx]}
                  strength={0.5}
                />
              );
            }
            return null;
          })}
        </>
      )}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={18}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function VoteStack({ vote, position, height, color }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[0.8, height, 0.8]}
        radius={0.05}
        position={[0, height / 2, 0]}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </RoundedBox>
      
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
      >
        {vote}
      </Text>
      
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
      >
        {height.toFixed(0)}
      </Text>
    </group>
  );
}

export default function GovernanceVoting3D({ proposal, votes = [] }) {
  if (!proposal) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No proposal selected</p>
      </div>
    );
  }
  
  const votesFor = proposal.votes_for || 0;
  const votesAgainst = proposal.votes_against || 0;
  const votesAbstain = proposal.votes_abstain || 0;
  const totalVotes = votesFor + votesAgainst + votesAbstain;
  
  const maxVotes = Math.max(votesFor, votesAgainst, votesAbstain, 1);
  const heightScale = 5;
  
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />
      
      {/* Grid floor */}
      <gridHelper args={[12, 12, '#334155', '#1e293b']} />
      
      {/* Vote stacks */}
      <VoteStack
        vote="FOR"
        position={[-3, 0, 0]}
        height={(votesFor / maxVotes) * heightScale}
        color="#10b981"
      />
      
      <VoteStack
        vote="AGAINST"
        position={[0, 0, 0]}
        height={(votesAgainst / maxVotes) * heightScale}
        color="#ef4444"
      />
      
      <VoteStack
        vote="ABSTAIN"
        position={[3, 0, 0]}
        height={(votesAbstain / maxVotes) * heightScale}
        color="#fbbf24"
      />
      
      {/* Proposal title */}
      <Text
        position={[0, 6, -4]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        maxWidth={8}
      >
        {proposal.proposal_title}
      </Text>
      
      {/* Status */}
      <Text
        position={[0, 5.3, -4]}
        fontSize={0.25}
        color={
          proposal.status === 'passed' ? '#10b981' :
          proposal.status === 'rejected' ? '#ef4444' :
          '#00f5ff'
        }
        anchorX="center"
      >
        {proposal.status.toUpperCase()} • {totalVotes} votes
      </Text>
      
      {/* Quorum indicator */}
      <Sphere args={[0.2, 16, 16]} position={[0, 7, -4]}>
        <meshStandardMaterial
          color={totalVotes >= (proposal.quorum_percentage || 50) ? '#10b981' : '#64748b'}
          emissive={totalVotes >= (proposal.quorum_percentage || 50) ? '#10b981' : '#64748b'}
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
      />
    </Canvas>
  );
}
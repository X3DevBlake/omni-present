import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

function DataStreamParticle({ stream, position, index }) {
  const meshRef = useRef();
  const trailRef = useRef([]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.5;
      meshRef.current.rotation.y += 0.03;
      
      const pulse = 1 + stream.impact_score * Math.sin(state.clock.elapsedTime * 3) * 0.3;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const getColor = () => {
    if (stream.type === 'market') {
      return stream.trend === 'rising' ? '#44ff44' : stream.trend === 'falling' ? '#ff4444' : '#00f5ff';
    }
    if (stream.type === 'news') {
      return stream.sentiment === 'positive' ? '#44ff44' : stream.sentiment === 'negative' ? '#ff4444' : '#ffaa00';
    }
    return '#00f5ff';
  };

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.2 + stream.impact_score * 0.3, 16, 16]}>
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      <Html position={[0, 0.6, 0]} center>
        <div className="text-white text-xs font-medium bg-black/70 px-2 py-1 rounded whitespace-nowrap">
          {stream.symbol || stream.title?.slice(0, 20)}
        </div>
      </Html>

      {stream.type === 'market' && (
        <Text position={[0, -0.5, 0]} fontSize={0.1} color={getColor()}>
          ${stream.value?.toFixed(2)}
        </Text>
      )}
    </group>
  );
}

function ImpactLine({ fromPos, toPos, impactScore }) {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[new THREE.Vector3(...fromPos), new THREE.Vector3(...toPos)]}
      color="#a855f7"
      lineWidth={1 + impactScore * 2}
      transparent
      opacity={0.5}
    />
  );
}

function AgentDecisionNode({ agent, position }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.6}
        />
      </mesh>
      <Html position={[0, 0.5, 0]} center>
        <div className="text-purple-300 text-xs bg-black/70 px-2 py-1 rounded">
          Agent {agent.slice(0, 6)}
        </div>
      </Html>
    </group>
  );
}

export default function LiveDataStream3D({ dataStreams = [], newsStreams = [], impactAnalysis = {} }) {
  const allStreams = [...dataStreams, ...newsStreams];

  return (
    <div className="w-full h-[600px] bg-black/20 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />
        
        <Text position={[0, 6, 0]} fontSize={0.5} color="#00f5ff">
          Live Data Streams Impact
        </Text>

        {allStreams.map((stream, i) => {
          const angle = (i / allStreams.length) * Math.PI * 2;
          const radius = 4;
          return (
            <DataStreamParticle
              key={i}
              stream={stream}
              position={[
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
              ]}
              index={i}
            />
          );
        })}

        {dataStreams.map((stream, i) => {
          if (!stream.affected_agents || stream.affected_agents.length === 0) return null;
          
          const streamAngle = (i / allStreams.length) * Math.PI * 2;
          const streamRadius = 4;
          const streamPos = [Math.cos(streamAngle) * streamRadius, 0, Math.sin(streamAngle) * streamRadius];

          return stream.affected_agents.map((agentId, j) => {
            const agentAngle = Math.PI + streamAngle + (j - 1) * 0.3;
            const agentPos = [Math.cos(agentAngle) * 2, -2, Math.sin(agentAngle) * 2];

            return (
              <React.Fragment key={`${i}-${j}`}>
                <AgentDecisionNode agent={agentId} position={agentPos} />
                <ImpactLine fromPos={streamPos} toPos={agentPos} impactScore={stream.impact_score} />
              </React.Fragment>
            );
          });
        })}

        <Text position={[0, -6, 0]} fontSize={0.25} color="white">
          {dataStreams.length} Market Streams • {newsStreams.length} News Feeds
        </Text>

        {impactAnalysis.overall_impact_score && (
          <Text position={[0, -6.7, 0]} fontSize={0.2} color="#ffaa00">
            Impact Score: {(impactAnalysis.overall_impact_score * 100).toFixed(0)}%
          </Text>
        )}
        
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';

function AgentNode({ position, name }) {
    const mesh = useRef();
    useFrame((state) => {
        mesh.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() + position[0]) * 0.1;
    });
    
    return (
        <group position={position} ref={mesh}>
            <Sphere args={[0.4, 32, 32]}>
                <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.2} />
            </Sphere>
            <Text position={[0, 0.6, 0]} fontSize={0.2} color="white">{name}</Text>
        </group>
    );
}

function Connection({ start, end }) {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    return <Line points={points} color="white" opacity={0.2} transparent />;
}

export default function AdHocCollaborationNetwork3D() {
    const agents = [
        { name: "Alpha", pos: [-2, 0, 0] },
        { name: "Beta", pos: [2, 1, 0] },
        { name: "Gamma", pos: [0, -2, 1] }
    ];

    return (
        <div className="w-full h-[500px] bg-slate-900 rounded-xl overflow-hidden border border-green-500/30">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                
                {agents.map((a, i) => <AgentNode key={i} position={a.pos} name={a.name} />)}
                <Connection start={agents[0].pos} end={agents[1].pos} />
                <Connection start={agents[1].pos} end={agents[2].pos} />
                <Connection start={agents[2].pos} end={agents[0].pos} />
                
                <OrbitControls autoRotate />
            </Canvas>
        </div>
    );
}
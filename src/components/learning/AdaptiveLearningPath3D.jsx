import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

function PathNode({ position, label, status }) {
    const color = status === 'In Progress' ? '#ffff00' : (status === 'Completed' ? '#00ff00' : '#555555');
    
    return (
        <group position={position}>
            <Sphere args={[0.5, 32, 32]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </Sphere>
            <Text position={[0, 0.8, 0]} fontSize={0.2} color="white" anchorX="center">
                {label}
            </Text>
            <Text position={[0, -0.8, 0]} fontSize={0.15} color={color} anchorX="center">
                {status}
            </Text>
        </group>
    );
}

function PathSegment({ start, end }) {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const center = new THREE.Vector3().addVectors(new THREE.Vector3(...start), new THREE.Vector3(...end)).multiplyScalar(0.5);
    const distance = new THREE.Vector3(...start).distanceTo(new THREE.Vector3(...end));
    
    return (
        <group>
             {/* Simplified cylinder for connection */}
             <mesh position={center} rotation={[0, 0, Math.atan2(end[1]-start[1], end[0]-start[0])]}>
                <cylinderGeometry args={[0.05, 0.05, distance, 8]} rotation={[0,0,Math.PI/2]} />
                <meshStandardMaterial color="#333" />
             </mesh>
        </group>
    );
}

export default function AdaptiveLearningPath3D({ path }) {
    const modules = path?.modules || [];
    
    return (
        <div className="w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden border border-cyan-500/30">
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                
                {modules.map((mod, i) => (
                    <PathNode 
                        key={i} 
                        position={[(i - (modules.length-1)/2) * 3, Math.sin(i)*2, 0]} 
                        label={mod.name} 
                        status={mod.status} 
                    />
                ))}
                
                <OrbitControls />
            </Canvas>
        </div>
    );
}
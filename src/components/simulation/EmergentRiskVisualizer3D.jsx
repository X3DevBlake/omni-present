import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

const ThreatNode = ({ position, riskScore, label, type }) => {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
        // Pulse scale based on risk score
        const scale = 1 + Math.sin(state.clock.elapsedTime * (riskScore / 20)) * 0.2;
        mesh.current.scale.setScalar(scale);
    }
  });

  const color = riskScore > 80 ? '#ef4444' : riskScore > 50 ? '#f59e0b' : '#3b82f6';

  return (
    <group position={position}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      
      <Html distanceFactor={15}>
        <div className="bg-black/80 p-2 rounded border border-white/20 backdrop-blur-md w-32">
            <div className="text-xs font-bold text-white">{label}</div>
            <div className="text-[10px]" style={{ color }}>Risk: {riskScore}%</div>
            <div className="text-[10px] text-gray-400">{type}</div>
        </div>
      </Html>
    </group>
  );
};

const ThreatConnections = ({ nodes }) => {
    const lines = useMemo(() => {
        const _lines = [];
        nodes.forEach((n1, i) => {
            nodes.forEach((n2, j) => {
                if (i < j && Math.random() > 0.8) {
                    _lines.push({
                        start: n1.position,
                        end: n2.position,
                        color: n1.riskScore > 80 || n2.riskScore > 80 ? '#ef4444' : '#ffffff'
                    });
                }
            });
        });
        return _lines;
    }, [nodes]);

    return (
        <group>
            {lines.map((l, i) => (
                <Line 
                    key={i}
                    points={[l.start, l.end]}
                    color={l.color}
                    transparent
                    opacity={0.2}
                    lineWidth={1}
                />
            ))}
        </group>
    );
};

export default function EmergentRiskVisualizer3D({ forecasts = [] }) {
    const nodes = useMemo(() => {
        return forecasts.map((f, i) => {
            const phi = Math.acos(-1 + (2 * i) / forecasts.length);
            const theta = Math.sqrt(forecasts.length * Math.PI) * phi;
            const r = 5;
            return {
                ...f,
                position: [
                    r * Math.cos(theta) * Math.sin(phi),
                    r * Math.sin(theta) * Math.sin(phi),
                    r * Math.cos(phi)
                ]
            };
        });
    }, [forecasts]);

    return (
        <div className="w-full h-[500px] bg-slate-950 rounded-xl overflow-hidden border border-red-500/20 relative">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h3 className="text-xl font-bold text-red-400">Emergent Threat Matrix</h3>
                <p className="text-xs text-red-200/50">Real-time simulation forecasts</p>
            </div>
            
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                
                {/* Central System Node */}
                <mesh>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshStandardMaterial color="#1e293b" wireframe />
                </mesh>

                {nodes.map((node, i) => (
                    <ThreatNode 
                        key={i} 
                        position={node.position} 
                        riskScore={node.risk_score} 
                        label={node.simulation_id.substring(0, 8)}
                        type="Simulation"
                    />
                ))}
                
                <ThreatConnections nodes={nodes} />
                
                <OrbitControls autoRotate autoRotateSpeed={0.2} />
            </Canvas>
        </div>
    );
}
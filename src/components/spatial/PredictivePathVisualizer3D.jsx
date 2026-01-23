import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Cone } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

function ObstaclePrediction({ obstacle }) {
  const meshRef = useRef();
  const isHighRisk = obstacle.impact_score > 7;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += isHighRisk ? 0.05 : 0.02;
      if (isHighRisk) {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.3 + 1;
        meshRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  const currentPos = obstacle.current_position;
  const trajectoryPoints = obstacle.predicted_trajectory?.map(t => [
    t.position.x,
    t.position.y,
    t.position.z
  ]) || [];

  const allPoints = [[currentPos.x, currentPos.y, currentPos.z], ...trajectoryPoints];

  return (
    <group>
      {/* Current position */}
      <Sphere 
        ref={meshRef}
        position={[currentPos.x, currentPos.y, currentPos.z]}
        args={[0.5, 16, 16]}
      >
        <meshStandardMaterial
          color={isHighRisk ? "#FF0000" : "#FFAA00"}
          emissive={isHighRisk ? "#FF0000" : "#FFAA00"}
          emissiveIntensity={isHighRisk ? 1 : 0.5}
        />
      </Sphere>

      {/* Predicted trajectory */}
      {allPoints.length > 1 && (
        <Line
          points={allPoints}
          color={isHighRisk ? "#FF0000" : "#00FF00"}
          lineWidth={2}
          dashed
          dashScale={20}
        />
      )}

      {/* Future positions */}
      {obstacle.predicted_trajectory?.map((point, idx) => (
        <Sphere
          key={idx}
          position={[point.position.x, point.position.y, point.position.z]}
          args={[0.2, 8, 8]}
        >
          <meshStandardMaterial
            color="#FFAA00"
            transparent
            opacity={1 - (idx / obstacle.predicted_trajectory.length) * 0.8}
          />
        </Sphere>
      ))}

      {/* Warning zone for high risk */}
      {isHighRisk && (
        <Cone
          position={[currentPos.x, currentPos.y + 2, currentPos.z]}
          args={[1, 2, 4]}
          rotation={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#FF0000"
            transparent
            opacity={0.3}
            wireframe
          />
        </Cone>
      )}

      <Text
        position={[currentPos.x, currentPos.y + 1.5, currentPos.z]}
        fontSize={0.3}
        color={isHighRisk ? "#FF0000" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
      >
        Impact: {obstacle.impact_score}/10
      </Text>
    </group>
  );
}

function AvoidancePath({ strategy, currentPos }) {
  if (!strategy.alternative_path || strategy.alternative_path.length === 0) {
    return null;
  }

  const points = [
    [currentPos.x, currentPos.y, currentPos.z],
    ...strategy.alternative_path.map(p => [p.x, p.y, p.z])
  ];

  return (
    <Line
      points={points}
      color="#00FF00"
      lineWidth={3}
      transparent
      opacity={0.6}
    />
  );
}

function SceneContent({ obstacles }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF0000" />
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        maxDistance={50}
      />

      {obstacles.map((obstacle, idx) => (
        <React.Fragment key={obstacle.id || idx}>
          <ObstaclePrediction obstacle={obstacle} />
          {obstacle.avoidance_strategies?.map((strategy, sIdx) => (
            <AvoidancePath
              key={sIdx}
              strategy={strategy}
              currentPos={obstacle.current_position}
            />
          ))}
        </React.Fragment>
      ))}

      <gridHelper args={[20, 20, '#444444', '#222222']} />
    </>
  );
}

export default function PredictivePathVisualizer3D({ obstacles = [], title = "Predictive Path Analysis" }) {
  const highRisk = obstacles.filter(o => o.impact_score > 7);
  const avgConfidence = obstacles.length > 0
    ? (obstacles.reduce((sum, o) => sum + o.confidence, 0) / obstacles.length * 100).toFixed(1)
    : 0;

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 to-red-950 border-red-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            {title}
            {highRisk.length > 0 && <AlertTriangle className="w-5 h-5 text-red-400" />}
          </span>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-slate-800 text-white">
              {obstacles.length} Obstacles
            </Badge>
            {highRisk.length > 0 && (
              <Badge variant="outline" className="bg-red-900 text-red-200">
                {highRisk.length} High Risk
              </Badge>
            )}
            <Badge variant="outline" className="bg-green-900 text-green-200">
              {avgConfidence}% Confidence
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full rounded-lg overflow-hidden bg-black">
          <Canvas camera={{ position: [12, 12, 12], fov: 60 }}>
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#110000', 10, 50]} />
            <SceneContent obstacles={obstacles} />
          </Canvas>
        </div>

        {highRisk.length > 0 && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <h4 className="text-red-200 font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              High Risk Obstacles
            </h4>
            <div className="space-y-2">
              {highRisk.slice(0, 3).map((obstacle, idx) => (
                <div key={idx} className="text-sm text-red-100">
                  <span className="font-medium">Obstacle {idx + 1}:</span> Impact {obstacle.impact_score}/10
                  {obstacle.affected_agents?.length > 0 && (
                    <span className="text-red-300"> • Affects {obstacle.affected_agents.length} agents</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
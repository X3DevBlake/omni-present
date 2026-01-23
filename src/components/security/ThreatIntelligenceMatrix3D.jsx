import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Box } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import * as THREE from 'three';

function ThreatNode({ threat, position, index }) {
  const meshRef = useRef();
  const waveRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.elapsedTime * (1 + index * 0.1);
      meshRef.current.rotation.y = clock.elapsedTime * (0.8 + index * 0.1);
    }
    if (waveRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 3 + index) * 0.3;
      waveRef.current.scale.setScalar(scale);
    }
  });

  const severityColor = {
    critical: '#ff0000',
    high: '#ff4400',
    medium: '#ffaa00',
    low: '#00aaff',
    info: '#00ff88'
  }[threat.severity_level] || '#888888';

  const size = {
    critical: 0.5,
    high: 0.4,
    medium: 0.3,
    low: 0.25,
    info: 0.2
  }[threat.severity_level] || 0.3;

  return (
    <group position={position}>
      <Sphere ref={waveRef} args={[size * 1.8, 32, 32]}>
        <meshBasicMaterial
          color={severityColor}
          transparent
          opacity={0.1}
          wireframe
        />
      </Sphere>
      
      <Box ref={meshRef} args={[size, size, size]}>
        <meshStandardMaterial
          color={severityColor}
          emissive={severityColor}
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>

      <Text
        position={[0, size + 0.5, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {threat.threat_type?.toUpperCase() || 'THREAT'}
      </Text>
      <Text
        position={[0, -size - 0.4, 0]}
        fontSize={0.1}
        color={severityColor}
        anchorX="center"
      >
        {threat.severity_level?.toUpperCase()}
      </Text>
    </group>
  );
}

function DefenseShield() {
  const shieldRef = useRef();

  useFrame(({ clock }) => {
    if (shieldRef.current) {
      shieldRef.current.rotation.y = clock.elapsedTime * 0.5;
      shieldRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={shieldRef} position={[0, 0, 0]}>
      <Sphere args={[2, 32, 32]}>
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.5}
          transparent
          opacity={0.15}
          wireframe
        />
      </Sphere>
      <Text
        position={[0, 0, 0]}
        fontSize={0.3}
        color="#00ff88"
        anchorX="center"
      >
        DEFENSE
      </Text>
    </group>
  );
}

function ThreatIntelligenceScene({ threats }) {
  const activeThreatPositions = useMemo(() => {
    return threats.map((_, idx) => {
      const angle = (idx / threats.length) * Math.PI * 2;
      const radius = 5;
      const height = (Math.random() - 0.5) * 3;
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [threats]);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#00ff88" />
      <pointLight position={[10, 0, 10]} intensity={1} color="#ff0000" />
      <spotLight position={[0, 8, 0]} intensity={1.5} angle={0.5} color="#00ffff" />
      
      <Text
        position={[0, 6, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
      >
        THREAT INTELLIGENCE MATRIX
      </Text>

      {/* Defense Shield */}
      <DefenseShield />

      {/* Threat Nodes */}
      {threats.map((threat, idx) => (
        <ThreatNode
          key={threat.intelligence_id || idx}
          threat={threat}
          position={activeThreatPositions[idx]}
          index={idx}
        />
      ))}

      {/* Attack Vectors */}
      {threats.slice(0, 5).map((threat, idx) => (
        <Line
          key={`vector-${idx}`}
          points={[activeThreatPositions[idx], [0, 0, 0]]}
          color="#ff0000"
          lineWidth={1}
          transparent
          opacity={0.3}
          dashed
        />
      ))}

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={1.2}
      />
    </>
  );
}

export default function ThreatIntelligenceMatrix3D({ threats = [] }) {
  const criticalThreats = threats.filter(t => t.severity_level === 'critical').length;
  const mitigated = threats.filter(t => t.threat_status === 'mitigated' || t.threat_status === 'resolved').length;
  const avgResponseTime = threats.length > 0
    ? threats.reduce((sum, t) => sum + (t.automated_response?.response_time_ms || 0), 0) / threats.length
    : 0;

  return (
    <Card className="bg-gradient-to-br from-red-500/20 via-orange-500/20 to-yellow-500/20 border-red-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Shield className="w-8 h-8 text-red-400 animate-pulse" />
          AI Threat Intelligence Matrix
          <Badge className="bg-red-500/30 text-red-300">
            CRITICAL: {criticalThreats}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-red-500/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-white/60 text-xs">Total Threats</span>
            </div>
            <div className="text-white text-lg font-bold">{threats.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Mitigated</span>
            </div>
            <div className="text-white text-lg font-bold">{mitigated}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-white/60 text-xs">Critical</span>
            </div>
            <div className="text-white text-lg font-bold">{criticalThreats}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Response Time</span>
            </div>
            <div className="text-white text-lg font-bold">{avgResponseTime.toFixed(0)}ms</div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [10, 7, 10], fov: 60 }}>
            <color attach="background" args={['#0a0000']} />
            <fog attach="fog" args={['#0a0000', 5, 40]} />
            <ThreatIntelligenceScene threats={threats} />
          </Canvas>
        </div>

        <div className="mt-4 space-y-2">
          {threats.slice(0, 3).map((threat, idx) => (
            <div key={threat.intelligence_id || idx} className="bg-black/40 p-3 rounded-lg border border-red-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm font-bold">{threat.threat_type}</span>
                <Badge className={
                  threat.severity_level === 'critical' ? 'bg-red-500/30 text-red-300' :
                  threat.severity_level === 'high' ? 'bg-orange-500/30 text-orange-300' :
                  'bg-yellow-500/30 text-yellow-300'
                }>
                  {threat.severity_level}
                </Badge>
              </div>
              <div className="text-white/60 text-xs">
                Status: {threat.threat_status} | Detection: {threat.detection_method}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
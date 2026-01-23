import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Torus, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import * as THREE from 'three';

function AgentCore({ healingLog }) {
  const coreRef = useRef();
  const healingRingRef = useRef();

  useFrame(({ clock }) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = clock.elapsedTime * 0.5;
      const pulse = Math.sin(clock.elapsedTime * 3) * 0.15 + 1;
      coreRef.current.scale.setScalar(pulse);
    }
    if (healingRingRef.current) {
      healingRingRef.current.rotation.x = clock.elapsedTime * 2;
      healingRingRef.current.rotation.z = clock.elapsedTime * 1.5;
    }
  });

  const isHealthy = healingLog?.healing_outcome?.success;
  const coreColor = isHealthy ? '#00ff88' : '#ff4400';

  return (
    <group position={[0, 0, 0]}>
      <Sphere ref={coreRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>

      {/* Healing energy ring */}
      {healingLog && (
        <Torus ref={healingRingRef} args={[1.5, 0.05, 16, 64]}>
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.6}
          />
        </Torus>
      )}

      <Text
        position={[0, 0, 0]}
        fontSize={0.2}
        color="#000000"
        anchorX="center"
      >
        CORE
      </Text>
    </group>
  );
}

function AnomalyIndicator({ anomaly, position, index }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * (1 + index * 0.2);
      const pulse = Math.sin(clock.elapsedTime * 4 + index) * 0.2 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const severityColor = anomaly.severity === 'critical' ? '#ff0000' :
                        anomaly.severity === 'high' ? '#ff4400' :
                        '#ffaa00';

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={severityColor}
          emissive={severityColor}
          emissiveIntensity={1}
        />
      </Sphere>
      <Line
        points={[position, [0, 0, 0]]}
        color={severityColor}
        lineWidth={2}
        transparent
        opacity={0.4}
        dashed
      />
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.1}
        color="white"
        anchorX="center"
      >
        {anomaly.anomaly_type}
      </Text>
    </group>
  );
}

function HealingAction({ action, position, index }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + index) * 0.2;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.15, 16, 16]}>
        <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
      </Sphere>
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.08}
        color="#00ff00"
        anchorX="center"
      >
        {action.slice(0, 10)}
      </Text>
    </group>
  );
}

function SelfHealingScene({ healingLog }) {
  const anomalies = healingLog?.anomaly_detected ? [healingLog.anomaly_detected] : [];
  const actions = healingLog?.healing_strategy?.repair_actions || [];

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ff88" />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#ff4400" />
      
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
      >
        SELF-HEALING SYSTEM
      </Text>

      <AgentCore healingLog={healingLog} />

      {/* Anomalies */}
      {anomalies.map((anomaly, idx) => {
        const angle = (idx / anomalies.length) * Math.PI * 2;
        return (
          <AnomalyIndicator
            key={idx}
            anomaly={anomaly}
            position={[Math.cos(angle) * 3, Math.sin(idx) * 2, Math.sin(angle) * 3]}
            index={idx}
          />
        );
      })}

      {/* Healing Actions */}
      {actions.map((action, idx) => {
        const angle = (idx / actions.length) * Math.PI * 2;
        return (
          <HealingAction
            key={idx}
            action={action}
            position={[Math.cos(angle) * 2, 0, Math.sin(angle) * 2]}
            index={idx}
          />
        );
      })}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.8} />
    </>
  );
}

export default function AgentSelfHealingVisualizer3D({ healingLogs = [] }) {
  const latestLog = healingLogs[0];
  const successRate = healingLogs.length > 0
    ? healingLogs.filter(l => l.healing_outcome?.success).length / healingLogs.length
    : 0;
  const avgRecoveryTime = healingLogs.length > 0
    ? healingLogs.reduce((sum, l) => sum + (l.healing_duration_seconds || 0), 0) / healingLogs.length
    : 0;

  return (
    <Card className="bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 border-green-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <RefreshCw className="w-8 h-8 text-green-400 animate-spin" />
          Agent Self-Healing System
          <Badge className="bg-green-500/30 text-green-300">
            SUCCESS: {(successRate * 100).toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Total Healings</span>
            </div>
            <div className="text-white text-lg font-bold">{healingLogs.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-white/60 text-xs">Success Rate</span>
            </div>
            <div className="text-white text-lg font-bold">{(successRate * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-teal-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-teal-400" />
              <span className="text-white/60 text-xs">Avg Recovery</span>
            </div>
            <div className="text-white text-lg font-bold">{avgRecoveryTime.toFixed(0)}s</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Active Issues</span>
            </div>
            <div className="text-white text-lg font-bold">
              {healingLogs.filter(l => !l.healing_outcome?.success).length}
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [6, 4, 6], fov: 60 }}>
            <color attach="background" args={['#001a0a']} />
            <fog attach="fog" args={['#001a0a', 5, 30]} />
            <SelfHealingScene healingLog={latestLog} />
          </Canvas>
        </div>

        {latestLog && (
          <div className="mt-4 bg-black/40 p-4 rounded-lg border border-green-500/30">
            <div className="text-green-400 font-bold mb-2">Latest Self-Healing Event:</div>
            <div className="text-white/80 text-sm mb-2">
              Anomaly: {latestLog.anomaly_detected?.anomaly_type} ({latestLog.anomaly_detected?.severity})
            </div>
            <div className="text-white/60 text-xs">
              Strategy: {latestLog.healing_strategy?.strategy_type} | 
              Duration: {latestLog.healing_duration_seconds}s | 
              Performance Restored: {latestLog.healing_outcome?.performance_restored_percent}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
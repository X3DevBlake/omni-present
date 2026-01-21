import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cylinder, Html, Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Cpu, Zap, Activity, AlertTriangle } from 'lucide-react';

// Animated component with real-time data
function AnimatedComponent3D({ component, isExploded, health, onClick }) {
  const compRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const basePos = component.position_offset || { x: 0, y: 0, z: 0 };
  const explodeFactor = isExploded ? 2.5 : 1;

  useFrame((state) => {
    if (compRef.current) {
      // Pulse based on health
      const healthPulse = health === 'optimal' ? 0 : health === 'degraded' ? 0.15 : health === 'failing' ? 0.3 : 0;
      compRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * (health === 'failing' ? 6 : 3)) * healthPulse);
      
      // Heat animation for processors
      if (component.component_type === 'processor' && component.specifications?.power_consumption_watts > 50) {
        compRef.current.material.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      }
    }
  });

  const typeShapes = {
    processor: { type: 'box', args: [0.3, 0.1, 0.3], color: '#3b82f6' },
    sensor: { type: 'cylinder', args: [0.08, 0.08, 0.15, 16], color: '#10b981' },
    actuator: { type: 'cylinder', args: [0.06, 0.1, 0.2, 8], color: '#f59e0b' },
    power_supply: { type: 'box', args: [0.25, 0.15, 0.2], color: '#ef4444' },
    communication: { type: 'box', args: [0.15, 0.05, 0.15], color: '#a855f7' },
    storage: { type: 'box', args: [0.2, 0.12, 0.25], color: '#06b6d4' },
    display: { type: 'box', args: [0.4, 0.02, 0.3], color: '#fbbf24' },
    cooling: { type: 'cylinder', args: [0.12, 0.12, 0.08, 16], color: '#8b5cf6' }
  };

  const shape = typeShapes[component.component_type] || typeShapes.processor;
  const healthColors = {
    optimal: shape.color,
    good: shape.color,
    degraded: '#f59e0b',
    failing: '#ef4444',
    failed: '#7f1d1d'
  };

  const color = healthColors[health] || shape.color;
  const position = [
    basePos.x * explodeFactor,
    basePos.y * explodeFactor,
    basePos.z * explodeFactor
  ];

  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      <group ref={compRef}>
        {shape.type === 'box' && (
          <Box args={shape.args}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
          </Box>
        )}
        {shape.type === 'cylinder' && (
          <Cylinder args={shape.args}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
          </Cylinder>
        )}

        {/* Connection ports */}
        {component.specifications?.model && (
          <Sphere args={[0.02, 8, 8]} position={[0.15, 0, 0]}>
            <meshBasicMaterial color="#00f5ff" />
          </Sphere>
        )}
      </group>

      {/* Health indicator */}
      {health !== 'optimal' && (
        <Float speed={4}>
          <Sphere args={[0.04, 8, 8]} position={[0.2, 0.15, 0]}>
            <meshBasicMaterial color={health === 'failing' ? '#ef4444' : '#f59e0b'} />
          </Sphere>
        </Float>
      )}

      {hovered && (
        <Html position={[0, 0.3, 0]} center>
          <div className="bg-black/95 px-3 py-2 rounded-lg text-xs text-white min-w-40">
            <p className="font-bold mb-1" style={{ color }}>{component.component_name}</p>
            <p className="text-slate-400">{component.component_type}</p>
            {component.specifications && (
              <>
                <p className="text-slate-500 text-xs mt-1">{component.specifications.model}</p>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="text-slate-400">Health:</span>
                  <span style={{ color }}>{health}</span>
                </div>
                {component.specifications.power_consumption_watts && (
                  <p className="text-xs text-yellow-400">{component.specifications.power_consumption_watts}W</p>
                )}
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function EnhancedDeviceBlueprintInteractive3D() {
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [isExploded, setIsExploded] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const { data: blueprints = [] } = useQuery({
    queryKey: ['interactive-blueprints'],
    queryFn: () => base44.entities.DeviceBlueprintEnhanced.list('-created_date', 20),
    initialData: []
  });

  const currentBlueprint = selectedBlueprint || blueprints[0];
  const components = currentBlueprint?.internal_components || [];
  const degradedComponents = components.filter(c => c.health_status === 'degraded' || c.health_status === 'failing');

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            Interactive Device Blueprint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={currentBlueprint?.id || ''}
              onChange={(e) => setSelectedBlueprint(blueprints.find(b => b.id === e.target.value))}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm flex-1"
            >
              {blueprints.map(bp => (
                <option key={bp.id} value={bp.id}>
                  {bp.blueprint_name} - {bp.device_category}
                </option>
              ))}
            </select>

            <Button
              variant={isExploded ? 'default' : 'outline'}
              onClick={() => setIsExploded(!isExploded)}
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" /> {isExploded ? 'Assembled' : 'Exploded'} View
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Components</p>
              <p className="text-white text-xl font-bold">{components.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-orange-400" /> Degraded</p>
              <p className={`text-xl font-bold ${degradedComponents.length > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                {degradedComponents.length}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Uptime</p>
              <p className="text-white text-xl font-bold">
                {currentBlueprint?.performance_metrics?.uptime_percentage?.toFixed(1) || '99'}%
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Power</p>
              <p className="text-white text-xl font-bold">
                {components.reduce((sum, c) => sum + (c.specifications?.power_consumption_watts || 0), 0)}W
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[500px]">
            <Canvas camera={{ position: [2, 1.5, 2], fov: 50 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[2, 2, 2]} intensity={1} />
              <pointLight position={[-1, 1, -1]} intensity={0.5} color="#3b82f6" />

              <group>
                {components.map((comp, idx) => (
                  <AnimatedComponent3D
                    key={comp.component_id || idx}
                    component={comp}
                    isExploded={isExploded}
                    health={comp.health_status}
                    onClick={() => setSelectedComponent(comp)}
                  />
                ))}

                {/* Device housing */}
                {!isExploded && currentBlueprint?.dimensions && (
                  <Box args={[
                    currentBlueprint.dimensions.width_cm / 100,
                    currentBlueprint.dimensions.height_cm / 100,
                    currentBlueprint.dimensions.depth_cm / 100
                  ]}>
                    <meshStandardMaterial color="#1e293b" transparent opacity={0.2} wireframe />
                  </Box>
                )}
              </group>

              <OrbitControls enableZoom={true} autoRotate={!isExploded} autoRotateSpeed={1} />
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {selectedComponent && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {selectedComponent.component_name}
              <Badge className={`${selectedComponent.health_status === 'optimal' ? 'bg-green-500/20 text-green-400' : selectedComponent.health_status === 'degraded' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                {selectedComponent.health_status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Type</p>
                <p className="text-white">{selectedComponent.component_type}</p>
              </div>
              {selectedComponent.specifications?.model && (
                <div>
                  <p className="text-slate-400">Model</p>
                  <p className="text-white">{selectedComponent.specifications.model}</p>
                </div>
              )}
              {selectedComponent.specifications?.power_consumption_watts && (
                <div>
                  <p className="text-slate-400">Power</p>
                  <p className="text-yellow-400">{selectedComponent.specifications.power_consumption_watts}W</p>
                </div>
              )}
              {selectedComponent.specifications?.performance_rating && (
                <div>
                  <p className="text-slate-400">Performance</p>
                  <p className="text-cyan-400">{selectedComponent.specifications.performance_rating}/10</p>
                </div>
              )}
              {selectedComponent.replacement_cost && (
                <div>
                  <p className="text-slate-400">Replacement Cost</p>
                  <p className="text-green-400">${selectedComponent.replacement_cost}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
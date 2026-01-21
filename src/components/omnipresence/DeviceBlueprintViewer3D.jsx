import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder, Html, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Cpu, Zap, Thermometer, Activity, Settings, AlertTriangle, Loader2 } from 'lucide-react';

function DeviceComponent({ component, exploded, onSelect, isSelected }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  const offset = component.position_offset || { x: 0, y: 0, z: 0 };
  const explodedOffset = exploded ? 
    { x: offset.x * 2.5, y: offset.y * 2.5 + 0.5, z: offset.z * 2.5 } : 
    offset;

  useFrame((state) => {
    if (ref.current) {
      if (isSelected) {
        ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.08);
      }
      if (hovered) {
        ref.current.rotation.y += 0.02;
      }
    }
  });

  const typeColors = {
    processor: '#3b82f6',
    sensor: '#10b981',
    actuator: '#f59e0b',
    power_supply: '#ef4444',
    communication: '#8b5cf6',
    storage: '#06b6d4',
    display: '#ec4899',
    cooling: '#64748b'
  };

  const healthColors = {
    optimal: '#10b981',
    good: '#22c55e',
    degraded: '#f59e0b',
    failing: '#ef4444',
    failed: '#7f1d1d'
  };

  const color = typeColors[component.component_type] || '#ffffff';
  const healthColor = healthColors[component.health_status] || '#64748b';

  const getComponentShape = () => {
    switch (component.component_type) {
      case 'processor':
        return <Box args={[0.15, 0.03, 0.15]}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={0.9} roughness={0.1} /></Box>;
      case 'sensor':
        return <Sphere args={[0.06, 16, 16]}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} /></Sphere>;
      case 'power_supply':
        return <Cylinder args={[0.08, 0.08, 0.12, 16]}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} /></Cylinder>;
      case 'communication':
        return <Box args={[0.1, 0.02, 0.06]}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} /></Box>;
      default:
        return <Box args={[0.1, 0.05, 0.1]}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} /></Box>;
    }
  };

  return (
    <group
      ref={ref}
      position={[explodedOffset.x, explodedOffset.y, explodedOffset.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect && onSelect(component)}
    >
      {getComponentShape()}

      {/* Health indicator */}
      <Sphere args={[0.02, 8, 8]} position={[0.1, 0.05, 0]}>
        <meshBasicMaterial color={healthColor} />
      </Sphere>

      {/* Connection lines when exploded */}
      {exploded && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, -explodedOffset.x + offset.x, -explodedOffset.y + offset.y + 0.3, -explodedOffset.z + offset.z])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#64748b" transparent opacity={0.5} />
        </line>
      )}

      {(hovered || isSelected) && (
        <Html position={[0, 0.15, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs min-w-44 shadow-xl">
            <p className="font-bold" style={{ color }}>{component.component_name}</p>
            <p className="text-slate-400">{component.component_type}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs">Health:</span>
              <Badge style={{ backgroundColor: `${healthColor}30`, color: healthColor }}>
                {component.health_status}
              </Badge>
            </div>
            {component.specifications?.power_consumption_watts && (
              <p className="text-yellow-400 text-xs mt-1">
                ⚡ {component.specifications.power_consumption_watts}W
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function DeviceHousing({ dimensions }) {
  const dims = dimensions || { width_cm: 20, height_cm: 10, depth_cm: 15 };
  const scale = 0.02;

  return (
    <Box
      args={[dims.width_cm * scale, dims.height_cm * scale, dims.depth_cm * scale]}
      position={[0, dims.height_cm * scale / 2, 0]}
    >
      <meshStandardMaterial
        color="#1e293b"
        transparent
        opacity={0.3}
        metalness={0.8}
        roughness={0.2}
      />
    </Box>
  );
}

function BlueprintScene3D({ blueprint, exploded, selectedComponent, onSelectComponent }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current && !selectedComponent) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Canvas camera={{ position: [1, 0.8, 1], fov: 50 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 3, 2]} intensity={1} />
      <pointLight position={[-2, 2, -2]} intensity={0.5} color="#a855f7" />
      <spotLight position={[0, 4, 0]} intensity={0.5} angle={0.6} />

      <group ref={groupRef}>
        {!exploded && <DeviceHousing dimensions={blueprint?.dimensions} />}

        {(blueprint?.internal_components || []).map((comp, idx) => (
          <DeviceComponent
            key={comp.component_id || idx}
            component={comp}
            exploded={exploded}
            isSelected={selectedComponent?.component_id === comp.component_id}
            onSelect={onSelectComponent}
          />
        ))}
      </group>

      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}

export default function DeviceBlueprintViewer3D({ blueprints = [] }) {
  const queryClient = useQueryClient();
  const [exploded, setExploded] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState(blueprints[0]);

  const { data: enhancedBlueprints = [] } = useQuery({
    queryKey: ['enhanced-blueprints'],
    queryFn: () => base44.entities.DeviceBlueprintEnhanced.list('-created_date', 10),
    initialData: blueprints
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('analyze-device-blueprint', {
        blueprint_id: selectedBlueprint?.id,
        include_optimization: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Analysis complete! Health: ${data.analysis?.health_assessment?.status}`);
      queryClient.invalidateQueries(['enhanced-blueprints']);
    }
  });

  const currentBlueprint = selectedBlueprint || enhancedBlueprints[0];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            Device Blueprint Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedBlueprint?.id || ''}
              onChange={(e) => setSelectedBlueprint(enhancedBlueprints.find(b => b.id === e.target.value))}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm"
            >
              {enhancedBlueprints.map(bp => (
                <option key={bp.id} value={bp.id}>{bp.blueprint_name}</option>
              ))}
            </select>

            <Button
              variant={exploded ? 'default' : 'outline'}
              onClick={() => setExploded(!exploded)}
            >
              {exploded ? 'Assembled View' : 'Exploded View'}
            </Button>

            <Button
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              {analyzeMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing</>
              ) : (
                <><Activity className="w-4 h-4 mr-2" /> Analyze Device</>
              )}
            </Button>
          </div>

          {currentBlueprint?.performance_metrics && (
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs flex items-center gap-1"><Activity className="w-3 h-3" /> Uptime</p>
                <p className="text-white font-bold">{currentBlueprint.performance_metrics.uptime_percentage || 0}%</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs flex items-center gap-1"><Zap className="w-3 h-3" /> Response</p>
                <p className="text-white font-bold">{currentBlueprint.performance_metrics.avg_response_time_ms || 0}ms</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs flex items-center gap-1"><Thermometer className="w-3 h-3" /> Efficiency</p>
                <p className="text-white font-bold">{currentBlueprint.performance_metrics.power_efficiency_score || 0}%</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs flex items-center gap-1"><Settings className="w-3 h-3" /> Reliability</p>
                <p className="text-white font-bold">{currentBlueprint.performance_metrics.reliability_score || 0}%</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">3D Blueprint View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <BlueprintScene3D
                blueprint={currentBlueprint}
                exploded={exploded}
                selectedComponent={selectedComponent}
                onSelectComponent={setSelectedComponent}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[450px] overflow-y-auto">
              {(currentBlueprint?.internal_components || []).map((comp, idx) => (
                <div
                  key={comp.component_id || idx}
                  onClick={() => setSelectedComponent(comp)}
                  className={`bg-slate-800/50 rounded-lg p-3 cursor-pointer transition-all ${
                    selectedComponent?.component_id === comp.component_id ? 'ring-2 ring-cyan-500' : 'hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">{comp.component_name}</span>
                    <Badge className={
                      comp.health_status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                      comp.health_status === 'good' ? 'bg-emerald-500/20 text-emerald-400' :
                      comp.health_status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }>
                      {comp.health_status}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{comp.component_type}</p>
                  {comp.specifications?.power_consumption_watts && (
                    <p className="text-yellow-400 text-xs">⚡ {comp.specifications.power_consumption_watts}W</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {currentBlueprint?.maintenance_schedule?.length > 0 && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Maintenance Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentBlueprint.maintenance_schedule.map((task, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-white font-medium">{task.task_name}</p>
                  <p className="text-slate-400 text-xs">Every {task.frequency_days} days</p>
                  {task.next_due && (
                    <p className="text-yellow-400 text-xs mt-1">Due: {new Date(task.next_due).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
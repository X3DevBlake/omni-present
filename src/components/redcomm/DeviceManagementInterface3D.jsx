import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Text } from '@react-three/drei';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Activity, Download, Wrench, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

function DeviceGlobe({ device, onClick, selected }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (selected) {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1.2;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  const statusColor = {
    'operational': '#22c55e',
    'degraded': '#eab308',
    'maintenance': '#f97316',
    'offline': '#ef4444'
  }[device.operational_status] || '#3b82f6';

  const lat = device.deployment_location?.coordinates?.lat || 0;
  const lon = device.deployment_location?.coordinates?.lon || 0;
  const altitude = device.deployment_location?.altitude_km || 0;

  // Convert lat/lon to 3D position
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const radius = 2 + (altitude / 1000);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return (
    <group position={[x, y, z]} onClick={onClick}>
      <Sphere args={[selected ? 0.15 : 0.1, 16, 16]}>
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={selected ? 2 : 1}
        />
      </Sphere>
      <Html distanceFactor={8}>
        <div className="bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {device.device_id}
        </div>
      </Html>
    </group>
  );
}

function EarthGlobe() {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#1e40af"
        emissive="#1e3a8a"
        emissiveIntensity={0.3}
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

export default function DeviceManagementInterface3D() {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const queryClient = useQueryClient();

  const { data: devices = [] } = useQuery({
    queryKey: ['redcomm-devices-mgmt'],
    queryFn: () => base44.entities.RedCommDevice.list('-created_date', 20),
    refetchInterval: 5000
  });

  const { data: diagnostics = [] } = useQuery({
    queryKey: ['redcomm-diagnostics'],
    queryFn: () => base44.entities.RedCommDeviceDiagnostic.list('-created_date', 10),
    refetchInterval: 5000
  });

  const runDiagnosticMutation = useMutation({
    mutationFn: async (deviceId) => {
      const response = await base44.functions.invoke('redcomm/deviceDiagnostics', {
        deviceId,
        diagnosticType: 'full_diagnostic'
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Diagnostic completed for ${data.diagnostic.device_id}. Health: ${data.device_health.toFixed(0)}%`);
      queryClient.invalidateQueries({ queryKey: ['redcomm-diagnostics'] });
    },
    onError: (error) => {
      toast.error(`Diagnostic failed: ${error.message}`);
    }
  });

  const selected = selectedDevice || devices[0];

  const operationalDevices = devices.filter(d => d.operational_status === 'operational').length;
  const degradedDevices = devices.filter(d => d.operational_status === 'degraded').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-indigo-900/30 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-400" />
            RedComm Device Management - Global 3D
          </CardTitle>
          <div className="flex gap-3 mt-4">
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
              <CheckCircle className="w-3 h-3 mr-1" />
              {operationalDevices} Operational
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
              <AlertCircle className="w-3 h-3 mr-1" />
              {degradedDevices} Degraded
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* 3D Globe View */}
            <div className="h-[500px] bg-black/50 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />

                <EarthGlobe />

                {devices.map((device) => (
                  <DeviceGlobe
                    key={device.id}
                    device={device}
                    onClick={() => setSelectedDevice(device)}
                    selected={selected?.id === device.id}
                  />
                ))}

                <OrbitControls enableDamping dampingFactor={0.05} />
              </Canvas>
            </div>

            {/* Device Details & Controls */}
            <div className="space-y-4">
              {selected && (
                <>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-indigo-500/30">
                    <h3 className="text-lg font-semibold text-white mb-3">{selected.device_id}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Model:</span>
                        <span className="text-white">{selected.device_model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white">{selected.deployment_location?.celestial_body}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Altitude:</span>
                        <span className="text-white">{selected.deployment_location?.altitude_km} km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Status:</span>
                        <Badge variant="outline" className={
                          selected.operational_status === 'operational' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                          selected.operational_status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                          'bg-red-500/20 text-red-400 border-red-500/50'
                        }>
                          {selected.operational_status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specs */}
                  {selected.technical_specs && (
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/30">
                      <h4 className="text-sm font-semibold text-cyan-400 mb-2">Technical Specifications</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bandwidth:</span>
                          <span className="text-white">{selected.technical_specs.max_bandwidth_gbps} Gbps</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">TX Power:</span>
                          <span className="text-white">{selected.technical_specs.transmission_power_w} W</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Antenna Gain:</span>
                          <span className="text-white">{selected.technical_specs.antenna_gain_dbi} dBi</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => runDiagnosticMutation.mutate(selected.device_id)}
                      disabled={runDiagnosticMutation.isPending}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Run Full Diagnostic
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-cyan-500/50"
                      disabled
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Update Firmware (Coming Soon)
                    </Button>
                  </div>

                  {/* Recent Diagnostic */}
                  {diagnostics.filter(d => d.device_id === selected.device_id).length > 0 && (
                    <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                      <h4 className="text-sm font-semibold text-purple-400 mb-2">Latest Diagnostic</h4>
                      {diagnostics.filter(d => d.device_id === selected.device_id)[0].test_results && (
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Overall Health:</span>
                            <span className="text-green-400 font-semibold">
                              {diagnostics.filter(d => d.device_id === selected.device_id)[0].test_results.overall_health?.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-300 mt-2">
                        {diagnostics.filter(d => d.device_id === selected.device_id)[0].ai_diagnostic_analysis}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
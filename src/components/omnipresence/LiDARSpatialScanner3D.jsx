import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Line, Html, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Scan, Loader2, Radar, MapPin, AlertTriangle } from 'lucide-react';

function ScanningBeam({ active, scanAngle }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current && active) {
      ref.current.rotation.y = scanAngle + state.clock.elapsedTime * 2;
    }
  });

  return (
    <group ref={ref} position={[0, 0.5, 0]}>
      <mesh>
        <coneGeometry args={[3, 0.1, 32, 1, true]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={active ? 0.3 : 0.1} side={THREE.DoubleSide} />
      </mesh>
      {active && (
        <Line
          points={[[0, 0, 0], [0, 0, 6]]}
          color="#00f5ff"
          lineWidth={3}
        />
      )}
    </group>
  );
}

function PointCloud({ points, color = '#00f5ff' }) {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
    }
  });

  const positions = new Float32Array(points.length * 3);
  points.forEach((p, i) => {
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial size={0.05} color={color} transparent opacity={0.8} />
    </Points>
  );
}

function DetectedObstacle({ obstacle, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const pos = obstacle.position || { x: 0, y: 0.5, z: 0 };
  const size = obstacle.bounding_box || { width: 0.5, height: 0.5, depth: 0.5 };

  const typeColors = {
    furniture: '#f59e0b',
    person: '#ec4899',
    pet: '#a855f7',
    dynamic: '#ef4444',
    static: '#10b981'
  };

  const color = typeColors[obstacle.obstacle_type] || '#ffffff';

  return (
    <group
      position={[pos.x, pos.y, pos.z]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect && onSelect(obstacle)}
    >
      <Box args={[size.width, size.height, size.depth]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          transparent
          opacity={0.6}
        />
      </Box>

      {/* Avoidance zone */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -size.height / 2, 0]}>
        <ringGeometry args={[
          Math.max(size.width, size.depth) / 2 + 0.3,
          Math.max(size.width, size.depth) / 2 + 0.5,
          32
        ]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {hovered && (
        <Html position={[0, size.height / 2 + 0.3, 0]} center>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg text-xs">
            <p className="font-bold" style={{ color }}>{obstacle.object_label || obstacle.obstacle_type}</p>
            <p className="text-slate-400">Confidence: {((obstacle.confidence || 0.9) * 100).toFixed(0)}%</p>
            {obstacle.velocity && (
              <p className="text-yellow-400">Moving: {Math.sqrt(obstacle.velocity.vx**2 + obstacle.velocity.vz**2).toFixed(2)} m/s</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function AvoidanceZone({ zone }) {
  const bounds = zone.boundaries || { min_x: 0, max_x: 2, min_z: 0, max_z: 2 };
  const width = bounds.max_x - bounds.min_x;
  const depth = bounds.max_z - bounds.min_z;
  const centerX = (bounds.min_x + bounds.max_x) / 2;
  const centerZ = (bounds.min_z + bounds.max_z) / 2;

  const zoneColors = {
    no_go: '#ef4444',
    caution: '#f59e0b',
    safe: '#10b981',
    learned: '#8b5cf6'
  };

  const color = zoneColors[zone.zone_type] || '#ffffff';

  return (
    <group position={[centerX, 0.05, centerZ]}>
      <mesh>
        <boxGeometry args={[width, 0.02, depth]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <Html position={[0, 0.2, 0]} center>
        <div className="text-xs px-1 rounded" style={{ backgroundColor: `${color}40`, color }}>
          {zone.zone_name}
        </div>
      </Html>
    </group>
  );
}

function ScannerScene3D({ scanning, obstacles, avoidanceZones, pointCloud, scanProgress }) {
  return (
    <Canvas camera={{ position: [8, 6, 8], fov: 55 }}>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-5, 10, -5]} intensity={0.4} color="#00f5ff" />

      {/* Floor */}
      <Box args={[14, 0.05, 12]} position={[6, 0, 5]}>
        <meshStandardMaterial color="#050510" />
      </Box>
      <gridHelper args={[14, 14, '#0f2940', '#081020']} position={[6, 0.03, 5]} />

      {/* Scanner */}
      <group position={[6, 0, 5]}>
        <Sphere args={[0.2, 32, 32]}>
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={scanning ? 1.5 : 0.5} />
        </Sphere>
        <ScanningBeam active={scanning} scanAngle={scanProgress * Math.PI * 2} />
      </group>

      {/* Point cloud */}
      {pointCloud.length > 0 && <PointCloud points={pointCloud} />}

      {/* Avoidance zones */}
      {avoidanceZones.map((zone, idx) => (
        <AvoidanceZone key={idx} zone={zone} />
      ))}

      {/* Detected obstacles */}
      {obstacles.map((obstacle, idx) => (
        <DetectedObstacle key={obstacle.id || idx} obstacle={obstacle} />
      ))}

      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}

export default function LiDARSpatialScanner3D({ spatialZones = [], detections = [] }) {
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResolution, setScanResolution] = useState([50]);
  const [pointCloud, setPointCloud] = useState([]);
  const [learnedZones, setLearnedZones] = useState([]);

  const scanMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('enhance-spatial-mapping', {
        scan_type: 'lidar',
        resolution: scanResolution[0],
        detect_dynamic: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Scan complete! Detected ${data.obstacles_detected || 0} obstacles`);
      if (data.learned_zones) setLearnedZones(data.learned_zones);
      queryClient.invalidateQueries(['dynamic-detections']);
    }
  });

  const learnAvoidanceMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('learn-obstacle-patterns', {
        detections: detections.slice(0, 20),
        create_avoidance_zones: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Learned ${data.zones_created || 0} avoidance zones!`);
      setLearnedZones(prev => [...prev, ...(data.new_zones || [])]);
      queryClient.invalidateQueries(['spatial-zones']);
    }
  });

  useEffect(() => {
    if (scanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 1) {
            setScanning(false);
            scanMutation.mutate();
            return 0;
          }
          // Generate point cloud data
          const newPoints = Array.from({ length: 50 }).map(() => ({
            x: Math.random() * 12 - 1,
            y: Math.random() * 0.5,
            z: Math.random() * 10 - 1
          }));
          setPointCloud(p => [...p.slice(-500), ...newPoints]);
          return prev + 0.02;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [scanning]);

  const startScan = () => {
    setScanning(true);
    setScanProgress(0);
    setPointCloud([]);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Radar className="w-5 h-5 text-cyan-400" />
            LiDAR Environmental Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={startScan}
              disabled={scanning}
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              {scanning ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning {Math.round(scanProgress * 100)}%</>
              ) : (
                <><Scan className="w-4 h-4 mr-2" /> Start LiDAR Scan</>
              )}
            </Button>

            <Button
              onClick={() => learnAvoidanceMutation.mutate()}
              disabled={learnAvoidanceMutation.isPending || detections.length === 0}
              variant="outline"
            >
              {learnAvoidanceMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              Learn Avoidance Zones
            </Button>

            <div className="flex-1">
              <p className="text-slate-400 text-xs mb-1">Scan Resolution</p>
              <Slider
                value={scanResolution}
                onValueChange={setScanResolution}
                min={20}
                max={100}
                step={10}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Point Cloud</p>
              <p className="text-white text-xl font-bold">{pointCloud.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Obstacles</p>
              <p className="text-white text-xl font-bold">{detections.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Avoidance Zones</p>
              <p className="text-white text-xl font-bold">{spatialZones.filter(z => z.zone_type === 'no_go' || z.zone_type === 'restricted').length + learnedZones.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Resolution</p>
              <p className="text-white text-xl font-bold">{scanResolution[0]}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Real-Time Spatial Scan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[550px]">
            <ScannerScene3D
              scanning={scanning}
              obstacles={detections}
              avoidanceZones={[...spatialZones.filter(z => z.zone_type === 'no_go' || z.zone_type === 'restricted'), ...learnedZones]}
              pointCloud={pointCloud}
              scanProgress={scanProgress}
            />
          </div>
        </CardContent>
      </Card>

      {detections.length > 0 && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Detected Objects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {detections.slice(0, 8).map((det, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">{det.detected_object?.object_label || det.detected_object?.object_type || 'Object'}</span>
                    <Badge className={
                      det.tracking_status === 'tracking' ? 'bg-green-500/20 text-green-400' :
                      det.tracking_status === 'new' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-slate-700 text-slate-400'
                    }>
                      {det.tracking_status}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    Confidence: {((det.detected_object?.confidence || 0.9) * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
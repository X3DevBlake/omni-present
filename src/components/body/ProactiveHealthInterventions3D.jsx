import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Html, Text, Box } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Zap, Activity, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

function InterventionNode3D({ intervention, position }) {
  const nodeRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      nodeRef.current.scale.setScalar(pulse * (hovered ? 1.3 : 1));
    }
  });

  const isAuto = intervention.auto_executed;
  const color = isAuto ? '#10b981' : '#f59e0b';

  return (
    <group position={position}>
      <Sphere
        ref={nodeRef}
        args={[0.2, 16, 16]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
      </Sphere>

      {hovered && (
        <Html position={[0, 0.4, 0]} center>
          <div className="bg-slate-900 border border-green-500/50 rounded-lg p-3 min-w-56">
            <p className="text-white font-bold text-sm mb-1">{intervention.intervention_type}</p>
            <p className="text-green-400 text-xs">Impact: +{intervention.predicted_impact?.health_score_change?.toFixed(0)} points</p>
            <Badge className={isAuto ? "bg-green-500/30 text-xs mt-1" : "bg-orange-500/30 text-xs mt-1"}>
              {isAuto ? 'Auto-executed' : 'Manual approval'}
            </Badge>
          </div>
        </Html>
      )}
    </group>
  );
}

function InterventionImpactBeam3D({ from, to, impact = 0.5 }) {
  const beamRef = useRef();

  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.material.opacity = impact * (0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
    }
  });

  return (
    <Line
      ref={beamRef}
      points={[from, to]}
      color="#10b981"
      lineWidth={3}
      transparent
    />
  );
}

function InterventionScene({ interventions = [] }) {
  return (
    <>
      <gridHelper args={[8, 8, '#334155', '#1e293b']} />
      
      {interventions.slice(0, 6).map((intervention, idx) => {
        const angle = (idx / 6) * Math.PI * 2;
        const radius = 2;
        const position = [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
        
        return (
          <React.Fragment key={intervention.id}>
            <InterventionNode3D intervention={intervention} position={position} />
            <InterventionImpactBeam3D 
              from={position}
              to={[0, 0, 0]}
              impact={intervention.predicted_impact?.health_score_change / 20}
            />
          </React.Fragment>
        );
      })}

      {/* Central health core */}
      <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.5} />
      </Sphere>
    </>
  );
}

export default function ProactiveHealthInterventions3D() {
  const queryClient = useQueryClient();

  const { data: interventions = [] } = useQuery({
    queryKey: ['proactive-interventions'],
    queryFn: () => base44.entities.ProactiveHealthIntervention.list('-created_date', 15),
    initialData: []
  });

  const initiateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('proactive-health-intervention', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['proactive-interventions']);
      toast.success(`${data.auto_executed_count} interventions auto-executed`);
    }
  });

  const activeInterventions = interventions.filter(i => i.execution_status === 'executing');
  const autoExecuted = interventions.filter(i => i.auto_executed).length;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-400" />
            Proactive Health Interventions
            <Badge className="bg-green-500/30">{interventions.length} Total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => initiateMutation.mutate()}
            disabled={initiateMutation.isPending}
            className="w-full bg-gradient-to-r from-green-600 to-cyan-600 text-lg py-6"
          >
            {initiateMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
            Scan & Initiate Interventions
          </Button>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-500/10 rounded-lg p-2">
              <p className="text-slate-400 text-xs">Active</p>
              <p className="text-green-400 font-bold text-lg">{activeInterventions.length}</p>
            </div>
            <div className="bg-cyan-500/10 rounded-lg p-2">
              <p className="text-slate-400 text-xs">Auto-executed</p>
              <p className="text-cyan-400 font-bold text-lg">{autoExecuted}</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-2">
              <p className="text-slate-400 text-xs">Total</p>
              <p className="text-purple-400 font-bold text-lg">{interventions.length}</p>
            </div>
          </div>

          {interventions.slice(0, 3).map((intervention) => (
            <div key={intervention.id} className="bg-slate-800/60 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-bold text-sm">{intervention.intervention_type.replace(/_/g, ' ')}</p>
                  <p className="text-slate-400 text-xs">{intervention.trigger_source?.system}</p>
                </div>
                <Badge className={intervention.auto_executed ? "bg-green-500/30" : "bg-orange-500/30"}>
                  {intervention.execution_status}
                </Badge>
              </div>
              
              {intervention.augmentation_adjustments?.length > 0 && (
                <p className="text-green-400 text-xs mb-1">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  {intervention.augmentation_adjustments.length} augmentation adjustments
                </p>
              )}
              
              {intervention.companion_guidance?.length > 0 && (
                <p className="text-cyan-400 text-xs mb-1">
                  <Heart className="w-3 h-3 inline mr-1" />
                  {intervention.companion_guidance.length} companion guidance messages
                </p>
              )}
              
              {intervention.predicted_impact && (
                <p className="text-purple-400 text-xs">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +{intervention.predicted_impact.health_score_change} health score in {intervention.predicted_impact.timeline_days}d
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="p-0">
          <div className="h-[400px]">
            <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 8, 5]} intensity={2} color="#10b981" />
              <pointLight position={[-5, 5, -5]} intensity={1.5} color="#06b6d4" />

              <InterventionScene interventions={interventions} />

              <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.7} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Play, Check, Lock, ChevronRight, 
  Maximize2, Code, Beaker, Box as BoxIcon, Eye 
} from 'lucide-react';
import QuantumCircuitBuilder3D from './QuantumCircuitBuilder3D';
import NeuralArchitectureStudio3D from './NeuralArchitectureStudio3D';
import EnhancedHolographicClassroom3D from './EnhancedHolographicClassroom3D';
import InfoNCEVisualizer3D from './InfoNCEVisualizer3D';
import PhotophoreticTrapSimulator3D from './PhotophoreticTrapSimulator3D';
import CRDTLatticeVisualizer3D from './CRDTLatticeVisualizer3D';
import AttentionMechanismVisualizer3D from './AttentionMechanismVisualizer3D';
import HAASSwarmVisualizer3D from './HAASSwarmVisualizer3D';
import Sim2RealVisualizer3D from './Sim2RealVisualizer3D';
import BayesianFusionVisualizer3D from './BayesianFusionVisualizer3D';
import IITPhiVisualizer3D from '../consciousness/IITPhiVisualizer3D';
import GWTIgnitionVisualizer3D from '../consciousness/GWTIgnitionVisualizer3D';
import RedCommMeshVisualizer3D from '../network/RedCommMeshVisualizer3D';
import TFLNModulatorVisualizer3D from '../photonics/TFLNModulatorVisualizer3D';
import SCIONPathVisualizer3D from '../network/SCIONPathVisualizer3D';
import DeepBlueUnderwaterPod3D from '../ecosystem/DeepBlueUnderwaterPod3D';
import InterplanetaryDTNVisualizer3D from '../space/InterplanetaryDTNVisualizer3D';

const ModuleCard = ({ module, isCompleted, isLocked, onClick, progress }) => {
  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : 1.02 }}
      onClick={!isLocked ? onClick : undefined}
    >
      <Card className={`
        ${isLocked ? 'bg-gray-900/40 cursor-not-allowed' : 'bg-white/10 cursor-pointer hover:bg-white/15'}
        backdrop-blur-xl border-white/20 transition-all
      `}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isCompleted && <Check className="w-5 h-5 text-green-400" />}
                {isLocked && <Lock className="w-5 h-5 text-gray-500" />}
                <h3 className="font-bold text-white">{module.title}</h3>
              </div>
              <Badge className={`${getContentTypeBadgeColor(module.content_type)} text-xs`}>
                {module.content_type}
              </Badge>
            </div>
            {!isLocked && <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
          <p className="text-sm text-gray-400 mb-3">
            {module.estimated_duration_minutes} minutes
          </p>
          {progress > 0 && (
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const getContentTypeBadgeColor = (type) => {
  const colors = {
    'interactive_3d': 'bg-blue-500',
    'simulation': 'bg-purple-500',
    'holographic': 'bg-pink-500',
    'mixed': 'bg-amber-500',
    'text': 'bg-gray-500',
    'video': 'bg-green-500'
  };
  return colors[type] || 'bg-gray-500';
};

const InteractiveSimulatorSelector = ({ moduleId, onSelect }) => {
  const simulators = [
    { id: 'quantum_circuit', name: 'Quantum Circuit Builder', icon: Beaker, component: 'QuantumCircuitBuilder3D' },
    { id: 'neural_studio', name: 'Neural Architecture Studio', icon: Brain, component: 'NeuralArchitectureStudio3D' },
    { id: 'infonce', name: 'InfoNCE Loss Explorer', icon: Code, component: 'InfoNCEVisualizer3D' },
    { id: 'photophoretic', name: 'Photophoretic Trap', icon: BoxIcon, component: 'PhotophoreticTrapSimulator3D' },
    { id: 'crdt', name: 'CRDT Lattice', icon: Eye, component: 'CRDTLatticeVisualizer3D' },
    { id: 'attention', name: 'Attention Mechanism', icon: Brain, component: 'AttentionMechanismVisualizer3D' },
    { id: 'haas', name: 'HAAS Swarm', icon: BoxIcon, component: 'HAASSwarmVisualizer3D' },
    { id: 'sim2real', name: 'Sim2Real Transfer', icon: Beaker, component: 'Sim2RealVisualizer3D' },
    { id: 'bayesian', name: 'Bayesian Fusion', icon: Code, component: 'BayesianFusionVisualizer3D' },
    { id: 'iit_phi', name: 'IIT Phi Calculator', icon: Brain, component: 'IITPhiVisualizer3D' },
    { id: 'gwt', name: 'GWT Ignition', icon: Beaker, component: 'GWTIgnitionVisualizer3D' },
    { id: 'redcomm', name: 'RedComm Mesh', icon: BoxIcon, component: 'RedCommMeshVisualizer3D' },
    { id: 'tfln', name: 'TFLN Modulator', icon: Eye, component: 'TFLNModulatorVisualizer3D' },
    { id: 'scion', name: 'SCION Routing', icon: Code, component: 'SCIONPathVisualizer3D' },
    { id: 'deepblue', name: 'DeepBlue Pods', icon: Beaker, component: 'DeepBlueUnderwaterPod3D' },
    { id: 'dtn', name: 'Interplanetary DTN', icon: BoxIcon, component: 'InterplanetaryDTNVisualizer3D' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {simulators.map((sim) => {
        const Icon = sim.icon;
        return (
          <Button
            key={sim.id}
            size="sm"
            onClick={() => onSelect(sim)}
            className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-white"
          >
            <Icon className="w-4 h-4 mr-2" />
            <span className="text-xs">{sim.name}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default function CourseViewerEnhanced({ courseId, userId }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [selectedSimulator, setSelectedSimulator] = useState(null);
  const queryClient = useQueryClient();

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.filter({ course_id: courseId }),
    select: (data) => data[0]
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['modules', courseId],
    queryFn: () => base44.entities.Module.filter({ course_id: courseId }),
    select: (data) => data.sort((a, b) => a.order_index - b.order_index)
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['training-progress', userId, courseId],
    queryFn: () => base44.entities.TrainingProgress.filter({ user_id: userId, course_id: courseId }),
    enabled: !!userId
  });

  const completeModuleMutation = useMutation({
    mutationFn: async (moduleId) => {
      return await base44.entities.TrainingProgress.create({
        user_id: userId,
        course_id: courseId,
        module_id: moduleId,
        completed: true,
        completion_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-progress'] });
    }
  });

  const renderSimulator = () => {
    if (!selectedSimulator) return null;

    const components = {
      QuantumCircuitBuilder3D,
      NeuralArchitectureStudio3D,
      InfoNCEVisualizer3D,
      PhotophoreticTrapSimulator3D,
      CRDTLatticeVisualizer3D,
      AttentionMechanismVisualizer3D,
      HAASSwarmVisualizer3D,
      Sim2RealVisualizer3D,
      BayesianFusionVisualizer3D,
      IITPhiVisualizer3D,
      GWTIgnitionVisualizer3D,
      RedCommMeshVisualizer3D,
      TFLNModulatorVisualizer3D,
      SCIONPathVisualizer3D,
      DeepBlueUnderwaterPod3D,
      InterplanetaryDTNVisualizer3D
    };

    const Component = components[selectedSimulator.component];
    return Component ? <Component /> : null;
  };

  if (immersiveMode && selectedModule) {
    return (
      <div className="fixed inset-0 z-50">
        <EnhancedHolographicClassroom3D
          sessionId={`session_${Date.now()}`}
          courseId={courseId}
          moduleId={selectedModule.module_id}
        />
        <Button
          onClick={() => setImmersiveMode(false)}
          className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700"
        >
          Exit Immersive
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      {course && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-2xl mb-2">{course.title}</CardTitle>
                  <p className="text-gray-300">{course.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Badge className="bg-purple-500">{course.academic_level}</Badge>
                    <Badge className="bg-blue-500">{course.duration_weeks} weeks</Badge>
                    <Badge className="bg-green-500">{course.credits} credits</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      {/* Modules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, idx) => {
          const moduleProgress = progress.find(p => p.module_id === module.module_id);
          const isCompleted = moduleProgress?.completed || false;
          const isLocked = idx > 0 && !progress.find(p => p.module_id === modules[idx - 1].module_id)?.completed;

          return (
            <ModuleCard
              key={module.id}
              module={module}
              isCompleted={isCompleted}
              isLocked={isLocked}
              onClick={() => setSelectedModule(module)}
              progress={moduleProgress?.progress || 0}
            />
          );
        })}
      </div>

      {/* Selected Module View */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    {selectedModule.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setImmersiveMode(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Immersive Mode
                    </Button>
                    <Button
                      onClick={() => completeModuleMutation.mutate(selectedModule.module_id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="simulators" className="w-full">
                  <TabsList className="bg-white/10">
                    <TabsTrigger value="simulators">Interactive Simulators</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="exercises">Exercises</TabsTrigger>
                  </TabsList>

                  <TabsContent value="simulators" className="space-y-4">
                    <div className="bg-black/40 rounded-lg p-4">
                      <h4 className="text-white font-bold mb-3">Choose Interactive Simulator:</h4>
                      <InteractiveSimulatorSelector
                        moduleId={selectedModule.module_id}
                        onSelect={setSelectedSimulator}
                      />
                    </div>

                    {selectedSimulator && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {renderSimulator()}
                      </motion.div>
                    )}
                  </TabsContent>

                  <TabsContent value="content">
                    <div className="bg-black/40 rounded-lg p-6 text-white">
                      <h3 className="text-xl font-bold mb-4">Learning Outcomes:</h3>
                      <ul className="space-y-2">
                        {selectedModule.learning_outcomes?.map((outcome, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="exercises">
                    <div className="bg-black/40 rounded-lg p-6">
                      <p className="text-gray-400">Interactive exercises will appear here</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  BookOpen, Brain, Atom, Network, Download, 
  ExternalLink, Sparkles, Award, FileText 
} from 'lucide-react';
import UniversalHolographicOverlay from '../components/holographic/UniversalHolographicOverlay';
import OmniDataOrb3D from '../components/academy/OmniDataOrb3D';
import BookVisualizer3D from '../components/academy/BookVisualizer3D';
import InfoNCEVisualizer3D from '../components/academy/InfoNCEVisualizer3D';
import PhotophoreticTrapSimulator3D from '../components/academy/PhotophoreticTrapSimulator3D';
import CRDTLatticeVisualizer3D from '../components/academy/CRDTLatticeVisualizer3D';
import AttentionMechanismVisualizer3D from '../components/academy/AttentionMechanismVisualizer3D';
import HAASSwarmVisualizer3D from '../components/academy/HAASSwarmVisualizer3D';
import Sim2RealVisualizer3D from '../components/academy/Sim2RealVisualizer3D';
import BayesianFusionVisualizer3D from '../components/academy/BayesianFusionVisualizer3D';
import LearningPathVisualizer3D from '../components/academy/LearningPathVisualizer3D';
import IITPhiVisualizer3D from '../components/consciousness/IITPhiVisualizer3D';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import GWTIgnitionVisualizer3D from '../components/consciousness/GWTIgnitionVisualizer3D';
import RedCommMeshVisualizer3D from '../components/network/RedCommMeshVisualizer3D';
import TFLNModulatorVisualizer3D from '../components/photonics/TFLNModulatorVisualizer3D';
import SCIONPathVisualizer3D from '../components/network/SCIONPathVisualizer3D';
import DeepBlueUnderwaterPod3D from '../components/ecosystem/DeepBlueUnderwaterPod3D';
import InterplanetaryDTNVisualizer3D from '../components/space/InterplanetaryDTNVisualizer3D';

export default function OmniPresentAcademy() {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: courses = [] } = useQuery({
    queryKey: ['opo-courses'],
    queryFn: () => base44.entities.Course.filter({
      course_id: { $in: ['opo_foundations', 'cyber_physical_convergence', 'distributed_agents'] }
    })
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['opo-modules'],
    queryFn: () => base44.entities.Module.list(),
    select: (data) => data.filter(m => 
      ['opo_foundations', 'cyber_physical_convergence', 'distributed_agents'].includes(m.course_id)
    )
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: researchDocs = [] } = useQuery({
    queryKey: ['opo-research-docs'],
    queryFn: () => base44.entities.MediaAsset.filter({
      tags: { $contains: 'research' }
    }),
    select: (data) => data.filter(d => 
      d.title?.includes('Omni-Present')
    )
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <UniversalHolographicOverlay
        spatialBounds={{ x: [-10, 10], y: [-10, 10], z: [-5, 5] }}
        contentTypes={['data_visualization', 'ui_element']}
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Omni-Present Omega Academy
        </h1>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-6">
          Master the convergence of Neural Isomorphism, Volumetric Sentience, and Recursive Autonomy
        </p>
        <Link to={createPageUrl('HolographicClassroomHub')}>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Video className="w-5 h-5 mr-2" />
            Enter Holographic Classrooms
          </Button>
        </Link>
      </motion.div>

      {/* Research Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-400" />
              Core Research Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {researchDocs.map((doc) => (
                <Card key={doc.id} className="bg-black/40 border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <FileText className="w-8 h-8 text-purple-400 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-2">{doc.title}</h3>
                        <p className="text-sm text-gray-300 mb-3">{doc.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {doc.tags?.map((tag, idx) => (
                            <Badge key={idx} className="bg-blue-500/20 text-blue-300 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View PDF
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = doc.url;
                              a.download = doc.title + '.pdf';
                              a.click();
                            }}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Download className="w-3 h-3 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interactive Data Orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-12"
      >
        <OmniDataOrb3D />
      </motion.div>

      {/* Courses */}
      <Tabs defaultValue="courses" className="mb-12">
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="courses" className="data-[state=active]:bg-blue-600">
            Courses
          </TabsTrigger>
          <TabsTrigger value="interactive" className="data-[state=active]:bg-purple-600">
            Interactive Concepts
          </TabsTrigger>
          <TabsTrigger value="modules" className="data-[state=active]:bg-pink-600">
            Modules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const icons = {
                opo_foundations: Atom,
                cyber_physical_convergence: Brain,
                distributed_agents: Network
              };
              const Icon = icons[course.course_id] || BookOpen;

              return (
                <motion.div
                  key={course.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedCourse(course)}
                >
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 cursor-pointer hover:border-blue-400/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Icon className="w-8 h-8 text-blue-400" />
                        <div className="flex-1">
                          <CardTitle className="text-white mb-2">{course.title}</CardTitle>
                          <Badge className="bg-purple-500">{course.academic_level}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300 mb-4">{course.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-400">
                          <span>Duration:</span>
                          <span className="text-white">{course.duration_weeks} weeks</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Credits:</span>
                          <span className="text-white">{course.credits}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Enroll Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="interactive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">InfoNCE Loss Visualizer</CardTitle>
              </CardHeader>
              <CardContent>
                <InfoNCEVisualizer3D />
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Photophoretic Trap Simulator</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotophoreticTrapSimulator3D />
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">CRDT Lattice Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <CRDTLatticeVisualizer3D />
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Attention Mechanism</CardTitle>
              </CardHeader>
              <CardContent>
                <AttentionMechanismVisualizer3D />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <HAASSwarmVisualizer3D />
            <Sim2RealVisualizer3D />
            <BayesianFusionVisualizer3D />
            <IITPhiVisualizer3D />
            <GWTIgnitionVisualizer3D />
            <TFLNModulatorVisualizer3D />
          </div>

          <div className="grid grid-cols-1 gap-6 mt-6">
            <RedCommMeshVisualizer3D />
            <SCIONPathVisualizer3D />
            <DeepBlueUnderwaterPod3D />
            <InterplanetaryDTNVisualizer3D />
          </div>
        </TabsContent>

        <TabsContent value="modules">
          {selectedCourse ? (
            <BookVisualizer3D 
              courseId={selectedCourse.course_id}
              userId="demo"
            />
          ) : (
            <div className="text-center py-20">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-white text-lg">Select a course to view modules</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Personalized Learning Path */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <LearningPathVisualizer3D userId={user.id} />
        </motion.div>
      )}

      {/* Learning Paths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              Certification Pathways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">BCI Specialist</h4>
                <p className="text-sm text-gray-300 mb-3">
                  Master neural decoding, InfoNCE optimization, and state-dependent algorithms
                </p>
                <Badge className="bg-blue-500">4 Modules</Badge>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Holographic Engineer</h4>
                <p className="text-sm text-gray-300 mb-3">
                  Design volumetric displays using photophoretic trapping and SLM systems
                </p>
                <Badge className="bg-purple-500">5 Modules</Badge>
              </div>
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Swarm Architect</h4>
                <p className="text-sm text-gray-300 mb-3">
                  Build HAAS systems with Global Workspace Theory and recursive autonomy
                </p>
                <Badge className="bg-pink-500">6 Modules</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import OmniDataOrb3D from '../components/academy/OmniDataOrb3D';
import BookVisualizer3D from '../components/academy/BookVisualizer3D';
import UniversalHolographicOverlay from '../components/holographic/UniversalHolographicOverlay';
import HolographicAgentPresence3D from '../components/holographic/HolographicAgentPresence3D';
import LearningPathVisualizer3D from '../components/academy/LearningPathVisualizer3D';
import DynamicCourseEnvironment3D from '../components/academy/DynamicCourseEnvironment3D';
import AIAdvisorHologram from '../components/academy/AIAdvisorHologram';
import { 
  BookOpen, FlaskConical, Award, Brain, 
  TrendingUp, Users, Sparkles 
} from 'lucide-react';

export default function AcademyDashboard() {
  const [selectedView, setSelectedView] = useState('dashboard');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['academic-profile', user?.id],
    queryFn: async () => {
      const profiles = await base44.entities.AcademicProfile.filter({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user
  });

  const { data: enrolledCourses = [] } = useQuery({
    queryKey: ['enrolled-courses', profile?.enrolled_courses],
    queryFn: async () => {
      const courses = [];
      for (const courseId of profile?.enrolled_courses || []) {
        const result = await base44.entities.Course.filter({ course_id: courseId });
        if (result[0]) courses.push(result[0]);
      }
      return courses;
    },
    enabled: !!profile?.enrolled_courses?.length
  });

  const { data: researchProjects = [] } = useQuery({
    queryKey: ['my-research'],
    queryFn: () => base44.entities.ResearchProject.filter({ principal_investigator: user.id }),
    enabled: !!user
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ['my-certifications', profile?.certifications],
    queryFn: async () => {
      const certs = [];
      for (const certId of profile?.certifications || []) {
        const result = await base44.entities.Certification.filter({ certification_id: certId });
        if (result[0]) certs.push(result[0]);
      }
      return certs;
    },
    enabled: !!profile?.certifications?.length
  });

  if (selectedView === 'data-orb') {
    return <OmniDataOrb3D />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-6">
      <UniversalHolographicOverlay />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Omni-Present Academy
            </h1>
            <p className="text-gray-300">
              Welcome back, {user?.full_name || 'Scholar'}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setSelectedView('data-orb')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Data Orb
            </Button>
          </div>
        </div>
      </motion.div>

      {/* AI Advisor Hologram */}
      {profile?.ai_advisor_agent_id && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <AIAdvisorHologram 
            agentId={profile.ai_advisor_agent_id}
            userId={user?.id}
          />
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Enrolled Courses
              </CardTitle>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{enrolledCourses.length}</div>
              <p className="text-xs text-gray-300 mt-1">Active learning paths</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Research Projects
              </CardTitle>
              <FlaskConical className="w-4 h-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{researchProjects.length}</div>
              <p className="text-xs text-gray-300 mt-1">Active investigations</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Certifications
              </CardTitle>
              <Award className="w-4 h-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{certifications.length}</div>
              <p className="text-xs text-gray-300 mt-1">Blockchain verified</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Learning Progress
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">87%</div>
              <p className="text-xs text-gray-300 mt-1">Overall completion</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="bg-white/10 backdrop-blur-xl border-white/20">
          <TabsTrigger value="courses" className="text-white">My Courses</TabsTrigger>
          <TabsTrigger value="research" className="text-white">Research</TabsTrigger>
          <TabsTrigger value="learning-path" className="text-white">Learning Path</TabsTrigger>
          <TabsTrigger value="certifications" className="text-white">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-blue-400/50 transition-all cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-white">{course.title}</CardTitle>
                    <p className="text-sm text-gray-300">{course.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{course.academic_level}</span>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="research" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            {researchProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white">{project.title}</CardTitle>
                        <p className="text-sm text-gray-300 mt-2">{project.abstract}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        project.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        project.status === 'peer_review' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Open Project
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/20 text-white">
                        View Data Vault
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="learning-path" className="mt-6">
          <LearningPathVisualizer3D userId={user?.id} />
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map((cert, idx) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl border-purple-400/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="w-6 h-6 text-yellow-400" />
                      {cert.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300 mb-4">{cert.description}</p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>Issued: {new Date(cert.issued_date).toLocaleDateString()}</div>
                      <div>Blockchain: {cert.blockchain_record?.transaction_hash?.substring(0, 20)}...</div>
                    </div>
                    <Button size="sm" className="mt-4 w-full bg-purple-600 hover:bg-purple-700">
                      View Certificate
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
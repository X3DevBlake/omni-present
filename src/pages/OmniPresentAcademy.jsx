import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Sparkles, BookOpen, Trophy, Users, TrendingUp, Atom, Code, Zap,
  GraduationCap, Award, Target, Rocket, FlaskConical, MessageSquare, FileText
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import EnhancedInteractiveCourseViewer from '../components/academy/EnhancedInteractiveCourseViewer';
import InteractiveResearchVisualizer3D from '../components/academy/InteractiveResearchVisualizer3D';
import NeuralArchitectureStudio3D from '../components/academy/NeuralArchitectureStudio3D';
import QuantumCircuitBuilder3D from '../components/academy/QuantumCircuitBuilder3D';
import XPSystem3D from '../components/gamification/XPSystem3D';
import DailyStreakTracker3D from '../components/gamification/DailyStreakTracker3D';
import AchievementUnlocker3D from '../components/gamification/AchievementUnlocker3D';

export default function OmniPresentAcademy() {
  const [activeTab, setActiveTab] = useState('courses');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: enrolledCourses = [] } = useQuery({
    queryKey: ['enrolledCourses', user?.email],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ enrolled: true });
      return courses;
    },
    enabled: !!user
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: async () => {
      const data = await base44.entities.OmniAchievement.filter({ user_email: user?.email });
      return data;
    },
    enabled: !!user
  });

  const { data: streakData } = useQuery({
    queryKey: ['dailyStreak', user?.email],
    queryFn: async () => {
      const response = await base44.functions.invoke('trackDailyStreak');
      return response.data;
    },
    enabled: !!user
  });

  const stats = {
    coursesCompleted: enrolledCourses.filter(c => c.progress === 100).length,
    totalCourses: enrolledCourses.length,
    researchProjects: 3,
    certificates: achievements.length,
    totalHours: enrolledCourses.reduce((sum, c) => sum + (c.hours_spent || 0), 0),
    currentStreak: streakData?.current_streak || 0,
    totalXP: achievements.reduce((sum, a) => sum + (a.xp || 0), 0),
    level: Math.floor(achievements.reduce((sum, a) => sum + (a.xp || 0), 0) / 500) + 1
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950 to-purple-950" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 70%, rgba(34, 211, 238, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.h1 
                className="text-5xl font-black mb-2 relative"
                style={{ 
                  background: 'linear-gradient(90deg, #c084fc 0%, #ec4899 50%, #22d3ee 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  filter: [
                    'drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))',
                    'drop-shadow(0 0 40px rgba(236, 72, 153, 0.7))',
                    'drop-shadow(0 0 20px rgba(34, 211, 238, 0.6))',
                    'drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))'
                  ]
                }}
                transition={{ 
                  backgroundPosition: { duration: 6, repeat: Infinity, ease: "linear" },
                  filter: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                Omni-Present Academy
              </motion.h1>
              <p className="text-gray-300 text-lg">
                Advanced AI, Quantum Computing & Consciousness Engineering
              </p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.2, rotate: 360 }} 
              transition={{ duration: 0.8 }}
              animate={{ rotate: [0, 10, -10, 0] }}
            >
              <GraduationCap className="w-16 h-16 text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
            </motion.div>
          </div>

          {/* Gamification Stats */}
          {user && (
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <XPSystem3D userXP={stats.totalXP} userLevel={stats.level} />
              <DailyStreakTracker3D currentStreak={stats.currentStreak} longestStreak={streakData?.longest_streak || 0} />
              <AchievementUnlocker3D userEmail={user?.email} />
              <Card className="bg-gradient-to-br from-purple-950/90 to-indigo-950/90 backdrop-blur-xl border-purple-500/30 relative group">
                <div className="absolute inset-0 bg-purple-500/30 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                <CardContent className="p-4 flex flex-col justify-center items-center h-full relative">
                  <Trophy className="w-12 h-12 text-purple-400 mb-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                  <div className="text-white text-3xl font-bold">{stats.certificates}</div>
                  <div className="text-gray-400 text-xs">Certificates</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { icon: BookOpen, label: 'Courses', value: stats.totalCourses, textColor: 'text-purple-400', borderColor: 'border-purple-500/40' },
              { icon: Trophy, label: 'Completed', value: stats.coursesCompleted, textColor: 'text-green-400', borderColor: 'border-green-500/40' },
              { icon: FlaskConical, label: 'Research', value: stats.researchProjects, textColor: 'text-cyan-400', borderColor: 'border-cyan-500/40' },
              { icon: Award, label: 'Certificates', value: stats.certificates, textColor: 'text-amber-400', borderColor: 'border-amber-500/40' },
              { icon: TrendingUp, label: 'Hours', value: stats.totalHours, textColor: 'text-blue-400', borderColor: 'border-blue-500/40' },
              { icon: Zap, label: 'Streak', value: `${stats.currentStreak}d`, textColor: 'text-pink-400', borderColor: 'border-pink-500/40' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className={`bg-black/60 border-2 ${stat.borderColor} backdrop-blur-xl`}>
                    <CardContent className="p-4">
                      <Icon className={`w-6 h-6 ${stat.textColor} mb-2`} />
                      <div className="text-white text-2xl font-bold">{stat.value}</div>
                      <div className="text-gray-400 text-xs">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/60 backdrop-blur-xl border border-white/10 mb-8 p-2 rounded-2xl">
            <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl py-3">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="assignments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 rounded-xl py-3">
              <Target className="w-4 h-4 mr-2" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="research" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 rounded-xl py-3">
              <FlaskConical className="w-4 h-4 mr-2" />
              Research
            </TabsTrigger>
            <TabsTrigger value="certifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 rounded-xl py-3">
              <Award className="w-4 h-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="lab" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 rounded-xl py-3">
              <Atom className="w-4 h-4 mr-2" />
              Labs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {/* PDF Course Materials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">
                <FileText className="w-8 h-8 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                Course Materials Library
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  { 
                    title: 'Neural Network Fundamentals',
                    category: 'Deep Learning',
                    pages: 248,
                    topics: ['Backpropagation', 'Gradient Descent', 'Activation Functions'],
                    color: 'purple',
                    pdfUrl: '#'
                  },
                  { 
                    title: 'Quantum Computing Primer',
                    category: 'Quantum Physics',
                    pages: 186,
                    topics: ['Qubits', 'Superposition', 'Entanglement'],
                    color: 'blue',
                    pdfUrl: '#'
                  },
                  { 
                    title: 'Consciousness Engineering',
                    category: 'Neuroscience',
                    pages: 312,
                    topics: ['IIT 4.0', 'Global Workspace', 'Integrated Information'],
                    color: 'pink',
                    pdfUrl: '#'
                  },
                  { 
                    title: 'Advanced Reinforcement Learning',
                    category: 'Machine Learning',
                    pages: 274,
                    topics: ['Policy Gradients', 'Q-Learning', 'Actor-Critic'],
                    color: 'cyan',
                    pdfUrl: '#'
                  },
                  { 
                    title: 'Distributed Systems Architecture',
                    category: 'Systems Design',
                    pages: 198,
                    topics: ['CRDTs', 'Consensus', 'Edge Computing'],
                    color: 'green',
                    pdfUrl: '#'
                  },
                  { 
                    title: 'Photophoretic Display Technology',
                    category: 'Optics',
                    pages: 156,
                    topics: ['Light Field Theory', 'POT Physics', 'Volumetric Rendering'],
                    color: 'amber',
                    pdfUrl: '#'
                  }
                ].map((course, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05, y: -10 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative group cursor-pointer"
                  >
                    <div className={`absolute inset-0 ${
                      course.color === 'purple' ? 'bg-purple-500/30' :
                      course.color === 'blue' ? 'bg-blue-500/30' :
                      course.color === 'pink' ? 'bg-pink-500/30' :
                      course.color === 'cyan' ? 'bg-cyan-500/30' :
                      course.color === 'green' ? 'bg-green-500/30' :
                      'bg-amber-500/30'
                    } rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all`} />
                    
                    <Card className={`relative ${
                      course.color === 'purple' ? 'bg-gradient-to-br from-purple-950/90 to-purple-900/70 border-purple-500/60' :
                      course.color === 'blue' ? 'bg-gradient-to-br from-blue-950/90 to-blue-900/70 border-blue-500/60' :
                      course.color === 'pink' ? 'bg-gradient-to-br from-pink-950/90 to-pink-900/70 border-pink-500/60' :
                      course.color === 'cyan' ? 'bg-gradient-to-br from-cyan-950/90 to-cyan-900/70 border-cyan-500/60' :
                      course.color === 'green' ? 'bg-gradient-to-br from-green-950/90 to-green-900/70 border-green-500/60' :
                      'bg-gradient-to-br from-amber-950/90 to-amber-900/70 border-amber-500/60'
                    } border-2 backdrop-blur-xl h-full`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="mb-2 bg-white/10 text-white/80">{course.category}</Badge>
                            <CardTitle className="text-white text-xl">{course.title}</CardTitle>
                          </div>
                          <FileText className={`w-8 h-8 ${
                            course.color === 'purple' ? 'text-purple-400' :
                            course.color === 'blue' ? 'text-blue-400' :
                            course.color === 'pink' ? 'text-pink-400' :
                            course.color === 'cyan' ? 'text-cyan-400' :
                            course.color === 'green' ? 'text-green-400' :
                            'text-amber-400'
                          }`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="text-gray-400 text-sm mb-2">Topics Covered:</div>
                          <div className="space-y-1">
                            {course.topics.map((topic, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  course.color === 'purple' ? 'bg-purple-400' :
                                  course.color === 'blue' ? 'bg-blue-400' :
                                  course.color === 'pink' ? 'bg-pink-400' :
                                  course.color === 'cyan' ? 'bg-cyan-400' :
                                  course.color === 'green' ? 'bg-green-400' :
                                  'bg-amber-400'
                                }`} />
                                <span className="text-gray-300 text-sm">{topic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-gray-500 text-xs mb-4">{course.pages} pages</div>
                        <Button className={`w-full ${
                          course.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                          course.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                          course.color === 'pink' ? 'bg-pink-600 hover:bg-pink-700' :
                          course.color === 'cyan' ? 'bg-cyan-600 hover:bg-cyan-700' :
                          course.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                          'bg-amber-600 hover:bg-amber-700'
                        }`}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Open Course
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <EnhancedInteractiveCourseViewer />
            
            {/* Course Categories */}
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {[
                { title: 'AI & Machine Learning', count: 24, icon: Brain, color: 'purple' },
                { title: 'Quantum Computing', count: 12, icon: Atom, color: 'blue' },
                { title: 'Consciousness Theory', count: 8, icon: Sparkles, color: 'pink' }
              ].map((category, idx) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`${
                      idx === 0 ? 'bg-gradient-to-br from-purple-950/80 to-purple-900/60 border-purple-500/40' :
                      idx === 1 ? 'bg-gradient-to-br from-blue-950/80 to-blue-900/60 border-blue-500/40' :
                      'bg-gradient-to-br from-pink-950/80 to-pink-900/60 border-pink-500/40'
                    } backdrop-blur-xl cursor-pointer group relative`}>
                      <div className={`absolute inset-0 ${
                        idx === 0 ? 'bg-purple-500/30' :
                        idx === 1 ? 'bg-blue-500/30' :
                        'bg-pink-500/30'
                      } rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all`} />
                      <CardContent className="p-6 relative">
                        <Icon className={`w-12 h-12 ${
                          idx === 0 ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]' :
                          idx === 1 ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' :
                          'text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]'
                        } mb-4`} />
                        <h3 className="text-white font-bold text-xl mb-2">{category.title}</h3>
                        <div className="text-gray-300 text-sm">{category.count} courses available</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="assignments">
            <Card className="bg-gradient-to-br from-blue-950/80 to-cyan-950/60 border-blue-500/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Active Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">Track and complete your course assignments</p>
                <div className="grid gap-4">
                  {[
                    { title: 'Neural Network Implementation', course: 'Deep Learning', due: '2 days', progress: 65 },
                    { title: 'Quantum Circuit Design', course: 'Quantum Computing', due: '5 days', progress: 30 }
                  ].map((assignment, idx) => (
                    <Card key={idx} className="bg-black/60 border-blue-500/30">
                      <CardContent className="p-4">
                        <h3 className="text-white font-bold mb-1">{assignment.title}</h3>
                        <p className="text-gray-500 text-sm mb-2">{assignment.course}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-800 rounded-full h-2">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${assignment.progress}%` }} />
                          </div>
                          <span className="text-white text-sm">{assignment.progress}%</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">Due in {assignment.due}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications">
            <Card className="bg-gradient-to-br from-amber-950/80 to-orange-950/60 border-amber-500/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Your Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-6">Earn blockchain-verified credentials</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.length > 0 ? achievements.map((cert, idx) => (
                    <Card key={idx} className="bg-black/60 border-amber-500/30">
                      <CardContent className="p-6 text-center">
                        <Award className="w-16 h-16 text-amber-400 mx-auto mb-3" />
                        <h3 className="text-white font-bold">{cert.title || `Achievement ${idx + 1}`}</h3>
                        <p className="text-gray-500 text-sm mt-1">Earned {new Date(cert.created_date).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-2 text-center py-12">
                      <Award className="w-24 h-24 text-amber-400/30 mx-auto mb-4" />
                      <p className="text-gray-500">Complete courses to earn certifications</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research">
            <InteractiveResearchVisualizer3D />
            
            {/* Research Opportunities */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {[
                { 
                  title: 'Join Active Projects', 
                  description: 'Collaborate with leading researchers on cutting-edge experiments',
                  action: 'Browse Projects',
                  icon: Users,
                  color: 'cyan'
                },
                { 
                  title: 'Publish Research', 
                  description: 'Share your findings with the global research community',
                  action: 'Submit Paper',
                  icon: FileText,
                  color: 'green'
                }
              ].map((opportunity, idx) => {
                const Icon = opportunity.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.03, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    <Card className={`${
                      idx === 0 ? 'bg-gradient-to-br from-cyan-950/80 to-black/60 border-cyan-500/40' :
                      'bg-gradient-to-br from-green-950/80 to-black/60 border-green-500/40'
                    } backdrop-blur-xl group relative`}>
                      <div className={`absolute inset-0 ${
                        idx === 0 ? 'bg-cyan-500/30' : 'bg-green-500/30'
                      } rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all`} />
                      <CardContent className="p-6 relative">
                        <Icon className={`w-10 h-10 ${
                          idx === 0 ? 'text-cyan-400' : 'text-green-400'
                        } mb-4`} />
                        <h3 className="text-white font-bold text-xl mb-2">{opportunity.title}</h3>
                        <p className="text-gray-400 text-sm mb-4">{opportunity.description}</p>
                        <Button className={`w-full ${
                          idx === 0 ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-green-600 hover:bg-green-700'
                        }`}>
                          {opportunity.action}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="lab">
            <div className="space-y-6">
              <NeuralArchitectureStudio3D />
              <QuantumCircuitBuilder3D />
            </div>
          </TabsContent>


        </Tabs>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-all" />
          <div className="relative bg-gradient-to-r from-purple-900/80 via-pink-900/80 to-blue-900/80 backdrop-blur-2xl border-2 border-purple-500/60 rounded-3xl p-12 text-center shadow-2xl">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Rocket className="w-16 h-16 text-purple-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]" />
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Become a Consciousness Engineer
            </h2>
            <p className="text-gray-200 text-lg mb-8 max-w-2xl mx-auto">
              Master the intersection of neuroscience, quantum mechanics, and artificial intelligence
            </p>
            <div className="flex gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.1, y: -5 }} whileTap={{ scale: 0.95 }} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                <Button size="lg" className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg border-2 border-purple-400/50">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Learning
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -5 }} whileTap={{ scale: 0.95 }} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                <Button size="lg" className="relative bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-8 py-6 text-lg border-2 border-cyan-400/50">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Course Catalog
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
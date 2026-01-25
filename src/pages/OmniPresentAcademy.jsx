import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Sparkles, BookOpen, Trophy, Users, TrendingUp, Atom, Code, Zap,
  GraduationCap, Award, Target, Rocket, FlaskConical, MessageSquare
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import EnhancedInteractiveCourseViewer from '../components/academy/EnhancedInteractiveCourseViewer';
import InteractiveResearchVisualizer3D from '../components/academy/InteractiveResearchVisualizer3D';
import NeuralArchitectureStudio3D from '../components/academy/NeuralArchitectureStudio3D';
import QuantumCircuitBuilder3D from '../components/academy/QuantumCircuitBuilder3D';

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

  const stats = {
    coursesCompleted: enrolledCourses.filter(c => c.progress === 100).length,
    totalCourses: enrolledCourses.length,
    researchProjects: 3,
    certificates: achievements.length,
    totalHours: enrolledCourses.reduce((sum, c) => sum + (c.hours_spent || 0), 0),
    currentStreak: 12
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                Omni-Present Academy
              </h1>
              <p className="text-gray-400 text-lg">
                Advanced AI, Quantum Computing & Consciousness Engineering
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.1, rotate: 360 }} transition={{ duration: 0.6 }}>
              <GraduationCap className="w-16 h-16 text-purple-400" />
            </motion.div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { icon: BookOpen, label: 'Courses', value: stats.totalCourses, color: 'purple' },
              { icon: Trophy, label: 'Completed', value: stats.coursesCompleted, color: 'green' },
              { icon: FlaskConical, label: 'Research', value: stats.researchProjects, color: 'cyan' },
              { icon: Award, label: 'Certificates', value: stats.certificates, color: 'amber' },
              { icon: TrendingUp, label: 'Hours', value: stats.totalHours, color: 'blue' },
              { icon: Zap, label: 'Streak', value: `${stats.currentStreak}d`, color: 'pink' }
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
                  <Card className={`bg-black/60 border-2 border-${stat.color}-500/40 backdrop-blur-xl`}>
                    <CardContent className="p-4">
                      <Icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
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
          <TabsList className="grid w-full grid-cols-4 bg-black/60 backdrop-blur-xl border border-white/10 mb-8 p-2 rounded-2xl">
            <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-xl py-3">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="research" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 rounded-xl py-3">
              <FlaskConical className="w-4 h-4 mr-2" />
              Research
            </TabsTrigger>
            <TabsTrigger value="lab" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 rounded-xl py-3">
              <Atom className="w-4 h-4 mr-2" />
              Labs
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 rounded-xl py-3">
              <Users className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
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
                    <Card className={`bg-gradient-to-br from-${category.color}-950/80 to-${category.color}-900/60 border-${category.color}-500/40 backdrop-blur-xl cursor-pointer`}>
                      <CardContent className="p-6">
                        <Icon className={`w-12 h-12 text-${category.color}-400 mb-4`} />
                        <h3 className="text-white font-bold text-xl mb-2">{category.title}</h3>
                        <div className="text-gray-400 text-sm">{category.count} courses available</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
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
                    <Card className={`bg-gradient-to-br from-${opportunity.color}-950/80 to-black/60 border-${opportunity.color}-500/40 backdrop-blur-xl`}>
                      <CardContent className="p-6">
                        <Icon className={`w-10 h-10 text-${opportunity.color}-400 mb-4`} />
                        <h3 className="text-white font-bold text-xl mb-2">{opportunity.title}</h3>
                        <p className="text-gray-400 text-sm mb-4">{opportunity.description}</p>
                        <Button className={`w-full bg-${opportunity.color}-600 hover:bg-${opportunity.color}-700`}>
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

          <TabsContent value="community">
            <Card className="bg-black/60 backdrop-blur-xl border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Users className="w-7 h-7 text-orange-400" />
                  Research Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { title: 'Discussion Forums', members: '2.4K', icon: MessageSquare, color: 'purple' },
                    { title: 'Study Groups', members: '847', icon: Users, color: 'blue' },
                    { title: 'Mentorship', members: '156', icon: Target, color: 'green' }
                  ].map((community, idx) => {
                    const Icon = community.icon;
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className={`bg-gradient-to-br from-${community.color}-950/60 to-black/40 border-${community.color}-500/30 cursor-pointer`}>
                          <CardContent className="p-6 text-center">
                            <Icon className={`w-12 h-12 text-${community.color}-400 mb-4 mx-auto`} />
                            <h3 className="text-white font-bold text-lg mb-2">{community.title}</h3>
                            <div className="text-gray-400 text-sm">{community.members} members</div>
                            <Button variant="outline" className="w-full mt-4 border-white/20 text-white">
                              Join
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-blue-900/60 backdrop-blur-xl border-2 border-purple-500/40 rounded-3xl p-12 text-center"
        >
          <Rocket className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">
            Become a Consciousness Engineer
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Master the intersection of neuroscience, quantum mechanics, and artificial intelligence
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Learning
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-purple-400/60 text-purple-200 hover:bg-purple-900/40 px-8 py-6 text-lg">
              <BookOpen className="w-5 h-5 mr-2" />
              Course Catalog
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
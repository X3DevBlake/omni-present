import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { 
  Sparkles, Brain, Zap, TrendingUp, Users, MessageSquare, 
  Activity, Award, Bell, ArrowRight, Mic, Search, Star,
  PlayCircle, Shield, Rocket, Target, ChevronRight
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuroraBackground from '../components/omni/AuroraBackground';
import EcosystemMap3D from '../components/home/EcosystemMap3D';
import ProactiveAIFeed from '../components/home/ProactiveAIFeed';
import EnhancedGeminiHome from '../components/home/EnhancedGeminiHome';

function AnimatedOrb() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#a855f7"
        roughness={0.2}
        metalness={0.8}
        emissive="#a855f7"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

export default function Home() {
  const [userEmail, setUserEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTagline, setCurrentTagline] = useState(0);

  const taglines = [
    "Autonomous AI Agents Working for You",
    "Collaborate. Predict. Automate. Scale.",
    "Your Multi-Agent Intelligence Platform",
    "Where AI Meets Infinite Possibilities",
    "Deploy. Monitor. Optimize. Repeat."
  ];

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));

    const interval = setInterval(() => {
      setCurrentTagline(prev => (prev + 1) % taglines.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const { data: agents = [] } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.list('-created_date', 5),
    enabled: !!userEmail
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ['recent-collaborations'],
    queryFn: () => base44.entities.AgentCollaboration.list('-created_date', 3),
    enabled: !!userEmail
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.PredictiveAnalytic.list('-created_date', 3),
    enabled: !!userEmail
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', userEmail],
    queryFn: () => base44.entities.OmniAchievement.filter({ user_email: userEmail }, '-created_date', 3),
    enabled: !!userEmail
  });

  const quickActions = [
    { label: 'Create Agent', icon: Brain, path: 'AILab', color: 'from-purple-500 to-blue-500' },
    { label: 'View Analytics', icon: TrendingUp, path: 'UnifiedAnalytics', color: 'from-cyan-500 to-blue-500' },
    { label: 'Start Collaboration', icon: Users, path: 'EnhancedCollaborationHub', color: 'from-green-500 to-emerald-500' },
    { label: 'Agent Marketplace', icon: Award, path: 'AgentMarketplace', color: 'from-yellow-500 to-orange-500' }
  ];

  const featuredHubs = [
    { name: 'AI Lab', desc: 'Train & deploy AI agents', path: 'AILab', icon: Brain, color: 'purple' },
    { name: 'Collaboration Hub', desc: 'Multi-agent teamwork', path: 'EnhancedCollaborationHub', icon: Users, color: 'blue' },
    { name: 'Simulation Labs', desc: 'Test in virtual worlds', path: 'SimulationLabs', icon: PlayCircle, color: 'cyan' },
    { name: 'Agent Marketplace', desc: 'Buy & sell agents', path: 'AgentMarketplace', icon: Star, color: 'yellow' },
    { name: 'Analytics Dashboard', desc: 'Deep insights & trends', path: 'UnifiedAnalytics', icon: TrendingUp, color: 'green' },
    { name: 'Omni Banking', desc: 'AI-powered finance', path: 'EnhancedOmniBank', icon: Shield, color: 'pink' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      {/* Proactive AI Feed & Enhanced Gemini */}
      <ProactiveAIFeed />
      <EnhancedGeminiHome />

      {/* 3D Ecosystem Map - Phase 1 */}
      <EcosystemMap3D activeHubs={['agents']} />

      {/* Hero Section with 3D Background - Keep for context */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Canvas Background */}
        <div className="absolute inset-0 opacity-30">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
            <AnimatedOrb />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotateY: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block"
              >
                <Sparkles className="w-24 h-24 text-cyan-400 mx-auto mb-6" />
              </motion.div>
            </div>

            <h1 className="text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Omni</span>
            </h1>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentTagline}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-2xl text-white/80 mb-12 max-w-3xl mx-auto"
              >
                {taglines[currentTagline]}
              </motion.p>
            </AnimatePresence>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              {quickActions.map((action, idx) => (
                <motion.div
                  key={action.path}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link to={createPageUrl(action.path)}>
                    <Button className={`bg-gradient-to-r ${action.color} text-white px-6 py-6 text-lg group`}>
                      <action.icon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      {action.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents, data, documentation..."
                  className="w-full pl-12 pr-16 py-6 bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder-white/50 text-lg rounded-2xl"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-500 hover:bg-cyan-600">
                  <Mic className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronRight className="w-8 h-8 text-white/60 rotate-90" />
        </motion.div>
      </div>

      {/* Dashboard Widgets Section */}
      {userEmail && (
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-8">Your Command Center</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Active Agents Widget */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Active Agents</h3>
                    <p className="text-white/60 text-sm">{agents.length} running</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {agents.slice(0, 3).map(agent => (
                    <div key={agent.id} className="p-3 bg-black/20 rounded flex items-center justify-between">
                      <span className="text-white text-sm">{agent.name}</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                    </div>
                  ))}
                </div>
                <Link to={createPageUrl('AgentManagementHub')}>
                  <Button className="w-full mt-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>

              {/* Collaborations Widget */}
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Collaborations</h3>
                    <p className="text-white/60 text-sm">{collaborations.length} active</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {collaborations.slice(0, 3).map(collab => (
                    <div key={collab.id} className="p-3 bg-black/20 rounded">
                      <p className="text-white text-sm">{collab.task_description?.substring(0, 40)}...</p>
                      <p className="text-white/60 text-xs mt-1">{collab.participating_agents?.length} agents</p>
                    </div>
                  ))}
                </div>
                <Link to={createPageUrl('EnhancedCollaborationHub')}>
                  <Button className="w-full mt-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>

              {/* Proactive Insights Widget */}
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Proactive Insights</h3>
                    <p className="text-white/60 text-sm">{predictions.length} predictions</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {predictions.slice(0, 2).map(pred => (
                    <div key={pred.id} className="p-3 bg-black/20 rounded">
                      <p className="text-white text-sm">{pred.prediction?.substring(0, 50)}...</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/60">{pred.confidence}% confidence</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          pred.prediction_type === 'system_issue' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {pred.prediction_type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to={createPageUrl('AdvancedPredictionCenter')}>
                  <Button className="w-full mt-4 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>

              {/* Recent Activity Widget */}
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Recent Activity</h3>
                    <p className="text-white/60 text-sm">Last 24 hours</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white/80 text-sm">Agent trained successfully</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white/80 text-sm">Collaboration completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-white/80 text-sm">New prediction generated</span>
                  </div>
                </div>
              </Card>

              {/* Gamification Widget */}
              <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-pink-500/20 rounded-lg">
                    <Award className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Achievements</h3>
                    <p className="text-white/60 text-sm">Level {Math.floor(achievements.length / 3) + 1}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {achievements.slice(0, 2).map(achievement => (
                    <div key={achievement.id} className="p-3 bg-black/20 rounded flex items-center gap-3">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-white text-sm">{achievement.achievement_name}</span>
                    </div>
                  ))}
                </div>
                <Link to={createPageUrl('AchievementsAwards')}>
                  <Button className="w-full mt-4 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400">
                    View All <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>

              {/* Notifications Widget */}
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Bell className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Notifications</h3>
                    <p className="text-white/60 text-sm">3 unread</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-black/20 rounded">
                    <p className="text-white text-sm">Agent training completed</p>
                    <p className="text-white/60 text-xs mt-1">2 minutes ago</p>
                  </div>
                  <div className="p-3 bg-black/20 rounded">
                    <p className="text-white text-sm">New collaboration request</p>
                    <p className="text-white/60 text-xs mt-1">1 hour ago</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      )}

      {/* Featured Hubs Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">Explore Hubs</h2>
          <p className="text-white/60 text-lg mb-8">Powerful tools and capabilities at your fingertips</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHubs.map((hub, idx) => (
              <motion.div
                key={hub.path}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={createPageUrl(hub.path)}>
                  <Card className={`bg-gradient-to-br from-${hub.color}-500/10 to-black/20 border-${hub.color}-500/30 p-6 hover:scale-105 transition-transform cursor-pointer group`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 bg-${hub.color}-500/20 rounded-lg group-hover:scale-110 transition-transform`}>
                        <hub.icon className={`w-6 h-6 text-${hub.color}-400`} />
                      </div>
                      <ArrowRight className={`w-5 h-5 text-${hub.color}-400 opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">{hub.name}</h3>
                    <p className="text-white/60 text-sm">{hub.desc}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-3xl p-12 text-center"
        >
          <Rocket className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Deploy Your First Agent?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Create autonomous AI agents that work for you 24/7. Train, deploy, and scale with ease.
          </p>
          <Link to={createPageUrl('AILab')}>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-6 text-lg">
              Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}
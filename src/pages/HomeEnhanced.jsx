import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuroraBackground from '../components/omni/AuroraBackground';
import OmniPresent3DLogo from '../components/home/OmniPresent3DLogo';
import EcosystemGraph3D from '../components/home/EcosystemGraph3D';
import ProfileIcon from '../components/navigation/ProfileIcon';
import { LogIn, UserPlus, Sparkles, Brain, Network, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomeEnhanced() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuthenticated(auth);
      if (auth) {
        base44.auth.me().then(setUser).catch(() => {});
      }
    });
  }, []);

  const { data: ecosystemData } = useQuery({
    queryKey: ['ecosystem-graph'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getEcosystemGraph', { filters: {} });
      return response.data.graph;
    },
    enabled: isAuthenticated,
    refetchInterval: 10000
  });

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  const features = [
    { icon: Brain, title: 'AI-Powered Agents', desc: 'Deploy autonomous agents with advanced learning capabilities' },
    { icon: Network, title: 'Multi-Agent Collaboration', desc: 'Orchestrate complex tasks across agent teams' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Advanced security, compliance, and governance features' },
    { icon: Sparkles, title: 'Predictive Intelligence', desc: 'AI-driven insights and proactive recommendations' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      {/* Header with Profile/Auth */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
        {isAuthenticated && user ? (
          <ProfileIcon />
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={handleLogin}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button
              onClick={handleLogin}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up
            </Button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-6 py-20 space-y-16">
        {/* Hero Section with 3D Logo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          <OmniPresent3DLogo />
          
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-6xl font-bold text-white leading-tight">
              Welcome to <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Omni-Present</span>
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed">
              The world's most advanced AI agent collaboration platform. Deploy, orchestrate, and scale autonomous agents with enterprise-grade security, real-time analytics, and seamless multi-agent coordination.
            </p>

            {!isAuthenticated && (
              <div className="flex justify-center gap-4 pt-6">
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-lg px-8 py-6"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
                <Button
                  onClick={handleLogin}
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md text-lg px-8 py-6"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all h-full">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-cyan-600 to-purple-600 rounded-full flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Ecosystem Visualizer */}
        {ecosystemData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold text-white">Live AI Ecosystem</h2>
              <p className="text-white/70">Real-time visualization of your agent network</p>
            </div>
            <EcosystemGraph3D graphData={ecosystemData} />
          </motion.div>
        )}

        {/* CTA Section */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center py-16"
          >
            <Card className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-cyan-400/50 backdrop-blur-md max-w-2xl mx-auto">
              <CardContent className="p-12 space-y-6">
                <h2 className="text-3xl font-bold text-white">
                  Ready to Build the Future?
                </h2>
                <p className="text-white/80 text-lg">
                  Join thousands of developers and enterprises using Omni-Present to power their AI agent infrastructure.
                </p>
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-lg px-12 py-6"
                >
                  Start Building Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AuroraBackground>
  );
}
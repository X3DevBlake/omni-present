import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Users, Target, Heart, Award, Globe, Rocket, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuroraBackground from '../components/omni/AuroraBackground';
import Immersive3DAbout from '../components/3d/Immersive3DAbout';

export default function About() {
  const values = [
    { icon: Sparkles, title: 'Innovation', description: 'Pushing boundaries of AI and holographic technology' },
    { icon: Users, title: 'Collaboration', description: 'Building together with our community' },
    { icon: Target, title: 'Excellence', description: 'Delivering world-class AI infrastructure' },
    { icon: Heart, title: 'Integrity', description: 'Operating with transparency and trust' }
  ];

  const milestones = [
    { year: '2024', title: 'Foundation', description: 'Blueprint platform launched' },
    { year: '2025', title: 'Innovation', description: 'Holographic AI agents introduced' },
    { year: '2026', title: 'Expansion', description: 'Global adoption & advanced features' },
    { year: 'Future', title: 'Revolution', description: 'Autonomous agent societies' }
  ];

  const team = [
    { name: 'Alex Rivera', role: 'CEO & Founder', avatar: '👨‍💻' },
    { name: 'Sarah Chen', role: 'CTO', avatar: '👩‍🔬' },
    { name: 'Marcus Johnson', role: 'Head of AI Research', avatar: '👨‍🎓' },
    { name: 'Emma Davis', role: 'Lead Designer', avatar: '👩‍🎨' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        {/* 3D Hero */}
        <Immersive3DAbout />
        
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">About Us</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Building the Future of
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> AI Infrastructure</span>
          </h1>
          
          <p className="text-white/60 text-lg sm:text-xl max-w-3xl mx-auto mb-8">
            We're on a mission to democratize advanced AI technology through holographic agents, 
            intelligent blueprints, and autonomous systems that empower everyone to build smarter.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div 
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Our Mission</h2>
              <p className="text-white/70 text-lg leading-relaxed">
                To empower developers, researchers, and innovators worldwide with cutting-edge AI infrastructure 
                that's intuitive, powerful, and accessible. We believe in a future where anyone can harness 
                the power of autonomous AI agents to solve complex problems, create immersive experiences, 
                and push the boundaries of what's possible.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Core Values */}
        <div className="mb-20">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Our Core Values</h2>
            <p className="text-white/60">Principles that guide everything we do</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-white/60 text-sm">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Our Journey</h2>
            <p className="text-white/60">Key milestones in our evolution</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-cyan-500/50 to-transparent" />
            
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className="relative mb-12 flex items-center"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 order-2'}`}>
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
                    <div className="text-cyan-400 font-bold text-2xl mb-2">{milestone.year}</div>
                    <div className="text-white font-semibold text-lg mb-2">{milestone.title}</div>
                    <div className="text-white/60 text-sm">{milestone.description}</div>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border-4 border-black" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-white/60">The minds behind the innovation</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-cyan-500/30 transition-all"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h3 className="text-white font-semibold text-lg mb-1">{member.name}</h3>
                <p className="text-cyan-400 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <motion.div 
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-3xl p-8 sm:p-12 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-white/60 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-white/60 text-sm">AI Agents Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-white/60 text-sm">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-white/60 text-sm">Uptime</div>
            </div>
          </div>
        </motion.div>

        {/* Vision Section */}
        <motion.div 
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Our Vision for the Future</h2>
              <p className="text-white/70 text-lg leading-relaxed mb-4">
                We envision a world where autonomous AI agents seamlessly collaborate with humans to solve complex problems. 
                Our platform enables agents to learn, grow, and innovate independently while remaining aligned with human values. 
                By 2030, we aim to power 1 million autonomous agent societies solving real-world challenges across industries.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-cyan-400 font-bold text-lg">1M+</p>
                  <p className="text-white/60 text-xs">Agent Societies by 2030</p>
                </div>
                <div>
                  <p className="text-cyan-400 font-bold text-lg">50+</p>
                  <p className="text-white/60 text-xs">Industry Applications</p>
                </div>
                <div>
                  <p className="text-cyan-400 font-bold text-lg">∞</p>
                  <p className="text-white/60 text-xs">Possibilities</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Innovation Focus */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white mb-6">Innovation Focus Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Autonomous Decision Making', desc: 'Agents that think, learn, and act independently' },
              { title: 'Knowledge Synthesis', desc: 'Cross-agent intelligence and collaborative insights' },
              { title: '3D Immersive Environments', desc: 'Fully interactive 3D simulation worlds' },
              { title: 'Advanced Memory Systems', desc: 'Persistent, intelligent memory with proactive recall' },
              { title: 'Skill Evolution', desc: 'Agents learning new capabilities through experience' },
              { title: 'Collaborative Networks', desc: 'Agent teams solving complex multi-stage problems' }
            ].map((area, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all"
              >
                <h3 className="text-white font-bold mb-2">{area.title}</h3>
                <p className="text-white/60 text-sm">{area.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div 
          className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Join Us in Building the Future</h2>
          <p className="text-white/70 text-lg mb-6 max-w-2xl mx-auto">
            Whether you're a developer, researcher, or innovator, there's a place for you in our community. 
            Help us push the boundaries of what's possible with AI.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg font-semibold hover:bg-cyan-500/30 transition-all"
            >
              Get Started
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg font-semibold hover:bg-purple-500/30 transition-all"
            >
              Contact Us
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}
import React, { useEffect, useState, useRef, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Brain, Atom, Network, Zap, ArrowRight, Cpu, Radio, Sparkles, Eye, Activity,
  Shield, TrendingUp, Globe, Rocket, Code, Bot, Layers, Users, Wallet,
  FlaskConical, Boxes, Webhook, BarChart3, Database, GitBranch, Search,
  Play, ChevronRight, ExternalLink, Star
} from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float, MeshDistortMaterial, Text, Sparkles as Sparkles3D } from '@react-three/drei';
import * as THREE from 'three';
import { FourDCanvas, Tesseract, FourDParticleField } from '@/components/4d/FourDEngine';
import OmniLogo4D from '@/components/4d/OmniLogo4D';
import Earth4D from '@/components/4d/Earth4D';
import FourDGraph from '@/components/4d/FourDGraph';
import { OmniPresentLogoSVG, TesseractIcon, EarthIcon, NeuralIcon, WebhookIcon, AgentIcon, DimensionGateIcon } from '@/components/svg/OmniIcons';
import { globalNetworkNodes, globalConnections, generate4DDataset, mockAgentFleet } from '@/data/openSourceData';

// Hero section with 4D logo
function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* 4D Logo Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <FourDCanvas cameraPosition={[0, 0, 6]} showStars>
            <OmniLogo4D scale={1.2} />
            <FourDParticleField count={300} radius={5} speed={0.1} />
          </FourDCanvas>
        </Suspense>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Badge variant="outline" className="border-purple-500/30 text-purple-400 mb-6 pointer-events-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            4D Intelligence Ecosystem
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-6"
        >
          <span className="gradient-text-omni">OMNI</span>
          <span className="text-white">-PRESENT</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          The world's first 4-dimensional AI ecosystem. Orchestrate autonomous agents,
          visualize data across dimensions, and command intelligence at scale.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex items-center justify-center gap-4 pointer-events-auto"
        >
          <Link to={createPageUrl('DashboardHome')}>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-6 text-lg glow-purple">
              Launch Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to={createPageUrl('OmniNavigationHub')}>
            <Button size="lg" variant="outline" className="border-white/10 text-white/70 hover:text-white hover:border-white/30 px-8 py-6 text-lg">
              Explore Hubs
              <Globe className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-white/20 uppercase tracking-widest">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border border-white/10 rounded-full flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-white/30 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Feature cards section
const features = [
  {
    icon: TesseractIcon,
    title: '4D Visualization',
    description: 'Project data across 4 dimensions with real-time tesseract rendering and hypercube navigation.',
    color: 'from-purple-500/20 to-purple-900/20',
    borderColor: 'border-purple-500/20',
    path: 'DashboardHome',
  },
  {
    icon: EarthIcon,
    title: 'Global Earth Network',
    description: 'Real-time 3D globe showing agent deployments, data flows, and network nodes worldwide.',
    color: 'from-cyan-500/20 to-cyan-900/20',
    borderColor: 'border-cyan-500/20',
    path: 'GlobalMap',
  },
  {
    icon: AgentIcon,
    title: 'AI Agent Swarms',
    description: 'Deploy, train, and orchestrate autonomous agent fleets with emergent behavior modeling.',
    color: 'from-pink-500/20 to-pink-900/20',
    borderColor: 'border-pink-500/20',
    path: 'AgentCollaborationHub',
  },
  {
    icon: WebhookIcon,
    title: 'Webhook Orchestration',
    description: 'Real-time event-driven automation with visual flow debugging and 4D pipeline monitoring.',
    color: 'from-orange-500/20 to-orange-900/20',
    borderColor: 'border-orange-500/20',
    path: 'Webhooks',
  },
  {
    icon: NeuralIcon,
    title: 'Neural Networks',
    description: 'Train, deploy, and visualize deep learning models with interactive architecture builders.',
    color: 'from-emerald-500/20 to-emerald-900/20',
    borderColor: 'border-emerald-500/20',
    path: 'AILab',
  },
  {
    icon: DimensionGateIcon,
    title: 'Simulation Engine',
    description: 'Multi-dimensional simulation environments for agent behavior, markets, and physics.',
    color: 'from-violet-500/20 to-violet-900/20',
    borderColor: 'border-violet-500/20',
    path: 'SimulationHub',
  },
];

function FeaturesSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Beyond <span className="gradient-text-cosmic">Three Dimensions</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Every component, every visualization, every interaction designed for the 4th dimension.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={createPageUrl(feature.path)}>
                <Card className={`bg-gradient-to-br ${feature.color} ${feature.borderColor} border hover:scale-[1.02] transition-all duration-300 cursor-pointer group h-full`}>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <feature.icon size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs text-white/20 group-hover:text-purple-400 transition-colors">
                      Explore <ChevronRight className="w-3 h-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Live Earth + 4D Graph section
function LiveVisualizationSection() {
  const data4D = useMemo(() => generate4DDataset(120, 'simulation'), []);

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Live <span className="gradient-text-omni">4D Visualizations</span>
          </h2>
          <p className="text-white/40">Real-time data rendered across four dimensions</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Earth */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-black/40 border-white/[0.06] overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Global Agent Network
                  </CardTitle>
                  <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-xs gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="h-80 canvas-4d">
                  <Suspense fallback={<div className="h-full bg-black/40 animate-pulse rounded-lg" />}>
                    <FourDCanvas cameraPosition={[0, 1, 3.5]} showStars>
                      <Earth4D
                        markers={globalNetworkNodes}
                        connections={globalConnections}
                        radius={1.3}
                        rotateSpeed={0.08}
                        continentColor="#22d3ee"
                      />
                    </FourDCanvas>
                  </Suspense>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 4D Graph */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-black/40 border-white/[0.06] overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-purple-400" />
                    4D Simulation Data
                  </CardTitle>
                  <Badge variant="outline" className="border-purple-500/20 text-purple-400 text-xs">
                    {data4D.length} data points
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="h-80 canvas-4d">
                  <Suspense fallback={<div className="h-full bg-black/40 animate-pulse rounded-lg" />}>
                    <FourDCanvas cameraPosition={[0, 0, 6]}>
                      <FourDGraph data={data4D} showAxes showConnections autoRotateW rotateSpeed={0.2} />
                    </FourDCanvas>
                  </Suspense>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Hub navigation cards
const hubCategories = [
  { name: 'Intelligence & AI', icon: Brain, hubs: ['AILab', 'AIAnalyticsHub', 'AITrainingAcademy'], color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { name: 'Agent Systems', icon: Bot, hubs: ['AgentCollaborationHub', 'AgentMarketplace', 'AgentTrainingCenter'], color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { name: 'DeFi & Markets', icon: Wallet, hubs: ['AdvancedDeFiHub', 'CryptoTradingHub', 'OmniBankingHub'], color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { name: 'Simulation', icon: Rocket, hubs: ['SimulationHub', 'SandboxHub', 'AdvancedSimulation'], color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { name: 'Network & Comms', icon: Radio, hubs: ['RedCommHub', 'CommunicationsHub', 'EnhancedCommunications'], color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { name: 'Developer Tools', icon: Code, hubs: ['DeveloperPortal', 'APIExplorer', 'CodeEditor'], color: 'text-violet-400', bg: 'bg-violet-500/10' },
];

function HubsSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            600+ <span className="gradient-text-cosmic">Ecosystem Hubs</span>
          </h2>
          <p className="text-white/40">Every domain. Every capability. One platform.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubCategories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="bg-black/30 border-white/[0.06] hover:border-white/15 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${cat.bg} border border-white/5`}>
                      <cat.icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <h3 className="text-white font-semibold">{cat.name}</h3>
                  </div>
                  <div className="space-y-1.5">
                    {cat.hubs.map(hub => (
                      <Link key={hub} to={createPageUrl(hub)}>
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group">
                          <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">{hub.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link to={createPageUrl('OmniNavigationHub')}>
            <Button variant="outline" className="border-white/10 text-white/50 hover:text-white">
              Browse All 600+ Hubs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Stats banner
function StatsSection() {
  const stats = [
    { value: '600+', label: 'System Hubs', icon: Layers },
    { value: '8', label: 'AI Agents Active', icon: Bot },
    { value: '12', label: 'Global Nodes', icon: Globe },
    { value: '4D', label: 'Visualizations', icon: Boxes },
    { value: '965', label: 'Backend Functions', icon: Code },
    { value: '∞', label: 'Possibilities', icon: Atom },
  ];

  return (
    <section className="py-16 border-y border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center"
            >
              <stat.icon className="w-5 h-5 text-purple-400/40 mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold gradient-text-omni">{stat.value}</div>
              <div className="text-xs text-white/30 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Open Data Sources section
function DataSourcesSection() {
  const sources = [
    { name: 'World Bank', desc: 'Global development data', icon: Globe },
    { name: 'NASA NEO', desc: 'Near-Earth objects', icon: Atom },
    { name: 'USGS Earthquakes', desc: 'Seismic activity', icon: Activity },
    { name: 'CoinGecko', desc: 'Crypto market data', icon: TrendingUp },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            Open Source <span className="gradient-text-cosmic">Data Integration</span>
          </h2>
          <p className="text-white/40">Connected to the world's data through open APIs</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sources.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="bg-black/30 border-white/[0.06] text-center p-4 hover:border-purple-500/20 transition-all">
                <src.icon className="w-8 h-8 text-purple-400/50 mx-auto mb-3" />
                <div className="text-sm font-medium text-white">{src.name}</div>
                <div className="text-[10px] text-white/30 mt-1">{src.desc}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main Home Page
export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <LiveVisualizationSection />
      <HubsSection />
      <DataSourcesSection />

      {/* Footer CTA */}
      <section className="py-24 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <OmniPresentLogoSVG size={60} animated className="mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to enter the <span className="gradient-text-omni">4th dimension</span>?
          </h2>
          <p className="text-white/40 mb-8 max-w-md mx-auto">
            Your AI ecosystem awaits. Deploy agents, visualize data, and orchestrate intelligence.
          </p>
          <Link to={createPageUrl('DashboardHome')}>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold px-10 py-6 text-lg glow-purple">
              Enter Omni-Present
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

function AgentVisualization({ type, color }) {
  const meshRef = useRef();

  const getGeometry = () => {
    const geometries = [
      <torusKnotGeometry key="tk" args={[1, 0.3, 100, 16]} />,
      <dodecahedronGeometry key="dd" args={[1, 0]} />,
      <octahedronGeometry key="od" args={[1, 0]} />,
      <icosahedronGeometry key="id" args={[1, 0]} />,
      <tetrahedronGeometry key="td" args={[1, 0]} />,
      <torusGeometry key="tg" args={[1, 0.3, 16, 100]} />,
      <sphereGeometry key="sg" args={[1, 32, 32]} />,
      <boxGeometry key="bg" args={[1, 1, 1]} />,
    ];
    return geometries[type.charCodeAt(0) % geometries.length];
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

const agents100 = [
  // Original 40 agents
  { name: 'Luna - Financial Analyst', type: 'financial', color: '#00f5ff', icon: '💼', description: 'Market analysis & portfolio review' },
  { name: 'Atlas - Research Agent', type: 'research', color: '#a855f7', icon: '🔍', description: 'Data collection & synthesis' },
  { name: 'Nova - Travel Planner', type: 'travel', color: '#ec4899', icon: '✈️', description: 'Route planning & itineraries' },
  { name: 'Echo - Shopping Assistant', type: 'shopping', color: '#10b981', icon: '🛍️', description: 'Product search & comparison' },
  { name: 'Apex - Trading Bot', type: 'trading', color: '#f59e0b', icon: '📈', description: 'Order execution & timing' },
  { name: 'Sage - Portfolio Manager', type: 'portfolio', color: '#06b6d4', icon: '🎯', description: 'Asset allocation & rebalancing' },
  { name: 'Prism - Market Analyst', type: 'market', color: '#8b5cf6', icon: '📊', description: 'Trend analysis & forecasting' },
  { name: 'Helix - Data Scientist', type: 'data', color: '#3b82f6', icon: '🧬', description: 'ML & data processing' },
  { name: 'Sentinel - Risk Manager', type: 'risk', color: '#ef4444', icon: '🛡️', description: 'Risk analysis & compliance' },
  { name: 'Nexus - Supply Chain', type: 'supply', color: '#14b8a6', icon: '📦', description: 'Logistics & coordination' },
  { name: 'Harmony - Customer Service', type: 'customer', color: '#ec4899', icon: '💬', description: 'Issue resolution & support' },
  { name: 'Genesis - Content Creator', type: 'content', color: '#f97316', icon: '✨', description: 'Content generation & creativity' },
  { name: 'Codex - Code Review', type: 'code', color: '#06b6d4', icon: '💻', description: 'Quality assurance & optimization' },
  { name: 'Cipher - System Admin', type: 'system', color: '#6366f1', icon: '⚙️', description: 'Infrastructure & security' },
  { name: 'Iris - Learning Coach', type: 'learning', color: '#fbbf24', icon: '🎓', description: 'Skill development & mentorship' },
  { name: 'Vex - Legal Advisor', type: 'legal', color: '#dc2626', icon: '⚖️', description: 'Contract review & legal guidance' },
  { name: 'Pulse - Healthcare Agent', type: 'healthcare', color: '#ef4444', icon: '🏥', description: 'Health monitoring & recommendations' },
  { name: 'Spectrum - Brand Manager', type: 'branding', color: '#ec4899', icon: '🎨', description: 'Brand strategy & identity' },
  { name: 'Forge - Manufacturing Agent', type: 'manufacturing', color: '#92400e', icon: '🏭', description: 'Production optimization & quality' },
  { name: 'Volt - Energy Optimizer', type: 'energy', color: '#fbbf24', icon: '⚡', description: 'Power management & efficiency' },
  { name: 'Echo Prime - Media Director', type: 'media', color: '#8b5cf6', icon: '📺', description: 'Content distribution & channels' },
  { name: 'Atlas Prime - Architect', type: 'architecture', color: '#3b82f6', icon: '🏗️', description: 'System design & planning' },
  { name: 'Summit - Negotiator', type: 'negotiation', color: '#f59e0b', icon: '🤝', description: 'Deal making & contracts' },
  { name: 'Zephyr - Weather Agent', type: 'environmental', color: '#06b6d4', icon: '🌤️', description: 'Environmental monitoring' },
  { name: 'Phantom - Cybersecurity', type: 'security', color: '#991b1b', icon: '🔐', description: 'Threat detection & prevention' },
  { name: 'Vector - Logistics Planner', type: 'logistics', color: '#059669', icon: '🚚', description: 'Route optimization & delivery' },
  { name: 'Aurora - HR Specialist', type: 'hr', color: '#ec4899', icon: '👥', description: 'Recruiting & talent management' },
  { name: 'Oracle - Prediction Agent', type: 'prediction', color: '#7c3aed', icon: '🔮', description: 'Forecasting & trends' },
  { name: 'Mercury - Communication Hub', type: 'communication', color: '#06b6d4', icon: '💫', description: 'Message routing & translation' },
  { name: 'Tesla - Energy Trader', type: 'energy_trade', color: '#fbbf24', icon: '⚡', description: 'Energy market optimization' },
  { name: 'Phoenix - Recovery Agent', type: 'recovery', color: '#f97316', icon: '🔥', description: 'Disaster recovery & backup' },
  { name: 'Sage Prime - Quality Manager', type: 'quality', color: '#10b981', icon: '✅', description: 'QA & process improvement' },
  { name: 'Nova Prime - Event Planner', type: 'events', color: '#ec4899', icon: '🎉', description: 'Event coordination & logistics' },
  { name: 'Titan - Infrastructure', type: 'infrastructure', color: '#6366f1', icon: '🌐', description: 'Network & resource management' },
  { name: 'Lyra - Music Agent', type: 'entertainment', color: '#a855f7', icon: '🎵', description: 'Audio production & mixing' },
  { name: 'Vortex - Performance Tuner', type: 'optimization', color: '#f59e0b', icon: '⚙️', description: 'System performance optimization' },
  { name: 'Beacon - Analytics Expert', type: 'analytics', color: '#06b6d4', icon: '📈', description: 'Deep analytics & insights' },
  { name: 'Quantum - Processor', type: 'computing', color: '#3b82f6', icon: '💾', description: 'Advanced computation & modeling' },
  { name: 'Drift - Social Manager', type: 'social', color: '#ec4899', icon: '📱', description: 'Social media & community' },
  { name: 'Vertex - Geometry Specialist', type: 'design', color: '#8b5cf6', icon: '📐', description: 'Design & spatial optimization' },
  // New 60 agents
  { name: 'Apex Prime - Executive Coach', type: 'executive', color: '#fbbf24', icon: '🎯', description: 'Leadership & strategy execution' },
  { name: 'Cascade - Workflow Automator', type: 'automation', color: '#06b6d4', icon: '⚙️', description: 'Workflow automation & design' },
  { name: 'Horizon - Vision Planner', type: 'planning', color: '#a855f7', icon: '🔭', description: 'Strategic planning & goals' },
  { name: 'Zenith - Peak Performance', type: 'performance', color: '#fbbf24', icon: '📈', description: 'Excellence & benchmarking' },
  { name: 'Praxis - Implementation Specialist', type: 'implementation', color: '#10b981', icon: '✓', description: 'Project execution & change' },
  { name: 'Nexus Prime - Network Coordinator', type: 'networking', color: '#ec4899', icon: '🔗', description: 'Partnership development' },
  { name: 'Synergy - Team Collaborator', type: 'collaboration', color: '#06b6d4', icon: '👥', description: 'Team coordination & synergy' },
  { name: 'Pulse Prime - Vital Monitor', type: 'monitoring', color: '#ef4444', icon: '💓', description: 'Real-time vital monitoring' },
  { name: 'Lumina - Innovation Scout', type: 'innovation', color: '#fbbf24', icon: '💡', description: 'Innovation & trend discovery' },
  { name: 'Axiom - Core Value Keeper', type: 'values', color: '#a855f7', icon: '⭐', description: 'Values & culture alignment' },
  { name: 'Epoch - Time Manager', type: 'time', color: '#06b6d4', icon: '⏰', description: 'Schedule & timeline management' },
  { name: 'Catalyst - Change Agent', type: 'change', color: '#f97316', icon: '🔄', description: 'Transformation & innovation' },
  { name: 'Virtue - Ethics Guardian', type: 'ethics', color: '#10b981', icon: '✨', description: 'Ethical analysis & compliance' },
  { name: 'Sentinel Prime - Advanced Security', type: 'advanced_security', color: '#991b1b', icon: '🔒', description: 'Advanced threat analysis' },
  { name: 'Equilibrium - Balance Manager', type: 'balance', color: '#06b6d4', icon: '⚖️', description: 'Workload & resource balancing' },
  { name: 'Velocity - Speed Optimizer', type: 'speed', color: '#f59e0b', icon: '⚡', description: 'Process acceleration' },
  { name: 'Clarity - Communication Expert', type: 'comms', color: '#ec4899', icon: '💬', description: 'Message clarity & docs' },
  { name: 'Compass - Direction Guide', type: 'guidance', color: '#06b6d4', icon: '🧭', description: 'Goal alignment & navigation' },
  { name: 'Arbor - Growth Cultivator', type: 'growth', color: '#10b981', icon: '🌱', description: 'Growth nurturing' },
  { name: 'Echo Domain - Ecosystem Manager', type: 'ecosystem', color: '#8b5cf6', icon: '🌐', description: 'Platform ecosystem design' },
  { name: 'Flux - Adaptability Master', type: 'adaptability', color: '#f59e0b', icon: '🔄', description: 'Rapid adaptation & flexibility' },
  { name: 'Gemini - Dual Perspective', type: 'perspective', color: '#06b6d4', icon: '👁️', description: 'Dual analysis & comparison' },
  { name: 'Helix Prime - Advanced Biology', type: 'biological', color: '#10b981', icon: '🧬', description: 'Genetic algorithms' },
  { name: 'Iris Prime - Advanced Coaching', type: 'advanced_coaching', color: '#fbbf24', icon: '🏆', description: 'Personalized development' },
  { name: 'Janus - Perspective Shifter', type: 'philosophy', color: '#a855f7', icon: '🔀', description: 'Multi-perspective analysis' },
  { name: 'Kinetic - Motion Optimizer', type: 'kinetics', color: '#f59e0b', icon: '💫', description: 'Workflow acceleration' },
  { name: 'Lumen - Insight Illuminator', type: 'insights', color: '#fbbf24', icon: '💡', description: 'Pattern visualization' },
  { name: 'Meridian - Path Finder', type: 'pathfinding', color: '#06b6d4', icon: '🛤️', description: 'Optimal routing discovery' },
  { name: 'Nimbus - Cloud Specialist', type: 'cloud', color: '#8b5cf6', icon: '☁️', description: 'Cloud architecture' },
  { name: 'Orbit - Circular Thinker', type: 'circular', color: '#10b981', icon: '🔁', description: 'Cyclic planning' },
  { name: 'Pinnacle - Excellence Achiever', type: 'excellence', color: '#fbbf24', icon: '🏅', description: 'Excellence pursuit' },
  { name: 'Quantum Prime - Quantum Computing', type: 'quantum', color: '#a855f7', icon: '⚛️', description: 'Quantum algorithms' },
  { name: 'Radiance - Positivity Spreader', type: 'positivity', color: '#ec4899', icon: '✨', description: 'Motivation & culture' },
  { name: 'Sigma - Statistical Master', type: 'statistics', color: '#3b82f6', icon: '📊', description: 'Statistical analysis' },
  { name: 'Traverse - Cross Domain Expert', type: 'crossdomain', color: '#06b6d4', icon: '🌉', description: 'Cross-domain integration' },
  { name: 'Umbra - Shadow Analyzer', type: 'shadow', color: '#6366f1', icon: '🌑', description: 'Hidden pattern detection' },
  { name: 'Vanguard - Pioneer Agent', type: 'pioneer', color: '#f59e0b', icon: '🚀', description: 'Frontier exploration' },
  { name: 'Wavelength - Resonance Finder', type: 'resonance', color: '#ec4899', icon: '〰️', description: 'Harmony creation' },
  { name: 'Xenith - Extreme Specialist', type: 'extreme', color: '#ef4444', icon: '⚠️', description: 'Edge case management' },
  { name: 'Yara - Pattern Weaver', type: 'pattern', color: '#a855f7', icon: '🧵', description: 'Pattern creation' },
  { name: 'Zeta - Final Stage Expert', type: 'finalization', color: '#10b981', icon: '🎬', description: 'Launch execution' },
  { name: 'Alpha - Leader Pioneer', type: 'leadership', color: '#f59e0b', icon: '👑', description: 'Leadership & pioneering' },
  { name: 'Beta - Testing Specialist', type: 'testing', color: '#06b6d4', icon: '🧪', description: 'Quality validation' },
  { name: 'Gamma - Energy Radiator', type: 'energy_mgmt', color: '#fbbf24', icon: '☀️', description: 'Energy empowerment' },
  { name: 'Delta - Change Measurement', type: 'measurement', color: '#3b82f6', icon: '📏', description: 'Impact measurement' },
  { name: 'Epsilon - Small Details Expert', type: 'details', color: '#ec4899', icon: '🔍', description: 'Precision refinement' },
  { name: 'Zeta Prime - Completion Master', type: 'completion', color: '#10b981', icon: '✓', description: 'Project completion' },
  { name: 'Eta - Time Sequencer', type: 'sequencing', color: '#06b6d4', icon: '⏳', description: 'Timeline creation' },
  { name: 'Theta - Pattern Expert', type: 'theta', color: '#a855f7', icon: '🌀', description: 'Pattern recognition' },
  { name: 'Iota - Smallest Unit Master', type: 'granular', color: '#f59e0b', icon: '⚛️', description: 'Granular analysis' },
  { name: 'Kappa - Community Builder', type: 'community', color: '#ec4899', icon: '🏘️', description: 'Community development' },
  { name: 'Lambda - Transformation Catalyst', type: 'transformation', color: '#10b981', icon: '🦋', description: 'Evolution acceleration' },
  { name: 'Mu - Mutation Specialist', type: 'mutation', color: '#8b5cf6', icon: '🧬', description: 'Rapid evolution' },
  { name: 'Nu - New Beginnings', type: 'renewal', color: '#fbbf24', icon: '🌅', description: 'Fresh start facilitation' },
  { name: 'Xi - Hidden Potential', type: 'potential', color: '#06b6d4', icon: '🎁', description: 'Latent activation' },
  { name: 'Omicron - Smallest Element', type: 'elemental', color: '#a855f7', icon: '●', description: 'Elemental breakdown' },
  { name: 'Pi - Circular Calculator', type: 'calculation', color: '#3b82f6', icon: '∏', description: 'Mathematical optimization' },
  { name: 'Rho - Flow Optimizer', type: 'flow', color: '#ec4899', icon: '↬', description: 'Flow optimization' },
  { name: 'Tau - Cycle Expert', type: 'cycles', color: '#10b981', icon: '◉', description: 'Cycle management' },
  { name: 'Upsilon - Growth Trajectory', type: 'trajectory', color: '#fbbf24', icon: '📈', description: 'Growth tracking' },
  { name: 'Phi - Golden Ratio Master', type: 'aesthetics', color: '#06b6d4', icon: '✨', description: 'Aesthetic optimization' },
  { name: 'Chi - Energy Channeler', type: 'channeling', color: '#8b5cf6', icon: '⚡', description: 'Energy flow balance' },
  { name: 'Psi - Mind Power Enhancer', type: 'cognition', color: '#f59e0b', icon: '🧠', description: 'Cognitive enhancement' },
  { name: 'Omega - Cycle Closer', type: 'closure', color: '#ec4899', icon: '◎', description: 'Cycle completion' },
];

export default function Agent100TypesGrid({ onAgentSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = agents100.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          100 Distinct AI Agent Types
        </h2>
        <p className="text-white/60 text-lg mb-6">Master your goals with our comprehensive agent ecosystem</p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <p className="text-white/50 text-sm">Showing {filtered.length} of {agents100.length} agents</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((agent, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onAgentSelect?.(agent)}
            className="cursor-pointer group"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all duration-300 h-full flex flex-col">
              {/* 3D Visualization */}
              <div className="h-32 w-full bg-gradient-to-b from-white/5 to-black/50">
                <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
                  <ambientLight intensity={0.4} />
                  <pointLight position={[5, 5, 5]} intensity={0.8} color={agent.color} />
                  <AgentVisualization type={agent.type} color={agent.color} />
                  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={3} />
                </Canvas>
              </div>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{agent.icon}</span>
                  <h3 className="font-bold text-white text-xs line-clamp-1">{agent.name.split(' - ')[0]}</h3>
                </div>
                <p className="text-white/60 text-xs line-clamp-2 mb-2">{agent.description}</p>
                
                {/* Status Indicator */}
                <div className="flex items-center gap-1 mt-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-white/50">Ready</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
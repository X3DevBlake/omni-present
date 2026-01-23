// Central registry for all hubs in the application
// This allows autonomous agents to understand the app structure

export const HubRegistry = [
  // Core & Omni-Presence
  { id: 'home', name: 'Home', path: 'Home', category: 'core', icon3d: 'galaxy', color: '#00f5ff' },
  { id: 'omnipresence', name: 'Omni-Presence', path: 'OmniPresenceControlCenter', category: 'core', icon3d: 'hologram', color: '#00f5ff' },
  { id: 'omega-sentient', name: 'Omega Sentient Hub', path: 'OmegaSentientHub', category: 'core', icon3d: 'brain', color: '#ec4899' },
  { id: 'omega-financial', name: 'Omega Financial Hub', path: 'OmegaFinancialHub', category: 'financial', icon3d: 'coins', color: '#10b981' },
  { id: 'agent-learning', name: 'Agent Learning Hub', path: 'AgentLearningHub', category: 'ai', icon3d: 'brain', color: '#8b5cf6' },
  { id: 'physical-augmentation', name: 'Physical Augmentation Hub', path: 'PhysicalAugmentationHub', category: 'core', icon3d: 'user', color: '#f59e0b' },
  { id: 'augmentation-design', name: 'Augmentation Design Hub', path: 'AugmentationDesignHub', category: 'core', icon3d: 'cpu', color: '#a855f7' },
  { id: 'physical-embodiment', name: 'Physical Embodiment Hub', path: 'PhysicalEmbodimentHub', category: 'core', icon3d: 'bot', color: '#06b6d4' },
  
  // Financial & Banking
  { id: 'dashboard', name: 'Dashboard', path: 'EnhancedDashboard', category: 'financial', icon3d: 'metrics', color: '#a855f7' },
  { id: 'omnibank', name: 'OmniBank', path: 'EnhancedOmniBank', category: 'financial', icon3d: 'bank', color: '#10b981' },
  { id: 'trading', name: 'Trading Hub', path: 'AutomatedTradingDashboard', category: 'financial', icon3d: 'charts', color: '#3b82f6' },
  { id: 'defi', name: 'DeFi Hub', path: 'EnhancedDeFiHub', category: 'financial', icon3d: 'blockchain', color: '#8b5cf6' },
  { id: 'crypto', name: 'Crypto Trading', path: 'CryptoTradingHub', category: 'financial', icon3d: 'coins', color: '#f59e0b' },
  { id: 'loans', name: 'Loans & Credit', path: 'LoansAndCredit', category: 'financial', icon3d: 'document', color: '#ec4899' },
  { id: 'budget', name: 'Budgeting', path: 'BudgetingForecast', category: 'financial', icon3d: 'calculator', color: '#14b8a6' },
  
  // AI & Agent Management
  { id: 'ailab', name: 'AI Lab', path: 'AILab', category: 'ai', icon3d: 'brain', color: '#a855f7' },
  { id: 'mistral', name: 'Mistral AI Hub', path: 'MistralHub', category: 'ai', icon3d: 'neural', color: '#6366f1' },
  { id: 'agents', name: 'Agent Management', path: 'AgentManagementHub', category: 'ai', icon3d: 'robot', color: '#ec4899' },
  { id: 'collaboration', name: 'Collaboration Hub', path: 'EnhancedCollaborationHub', category: 'ai', icon3d: 'network', color: '#14b8a6' },
  { id: 'training', name: 'Agent Training', path: 'AgentTrainingCenter', category: 'ai', icon3d: 'academy', color: '#f59e0b' },
  { id: 'marketplace', name: 'Agent Marketplace', path: 'AgentMarketplace', category: 'ai', icon3d: 'store', color: '#8b5cf6' },
  
  // Simulation & Testing
  { id: 'simulation', name: 'Simulation Labs', path: 'SimulationLabs', category: 'simulation', icon3d: 'cube', color: '#06b6d4' },
  { id: 'sandbox', name: 'Sandbox Hub', path: 'SandboxHub', category: 'simulation', icon3d: 'box', color: '#84cc16' },
  { id: 'blueprint', name: 'Blueprint Studio', path: 'Blueprint', category: 'simulation', icon3d: 'blueprint', color: '#0ea5e9' },
  { id: 'world', name: 'World Simulation', path: 'World', category: 'simulation', icon3d: 'globe', color: '#22c55e' },
  
  // Analytics & Insights
  { id: 'analytics', name: 'Unified Analytics', path: 'UnifiedAnalytics', category: 'analytics', icon3d: 'graph', color: '#3b82f6' },
  { id: 'predictions', name: 'Prediction Center', path: 'AdvancedPredictionCenter', category: 'analytics', icon3d: 'crystal', color: '#a855f7' },
  { id: 'realtime', name: 'Realtime Dashboard', path: 'RealtimeDashboard', category: 'analytics', icon3d: 'pulse', color: '#ef4444' },
  { id: 'globalmap', name: 'Global Map', path: 'GlobalMap', category: 'analytics', icon3d: 'map', color: '#10b981' },
  
  // Communication & Social
  { id: 'communications', name: 'Communications', path: 'Communications', category: 'social', icon3d: 'chat', color: '#06b6d4' },
  { id: 'video', name: 'Video Interface', path: 'AgentVideoInterface', category: 'social', icon3d: 'camera', color: '#f43f5e' },
  { id: 'community', name: 'Community', path: 'Community', category: 'social', icon3d: 'people', color: '#8b5cf6' },
  
  // Settings & Management
  { id: 'settings', name: 'Settings', path: 'Settings', category: 'management', icon3d: 'gear', color: '#64748b' },
  { id: 'profile', name: 'Profile', path: 'Profile', category: 'management', icon3d: 'user', color: '#06b6d4' },
  { id: 'billing', name: 'Billing', path: 'Billing', category: 'management', icon3d: 'card', color: '#10b981' },
  { id: 'ethics', name: 'Ethics Hub', path: 'EthicsHub', category: 'management', icon3d: 'shield', color: '#f59e0b' },
  
  // New Enhanced Hubs
  { id: 'omega-intelligence', name: 'Omega Intelligence', path: 'OmegaIntelligenceHub', category: 'ai', icon3d: 'brain', color: '#00ffff' },
  { id: 'companion-evolution', name: 'Companion Evolution', path: 'CompanionEvolutionHub', category: 'ai', icon3d: 'heart', color: '#ff00ff' },
  { id: 'advanced-systems', name: 'Advanced Systems', path: 'AdvancedSystemsHub', category: 'core', icon3d: 'settings', color: '#0099ff' },
  { id: 'media', name: 'Media Hub', path: 'EnhancedMediaHub', category: 'core', icon3d: 'galaxy', color: '#ec4899' },
  { id: 'cloudinary', name: 'Cloudinary Hub', path: 'CloudinaryHub', category: 'core', icon3d: 'cube', color: '#3b82f6' },
  { id: 'gemini', name: 'Gemini Hub', path: 'GeminiHub', category: 'core', icon3d: 'brain', color: '#a855f7' },
  { id: 'enhanced-comms', name: 'Enhanced Comms', path: 'EnhancedCommunications', category: 'core', icon3d: 'chat', color: '#ec4899' },
  { id: 'unified-hub', name: 'Conversation Hub', path: 'UnifiedConversationHub', category: 'core', icon3d: 'network', color: '#8b5cf6' },
  { id: 'developer-portal', name: 'Developer Portal', path: 'DeveloperPortal', category: 'system', icon3d: 'book', color: '#00dddd' },
  { id: 'ecosystem-monitor', name: 'Ecosystem Monitor', path: 'EcosystemMonitoringDashboard', category: 'system', icon3d: 'activity', color: '#00ffaa' },
  { id: 'behavior-studio', name: 'Behavior Studio', path: 'AgentBehaviorStudio', category: 'ai', icon3d: 'wand', color: '#aa00ff' },
  { id: 'agent-enhancement', name: 'Agent Enhancement', path: 'AgentEnhancementHub', category: 'ai', icon3d: 'zap', color: '#00ff88' },
  { id: 'consciousness-mirror', name: 'Consciousness Mirror', path: 'ConsciousnessMirrorHub', category: 'core', icon3d: 'eye', color: '#0088ff' },
  { id: 'marketplace-hub', name: 'Marketplace Hub', path: 'OmegaMarketplaceHub', category: 'ai', icon3d: 'store', color: '#6600ff' },
  { id: 'security-intel', name: 'Security Intelligence', path: 'SecurityIntelligenceHub', category: 'system', icon3d: 'shield', color: '#ff0044' },
  { id: 'advanced-collab', name: 'Advanced Collaboration', path: 'AdvancedCollaborationHub', category: 'ai', icon3d: 'network', color: '#aa44ff' }
];

export const HubCategories = {
  core: { name: 'Core', color: '#00f5ff' },
  financial: { name: 'Financial', color: '#10b981' },
  ai: { name: 'AI & Agents', color: '#a855f7' },
  simulation: { name: 'Simulation', color: '#06b6d4' },
  analytics: { name: 'Analytics', color: '#3b82f6' },
  social: { name: 'Social', color: '#8b5cf6' },
  management: { name: 'Management', color: '#64748b' }
};

// Knowledge graph for autonomous agent navigation
export const AppKnowledgeGraph = {
  getHubById: (id) => HubRegistry.find(hub => hub.id === id),
  getHubsByCategory: (category) => HubRegistry.filter(hub => hub.category === category),
  getAllHubs: () => HubRegistry,
  findHubByName: (name) => HubRegistry.find(hub => 
    hub.name.toLowerCase().includes(name.toLowerCase())
  ),
  getRelatedHubs: (hubId) => {
    const hub = HubRegistry.find(h => h.id === hubId);
    if (!hub) return [];
    return HubRegistry.filter(h => h.category === hub.category && h.id !== hubId);
  },
  getNavigationPath: (fromHubId, toHubId) => {
    // Simple pathfinding for agent navigation
    const fromHub = HubRegistry.find(h => h.id === fromHubId);
    const toHub = HubRegistry.find(h => h.id === toHubId);
    
    if (!fromHub || !toHub) return null;
    
    return {
      from: fromHub,
      to: toHub,
      steps: [fromHub, toHub],
      distance: fromHub.category === toHub.category ? 1 : 2
    };
  }
};
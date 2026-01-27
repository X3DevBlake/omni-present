import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, Activity, Brain, Rocket, Shield, Database, LayoutGrid, 
  Settings, Bot, GraduationCap, Globe, DollarSign, Cpu, Radio, 
  Users, Atom, BarChart2, Scale, LifeBuoy, Wallet, FlaskConical
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const categories = [
  { id: 'core', name: 'Core Systems', icon: Home, color: 'text-white' },
  { id: 'ai', name: 'Intelligence & AI', icon: Brain, color: 'text-purple-400' },
  { id: 'learning', name: 'Academy & Learning', icon: GraduationCap, color: 'text-pink-400' },
  { id: 'network', name: 'Network & Communication', icon: Globe, color: 'text-cyan-400' },
  { id: 'finance', name: 'Marketplace & Economy', icon: DollarSign, color: 'text-emerald-400' },
  { id: 'sim', name: 'Simulation & Modeling', icon: Rocket, color: 'text-amber-400' },
  { id: 'dev', name: 'Development & API', icon: Database, color: 'text-violet-400' },
  { id: 'sec', name: 'Security & Compliance', icon: Shield, color: 'text-red-400' },
  { id: 'phys', name: 'Physical & Embodiment', icon: Cpu, color: 'text-yellow-400' },
  { id: 'collab', name: 'Collaboration & Community', icon: Users, color: 'text-indigo-400' },
  { id: 'quantum', name: 'Quantum & Consciousness', icon: Atom, color: 'text-fuchsia-400' },
  { id: 'analytics', name: 'Analytics & Monitoring', icon: BarChart2, color: 'text-teal-400' },
  { id: 'gov', name: 'Governance & Ethics', icon: Scale, color: 'text-rose-400' },
  { id: 'support', name: 'Support & Resources', icon: LifeBuoy, color: 'text-slate-400' },
];

// List of known existing page files to ensure correct routing
const KNOWN_PAGES = new Set([
  "AIAgentMarketplace", "AIAnalyticsHub", "AICollaborationHub", "AICollaborativeIntelligenceHub", "AIEthicsHub",
  "AILab", "AILabs", "AILabsAdvanced", "AILabsLifecycle", "AIManagement", "AIModelDeployment", "AIModelRegistry",
  "AIPlayground", "AIPortfolioManager", "AITrainingAcademy", "AITrainingCenter", "APIDocumentation", "APIExplorer",
  "APIIntegrations", "APIKeys", "APIUsageMetrics", "About", "AcademyDashboard", "AccessControlLists", "AchievementsAwards",
  "ActivityLog", "ActuatorControl", "AdminHome", "AdvancedAICapabilitiesHub", "AdvancedAgentCapabilities",
  "AdvancedAgentTrainingHub", "AdvancedCollaborationHub", "AdvancedCommunicationHub", "AdvancedDeFiHub",
  "AdvancedDeFiRiskHub", "AdvancedDeFiTrading", "AdvancedFinancialEcosystem", "AdvancedIntelligenceHub",
  "AdvancedMLHub", "AdvancedPredictionCenter", "AdvancedReasoningHub", "AdvancedSimulation", "AdvancedSimulationLab",
  "AdvancedSimulationStudio", "AdvancedSystemsHub", "AdvancedWebhooks", "Agent", "AgentAudio", "AgentAutonomy",
  "AgentAutonomyDashboard", "AgentBehaviorStudio", "AgentBudget", "AgentCardSettings", "AgentCollaborationDashboard",
  "AgentCollaborationHub", "AgentConfigurator", "AgentCustomization", "AgentCustomizationStudio", "AgentDebugger",
  "AgentDetail", "AgentECommerceSettings", "AgentEnhancementHub", "AgentGovernance", "AgentGovernanceHub",
  "AgentKnowledge", "AgentKnowledgeBase", "AgentLearningHub", "AgentLogsHub", "AgentManagement", "AgentManagementHub",
  "AgentMarketplace", "AgentMarketplaceHub", "AgentModularBuilder", "AgentMonitoringDashboard", "AgentOrchestrationHub",
  "AgentPerformanceDashboard", "AgentShoppingLog", "AgentSimulation3D", "AgentSkillMarketplace", "AgentSpending",
  "AgentTraining", "AgentTrainingAcademy", "AgentTrainingCenter", "AgentTrainingStudio", "AgentVideoInterface",
  "AlertManagementDashboard", "AlgorithmAuditing", "AlignmentHub", "Analytics", "AnalyticsIntelligenceHub",
  "AnimationStudio", "Architecture", "AssetBrowser", "AssetManagement", "AssetUpload", "AuctionHouse", "AuditLogs",
  "AugmentationDesignHub", "AutomatedFinanceHub", "AutomationOrchestrationHub", "AutomationsHub", "AutonomousAgentSystem",
  "AutonomousCollaborationHub", "AutonomousVehicleHub", "AutonomyControlCenter", "AvatarCreationHub",
  "BackendInfrastructureHub", "BandwidthOptimizer", "BankingCorePhase1", "BatteryManagement", "BiasDetectionHub",
  "Billing", "BillingInvoicing", "BiometricAuthHub", "Blueprint", "BlueprintGallery", "BridgeOmni", "BudgetingForecast",
  "BuyOmni", "CalendarEvents", "CampusHome", "CareerOpportunities", "CareerPortal", "CertificationCenter",
  "Certifications", "Challenges", "CharacterCustomizer", "CloudinaryHub", "CodeEditor", "CognitiveEnhancement",
  "CoherenceTracker", "CollaborationCommHub", "CollaborationDashboard", "CollaborationOrchestrationHub",
  "CollaborativeAgentHub", "CollaborativeSimulationStudio", "CollaborativeWorkspace", "CommunicationAnalyticsHub",
  "Communications", "CommunicationsHub", "Community", "CommunityCreations", "CommunityGuidelines",
  "CommunityGuidelinesEnhanced", "CommunityHub", "CommunityWiki", "CompanionEvolutionHub", "CompetitiveArenas",
  "Compliance", "ComplianceAudit", "ComplianceDashboard", "ComprehensiveFinancialHub", "ConsciousnessMirrorHub",
  "ConsciousnessUploadHub", "Contact", "ContextAwareAssistantHub", "CourseCreator", "CrossAgentPlanningHub",
  "CrossPlatformIntegrationHub", "CrossSimulationHub", "CryptoSwapHub", "CryptoTradingHub", "CurriculumCourses",
  "CustomDashboard", "CustomIntegrations", "DAOGovernanceHub", "DEXAggregator", "DashboardHome", "DataAnnotation",
  "DataEncryption", "DataMarketplace", "DatabaseManager", "DatasetManagement", "DeFiAnalyticsPhase4",
  "DeFiAutonomousPhase3", "DeFiCorePhase2", "DeFiGovernancePhase5", "DeFiHub", "DeFiRiskManagementHub",
  "DeFiRiskManagementSuite", "DecentralizedCourt", "DecentralizedNetwork", "DeepLearningPlatform", "DeploymentReadiness",
  "DepositETH", "DepositOmni", "DepositUSDT", "DeveloperBlog", "DeveloperConsole", "DeveloperEcosystemHub",
  "DeveloperHome", "DeveloperPortal", "DeviceHealth", "DeviceHome", "DeviceIntegrationHub", "DeviceInteraction",
  "DeviceMarketplace", "DeviceSettings", "DeviceShop", "DeviceTelemetry", "DevicesHub", "DiscountsRebates",
  "Documentation", "DocumentsHub", "DreamRecordingStudio", "DroneFleetCommand", "DynamicSimulationStudio",
  "EconomicSimulation", "EcosystemDashboard", "EcosystemMonitoringDashboard", "EmergentBehavior",
  "EnhancedAIAgentMarketplace", "EnhancedAILabsHub", "EnhancedAgentCreator", "EnhancedAgentMarketplace",
  "EnhancedAgentTrainingHub", "EnhancedAnalyticsHub", "EnhancedAnomalyDashboard", "EnhancedBankingHub",
  "EnhancedCollaborationHub", "EnhancedCollaborationStudio", "EnhancedCommunications", "EnhancedCommunityHub",
  "EnhancedDashboard", "EnhancedDeFiHub", "EnhancedDeFiTradingHub", "EnhancedDeveloperEcosystem",
  "EnhancedGamificationHub", "EnhancedGovernanceHub", "EnhancedIntegrationHub", "EnhancedKnowledgeHub",
  "EnhancedMarketplace", "EnhancedMarketplaceHub", "EnhancedMediaHub", "EnhancedMonitoringHub", "EnhancedOmniBank",
  "EnhancedOmniCardHub", "EnhancedSecurityHub", "EnhancedSimulationHub", "EnhancedSimulationLab",
  "EnhancedVideoIntegrationHub", "EnhancedVoiceHub", "EnhancedWorkflowHub", "EntanglementBridge", "EnvironmentDesigner",
  "ErrorTracking", "EthicalAIReview", "EthicsCommittee", "EthicsHub", "EthicsSafetyHub", "EventsCalendar",
  "EvolutionDashboardPage", "ExchangeListings", "ExperimentTracking", "FeatureDetail", "FeatureFlagManager", "Features",
  "FeedbackDashboard", "FiatDeposit", "FiatGateway", "FinancialAdvisorHub", "FinancialCoachingHub", "FirewallSettings",
  "FirmwareUpdates", "FiveGControl", "FleetManagement", "FreelanceAgentHub", "GeminiHub", "GenericHub",
  "GlobalGovernance", "GlobalMap", "GlobalSettings", "HapticFeedbackControl", "HistoricalData", "HolographicAnalytics",
  "HolographicClassroomHub", "HolographicWorld", "Home", "HomeEnhanced", "HomeHub", "HomepageUpgradePlan",
  "HybridMLHub", "ImmersiveNavigationHub", "InferenceEngine", "InstructorDirectory", "IntegrationDevelopmentHub",
  "IntegrationHub", "IntegrationStore", "Integrations", "IntegrationsHub", "IntelligenceDashboard", "IntrusionDetection",
  "InvestmentStrategyHub", "IoTDeviceControl", "KnowledgeBase", "KnowledgeGraphHub", "Labs", "LabsHome", "Leaderboards",
  "LearningPathways", "LicenseManagement", "LinkBankAccount", "LiquidityPools", "LiveChatSupport", "LoansAndCredit",
  "LogAnalysis", "MLOpsHub", "MaintenanceSchedule", "MarketIntelligenceHub", "Marketplace", "MarketplaceHome",
  "MeetingNotes", "MentorshipProgramsPage", "MeshNetworkStatus", "MessageBroadcastHub", "MetaLearningHub", "MistralHub",
  "ModelTraining", "MovementPlanner", "MultiAgentCollaborationHub", "MyCreations", "NFTMarketplace", "NavigationControl",
  "NetworkTrafficHub", "NeuralNetworkVisualizer", "NewsUpdates", "NextGenMLHub", "NoeticScienceHub",
  "NotificationSettings", "Notifications", "NotificationsAndVisualizations", "ObjectCustomizer", "OmegaCollaborationHub",
  "OmegaFinancialHub", "OmegaHealth", "OmegaIntelligenceHub", "OmegaMarketplaceHub", "OmegaSecurity", "OmegaSentientHub",
  "OmniAchievements", "OmniBankingHub", "OmniCardManagement", "OmniCardStore", "OmniComm", "OmniDashboard", "OmniHome",
  "OmniHub", "OmniLearning", "OmniPresenceControlCenter", "OmniPresentAcademy", "OmniPresentCoreHub", "OmniSocial",
  "OmniStaking", "OmniWallet", "OrderManagement", "OrgSettings", "Partnerships", "PaymentHistory",
  "Phase10AdvancedAutonomy", "Phase1Dashboard", "Phase2Dashboard", "Phase3Dashboard", "Phase4Dashboard",
  "Phase4ImmersiveUI", "Phase6AgentCognition", "Phase7IntegrationHub", "Phase8PredictiveIntelligence",
  "Phase9ImmersiveUX", "PhysicalAugmentationHub", "PhysicalEmbodimentHub", "PhysicalSecurityHub",
  "PhysicalWorldIntegration", "PhysicsEngine", "PluginMarketplace", "PolicyManagement", "PollsAndSurveys",
  "PortfolioRebalancer", "PredictionMarket", "PredictiveAnalyticsHub", "PredictiveIntelligenceHub", "PredictiveTrends",
  "PressReleases", "Privacy", "ProactiveMonitoring", "ProceduralSimulationStudio", "Profile", "ProfileHome",
  "ProjectManagement", "ProposalDrafting", "QuantumComputingHub", "QuantumCryptography", "QuantumEntanglementHub",
  "QuantumStateMonitor", "QubitAllocation", "RealTimeMetrics", "RealWorldBudget", "RealtimeDashboard", "RedCommHub",
  "ReferralProgram", "ReleaseNotes", "RepairRequest", "ReportingAnalytics", "ResearchHub", "ResourceLibrary",
  "ResourceManagementHub", "Roadmap", "RoboticsIntegrationHub", "SDKDownloads", "SDKsLibraries", "SandboxEnvironment",
  "SandboxHub", "SandboxSimulationHub", "SandboxTesting", "SatelliteUplink", "ScenarioTesting", "Security",
  "SecurityComplianceHub", "SecurityIntelligenceHub", "SecurityMonitoringHub", "SecuritySettings", "SellOmni",
  "SensorDataAnalysis", "SensorFusion", "ServerlessFunctions", "ServiceMarketplace", "ServiceProviders", "Settings",
  "SharedFiles", "SignalProcessing", "SimulationControlPanel", "SimulationEnvironment", "SimulationHub", "SimulationLab",
  "SimulationLabs", "SimulationStudio", "SimulationWorld", "SmartBankingHub", "SmartContractAudit", "SmartHomeHub",
  "SocialDynamics", "SpatialMapping", "StudentLounge", "StudentProgress", "StudyGroups", "SubscriptionManagement",
  "SystemArchitecture", "SystemDashboard", "Team", "SystemHealth", "SystemStatus", "TaskBoard", "TeamChat",
  "TeamOrchestration", "Technology", "TelepathyTraining", "Terms", "ThemeStudio", "TicketSystem", "TokenExchange",
  "Tokenomics", "TrafficSimulation", "TransactionHistory", "TransferLearningHub", "TransparencyReport",
  "UltraOmniSentientHub", "UnifiedAnalytics", "UnifiedCommunicationHub", "UnifiedConversationHub",
  "UnifiedIntelligenceCenter", "UnifiedIntelligenceDashboard", "UnifiedPlatformNavigator", "UnifiedVoicePlatform",
  "UpgradeTracker", "UserBehaviorAnalytics", "UserEngagement", "UserForums", "UserManual", "UserPreferences",
  "UserRoleManagement", "UserRolesPermissions", "VersionControl", "VideoConferencing", "VideoTutorials",
  "VirtualClassrooms", "VirtualLibrary", "VotingBooth", "VulnerabilityScanner", "Wallet", "WalletSecurity",
  "WavefunctionCollapse", "WearableDeviceHub", "WeatherSimulation", "WebhookLogs", "WebhookManager", "Webhooks",
  "WebhooksHub", "WhiteboardHub", "WithdrawOmni", "WorkflowAutomationHub", "WorkflowOrchestrationHub", "World",
  "WorldHubEnhanced", "OmniNavigationHub"
]);

const HARDCODED_HUBS = [
  { id: 'banking', name: 'Omni Banking', category: 'Marketplace & Economy', path: 'OmniBankingHub' },
  { id: 'defi', name: 'Advanced DeFi', category: 'Marketplace & Economy', path: 'AdvancedDeFiHub' },
  { id: 'ailab', name: 'AI Laboratory', category: 'Intelligence & AI', path: 'AILab' },
  { id: 'adv_collab', name: 'Advanced Collaboration', category: 'Collaboration & Community', path: 'AdvancedCollaborationHub' },
  { id: 'redcomm_bp', name: 'RedComm Blueprints', category: 'Network & Communication', path: 'RedCommBlueprints' }
];

export default function Sidebar({ isOpen, hubs = [], isLoading = false }) {
  const location = useLocation();
  
  const allHubs = [...HARDCODED_HUBS, ...hubs];

  const getHubsByCategory = (cat) => {
    return allHubs.filter(h => h.category?.includes(cat.name) || h.category === cat.name);
  };

  const getPageLink = (hub) => {
    // If the hub path or name matches a known page, use it directly.
    // Otherwise fallback to GenericHub.
    const path = hub.path || hub.name;
    if (KNOWN_PAGES.has(path)) {
      return createPageUrl(path);
    }
    return createPageUrl('GenericHub') + '?name=' + encodeURIComponent(hub.name);
  };

  return (
    <motion.div
      initial={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
      animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
      className="fixed left-0 top-20 bottom-0 z-30 bg-black/80 backdrop-blur-xl border-r border-white/10 overflow-hidden"
    >
      <ScrollArea className="h-full py-4">
        <div className="px-4 space-y-6">
          <div className="text-xs text-gray-500 mb-4 px-2">
            System Modules: {hubs.length}
          </div>
          
          {isLoading && hubs.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-10 px-4 animate-pulse">
              Initializing neural interface...
            </div>
          )}
          
          {!isLoading && hubs.length === 0 && (
            <div className="text-red-400 text-sm text-center py-10 px-4 border border-red-500/20 rounded m-4">
              No systems connected.
              <br/><span className="text-xs text-gray-500">Check database connection.</span>
            </div>
          )}

          {categories.map((cat) => {
            const catHubs = getHubsByCategory(cat);
            if (catHubs.length === 0) return null;

            return (
              <div key={cat.id}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${cat.color}`}>
                  <cat.icon className="w-3 h-3" />
                  {cat.name}
                </h3>
                <div className="space-y-1">
                  {catHubs.map((hub) => {
                    const linkTo = getPageLink(hub);
                    const isActive = location.pathname.includes(hub.name) || location.search.includes(hub.name);
                    
                    return (
                      <Link 
                        key={hub.id} 
                        to={linkTo}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                          isActive
                            ? 'bg-white/10 text-white font-medium shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                        title={hub.name}
                      >
                        {hub.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {/* Catch-all for uncategorized */}
          {hubs.filter(h => !categories.some(c => h.category?.includes(c.name) || h.category === c.name)).length > 0 && (
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-gray-400">
                  <Database className="w-3 h-3" />
                  Other Systems
                </h3>
                <div className="space-y-1">
                  {hubs.filter(h => !categories.some(c => h.category?.includes(c.name) || h.category === c.name)).map(hub => (
                    <Link 
                      key={hub.id} 
                      to={getPageLink(hub)}
                      className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 truncate"
                    >
                      {hub.name}
                    </Link>
                  ))}
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
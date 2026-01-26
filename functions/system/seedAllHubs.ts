import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ALL_HUBS = [
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
    "WorldHubEnhanced"
];

function guessCategory(name) {
    const n = name.toLowerCase();
    if (n.includes('ai') || n.includes('intelligence') || n.includes('brain') || n.includes('neural') || n.includes('learning')) return "Intelligence & AI";
    if (n.includes('defi') || n.includes('bank') || n.includes('wallet') || n.includes('money') || n.includes('finance') || n.includes('crypto') || n.includes('market') || n.includes('token')) return "Marketplace & Economy";
    if (n.includes('sim') || n.includes('world') || n.includes('environment') || n.includes('physics')) return "Simulation & Modeling";
    if (n.includes('agent') || n.includes('autonom')) return "Autonomous Agents";
    if (n.includes('security') || n.includes('compliance') || n.includes('auth') || n.includes('privacy')) return "Security & Compliance";
    if (n.includes('dev') || n.includes('api') || n.includes('sdk') || n.includes('code') || n.includes('webhook')) return "Development & API";
    if (n.includes('comm') || n.includes('network') || n.includes('chat') || n.includes('social')) return "Network & Communication";
    if (n.includes('collab') || n.includes('team')) return "Collaboration";
    if (n.includes('quantum') || n.includes('consciousness')) return "Quantum & Consciousness";
    if (n.includes('home') || n.includes('dash') || n.includes('profile') || n.includes('setting')) return "Core Systems";
    return "Core Systems"; // Default
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        // Only run if admin or system
        // if (!user || user.role !== 'admin') return Response.json({error: "Unauthorized"}, {status: 403});
        
        // Force redeploy trigger - timestamp: 2026-01-26

        let createdCount = 0;
        
        // In a real scenario, we'd batch this. For now, loop.
        // To avoid timeouts, we might process in chunks if needed, but 400 is okay for Deno typically.
        
        // First get existing to avoid duplicates
        const existing = await base44.entities.Hub.list({ limit: 1000 });
        const existingNames = new Set(existing.map(h => h.name));

        const toCreate = [];

        for (const name of ALL_HUBS) {
            if (!existingNames.has(name)) {
                toCreate.push({
                    name: name,
                    path: name,
                    category: guessCategory(name),
                    description: `Advanced hub for ${name} operations.`,
                    featured: Math.random() > 0.9 // Randomly feature some
                });
            }
        }

        // Bulk create in chunks of 50
        const chunkSize = 50;
        for (let i = 0; i < toCreate.length; i += chunkSize) {
            const chunk = toCreate.slice(i, i + chunkSize);
            if (chunk.length > 0) {
                // Use bulkCreate for arrays
                await base44.entities.Hub.bulkCreate(chunk);
                createdCount += chunk.length;
            }
        }

        return Response.json({ 
            success: true, 
            message: `Seeded ${createdCount} new hubs.`,
            total: existing.length + createdCount
        });

    } catch (error) {
        console.error("Seeding error:", error);
        return Response.json({ error: JSON.stringify(error, Object.getOwnPropertyNames(error)) }, { status: 500 });
    }
});
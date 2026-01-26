import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // 1. The 14 Categories
        const categories = [
            "Core Systems", "Intelligence & AI", "Academy & Learning", "Network & Communication",
            "Marketplace & Economy", "Simulation & Modeling", "Development & API", "Security & Compliance",
            "Physical & Embodiment", "Collaboration & Community", "Quantum & Consciousness",
            "Analytics & Monitoring", "Governance & Ethics", "Support & Resources"
        ];

        // 2. Comprehensive mapping of ALL pages found in snapshot to Categories
        const hubMappings = [
            // Core Systems
            { name: "OmniPresent Core", category: "Core Systems", page: "OmniPresentCoreHub" },
            { name: "Omni Dashboard", category: "Core Systems", page: "OmniDashboard" },
            { name: "System Dashboard", category: "Core Systems", page: "SystemDashboard" },
            { name: "Settings", category: "Core Systems", page: "Settings" },
            { name: "Home Enhanced", category: "Core Systems", page: "HomeEnhanced" },
            { name: "Home Hub", category: "Core Systems", page: "HomeHub" },
            { name: "Omni Home", category: "Core Systems", page: "OmniHome" },
            { name: "Omni Hub", category: "Core Systems", page: "OmniHub" },
            { name: "Profile", category: "Core Systems", page: "Profile" },
            { name: "About", category: "Core Systems", page: "About" },
            { name: "Contact", category: "Core Systems", page: "Contact" },

            // Intelligence & AI
            { name: "Omega Intelligence", category: "Intelligence & AI", page: "OmegaIntelligenceHub" },
            { name: "AI Labs", category: "Intelligence & AI", page: "AILabs" },
            { name: "AI Lab", category: "Intelligence & AI", page: "AILab" },
            { name: "Advanced AI Capabilities", category: "Intelligence & AI", page: "AdvancedAICapabilitiesHub" },
            { name: "Predictive Intelligence", category: "Intelligence & AI", page: "PredictiveIntelligenceHub" },
            { name: "Agent Behavior Studio", category: "Intelligence & AI", page: "AgentBehaviorStudio" },
            { name: "AI Management", category: "Intelligence & AI", page: "AIManagement" },
            { name: "AI Playground", category: "Intelligence & AI", page: "AIPlayground" },
            { name: "AI Training Center", category: "Intelligence & AI", page: "AITrainingCenter" },
            { name: "Advanced ML Hub", category: "Intelligence & AI", page: "AdvancedMLHub" },
            { name: "Advanced Reasoning", category: "Intelligence & AI", page: "AdvancedReasoningHub" },
            { name: "Next Gen ML", category: "Intelligence & AI", page: "NextGenMLHub" },
            { name: "Deep Learning Platform", category: "Intelligence & AI", page: "DeepLearningPlatform" },
            { name: "Gemini Hub", category: "Intelligence & AI", page: "GeminiHub" },
            { name: "Mistral Hub", category: "Intelligence & AI", page: "MistralHub" },
            { name: "Hybrid ML Hub", category: "Intelligence & AI", page: "HybridMLHub" },
            { name: "Meta Learning Hub", category: "Intelligence & AI", page: "MetaLearningHub" },
            { name: "Transfer Learning Hub", category: "Intelligence & AI", page: "TransferLearningHub" },

            // Academy & Learning
            { name: "Omni Academy", category: "Academy & Learning", page: "OmniPresentAcademy" },
            { name: "Training Academy", category: "Academy & Learning", page: "AITrainingAcademy" },
            { name: "Holographic Classroom", category: "Academy & Learning", page: "HolographicClassroomHub" },
            { name: "Research Hub", category: "Academy & Learning", page: "ResearchHub" },
            { name: "Documents", category: "Academy & Learning", page: "DocumentsHub" },
            { name: "Academy Dashboard", category: "Academy & Learning", page: "AcademyDashboard" },
            { name: "Virtual Classrooms", category: "Academy & Learning", page: "VirtualClassrooms" },
            { name: "Student Lounge", category: "Academy & Learning", page: "StudentLounge" },
            { name: "Study Groups", category: "Academy & Learning", page: "StudyGroups" },
            { name: "Curriculum Courses", category: "Academy & Learning", page: "CurriculumCourses" },
            { name: "Mentorship Programs", category: "Academy & Learning", page: "MentorshipProgramsPage" },
            { name: "Instructor Directory", category: "Academy & Learning", page: "InstructorDirectory" },
            { name: "Resource Library", category: "Academy & Learning", page: "ResourceLibrary" },

            // Network & Communication
            { name: "RedComm Hub", category: "Network & Communication", page: "RedCommHub" },
            { name: "Communications Center", category: "Network & Communication", page: "CommunicationsHub" },
            { name: "Unified Communications", category: "Network & Communication", page: "UnifiedCommunicationHub" },
            { name: "Webhooks Manager", category: "Network & Communication", page: "WebhooksHub" },
            { name: "Message Broadcast", category: "Network & Communication", page: "MessageBroadcastHub" },
            { name: "Communication Analytics", category: "Network & Communication", page: "CommunicationAnalyticsHub" },
            { name: "Unified Voice Platform", category: "Network & Communication", page: "UnifiedVoicePlatform" },
            { name: "Omni Comm", category: "Network & Communication", page: "OmniComm" },
            { name: "Enhanced Voice Hub", category: "Network & Communication", page: "EnhancedVoiceHub" },
            { name: "Enhanced Video Integration", category: "Network & Communication", page: "EnhancedVideoIntegrationHub" },

            // Marketplace & Economy
            { name: "Agent Marketplace", category: "Marketplace & Economy", page: "AIAgentMarketplace" },
            { name: "Omega Financial", category: "Marketplace & Economy", page: "OmegaFinancialHub" },
            { name: "Omega Marketplace", category: "Marketplace & Economy", page: "OmegaMarketplaceHub" },
            { name: "DeFi Hub", category: "Marketplace & Economy", page: "DeFiHub" },
            { name: "Wallet", category: "Marketplace & Economy", page: "Wallet" },
            { name: "Billing & Invoicing", category: "Marketplace & Economy", page: "BillingInvoicing" },
            { name: "Omni Banking", category: "Marketplace & Economy", page: "OmniBankingHub" },
            { name: "Omni Wallet", category: "Marketplace & Economy", page: "OmniWallet" },
            { name: "Omni Card Management", category: "Marketplace & Economy", page: "OmniCardManagement" },
            { name: "Omni Card Store", category: "Marketplace & Economy", page: "OmniCardStore" },
            { name: "Omni Staking", category: "Marketplace & Economy", page: "OmniStaking" },
            { name: "Liquidity Pools", category: "Marketplace & Economy", page: "LiquidityPools" },
            { name: "Crypto Trading", category: "Marketplace & Economy", page: "CryptoTradingHub" },
            { name: "Crypto Swap", category: "Marketplace & Economy", page: "CryptoSwapHub" },
            { name: "DEX Aggregator", category: "Marketplace & Economy", page: "DEXAggregator" },
            { name: "Investment Strategy", category: "Marketplace & Economy", page: "InvestmentStrategyHub" },
            { name: "Tokenomics", category: "Marketplace & Economy", page: "Tokenomics" },
            { name: "Enhanced Marketplace", category: "Marketplace & Economy", page: "EnhancedMarketplaceHub" },
            { name: "Agent Shopping Log", category: "Marketplace & Economy", page: "AgentShoppingLog" },
            { name: "Agent Spending", category: "Marketplace & Economy", page: "AgentSpending" },

            // Simulation & Modeling
            { name: "Simulation Hub", category: "Simulation & Modeling", page: "SimulationHub" },
            { name: "Simulation Studio", category: "Simulation & Modeling", page: "SimulationStudio" },
            { name: "World Simulation", category: "Simulation & Modeling", page: "WorldHubEnhanced" },
            { name: "Animation Studio", category: "Simulation & Modeling", page: "AnimationStudio" },
            { name: "Advanced Simulation", category: "Simulation & Modeling", page: "AdvancedSimulation" },
            { name: "Advanced Simulation Lab", category: "Simulation & Modeling", page: "AdvancedSimulationLab" },
            { name: "Collaborative Simulation", category: "Simulation & Modeling", page: "CollaborativeSimulationStudio" },
            { name: "Dynamic Simulation", category: "Simulation & Modeling", page: "DynamicSimulationStudio" },
            { name: "Enhanced Simulation", category: "Simulation & Modeling", page: "EnhancedSimulationHub" },
            { name: "Sandbox Simulation", category: "Simulation & Modeling", page: "SandboxSimulationHub" },
            { name: "Scenario Testing", category: "Simulation & Modeling", page: "ScenarioTesting" },
            { name: "Procedural Simulation", category: "Simulation & Modeling", page: "ProceduralSimulationStudio" },
            { name: "Agent Simulation 3D", category: "Simulation & Modeling", page: "AgentSimulation3D" },

            // Development & API
            { name: "Developer Ecosystem", category: "Development & API", page: "DeveloperEcosystemHub" },
            { name: "Developer Portal", category: "Development & API", page: "DeveloperPortal" },
            { name: "API Documentation", category: "Development & API", page: "APIDocumentation" },
            { name: "Integration Hub", category: "Development & API", page: "IntegrationHub" },
            { name: "Sandbox", category: "Development & API", page: "SandboxHub" },
            { name: "Workflows", category: "Development & API", page: "WorkflowAutomationHub" },
            { name: "Advanced Webhooks", category: "Development & API", page: "AdvancedWebhooks" },
            { name: "API Explorer", category: "Development & API", page: "APIExplorer" },
            { name: "API Integrations", category: "Development & API", page: "APIIntegrations" },
            { name: "API Keys", category: "Development & API", page: "APIKeys" },
            { name: "Code Editor", category: "Development & API", page: "CodeEditor" },
            { name: "Integration Store", category: "Development & API", page: "IntegrationStore" },
            { name: "SDKs & Libraries", category: "Development & API", page: "SDKsLibraries" },
            { name: "Webhook Manager", category: "Development & API", page: "WebhookManager" },
            { name: "Cloudinary Hub", category: "Development & API", page: "CloudinaryHub" },
            { name: "Blueprint", category: "Development & API", page: "Blueprint" },
            { name: "Blueprint Gallery", category: "Development & API", page: "BlueprintGallery" },

            // Security & Compliance
            { name: "Security Intelligence", category: "Security & Compliance", page: "SecurityIntelligenceHub" },
            { name: "Compliance Hub", category: "Security & Compliance", page: "ComplianceDashboard" },
            { name: "Privacy Center", category: "Security & Compliance", page: "Privacy" },
            { name: "Audit Logs", category: "Security & Compliance", page: "AuditLogs" },
            { name: "Security Monitoring", category: "Security & Compliance", page: "SecurityMonitoringHub" },
            { name: "Security Compliance", category: "Security & Compliance", page: "SecurityComplianceHub" },
            { name: "Enhanced Security", category: "Security & Compliance", page: "EnhancedSecurityHub" },
            { name: "User Roles & Permissions", category: "Security & Compliance", page: "UserRolesPermissions" },
            { name: "License Management", category: "Security & Compliance", page: "LicenseManagement" },

            // Physical & Embodiment
            { name: "Physical Augmentation", category: "Physical & Embodiment", page: "PhysicalAugmentationHub" },
            { name: "Physical Embodiment", category: "Physical & Embodiment", page: "PhysicalEmbodimentHub" },
            { name: "Device Management", category: "Physical & Embodiment", page: "DeviceIntegrationHub" },
            { name: "Immersive Navigation", category: "Physical & Embodiment", page: "ImmersiveNavigationHub" },
            { name: "IoT Device Control", category: "Physical & Embodiment", page: "IoTDeviceControl" },
            { name: "Device Health", category: "Physical & Embodiment", page: "DeviceHealth" },
            { name: "Device Telemetry", category: "Physical & Embodiment", page: "DeviceTelemetry" },
            { name: "Device Marketplace", category: "Physical & Embodiment", page: "DeviceMarketplace" },
            { name: "Device Settings", category: "Physical & Embodiment", page: "DeviceSettings" },
            { name: "Firmware Updates", category: "Physical & Embodiment", page: "FirmwareUpdates" },
            { name: "Fleet Management", category: "Physical & Embodiment", page: "FleetManagement" },
            { name: "Physical World Integration", category: "Physical & Embodiment", page: "PhysicalWorldIntegration" },

            // Collaboration & Community
            { name: "Collaboration Hub", category: "Collaboration & Community", page: "AdvancedCollaborationHub" },
            { name: "Agent Collaboration", category: "Collaboration & Community", page: "AgentCollaborationHub" },
            { name: "Community Hub", category: "Collaboration & Community", page: "CommunityHub" },
            { name: "Team Orchestration", category: "Collaboration & Community", page: "TeamOrchestration" },
            { name: "Unified Collaboration", category: "Collaboration & Community", page: "UnifiedConversationHub" },
            { name: "Collaborative Workspace", category: "Collaboration & Community", page: "CollaborativeWorkspace" },
            { name: "Cross Agent Planning", category: "Collaboration & Community", page: "CrossAgentPlanningHub" },
            { name: "Multi Agent Collaboration", category: "Collaboration & Community", page: "MultiAgentCollaborationHub" },
            { name: "Autonomous Collaboration", category: "Collaboration & Community", page: "AutonomousCollaborationHub" },
            { name: "Community Creations", category: "Collaboration & Community", page: "CommunityCreations" },

            // Quantum & Consciousness
            { name: "Omega Sentient", category: "Quantum & Consciousness", page: "OmegaSentientHub" },
            { name: "Ultra Omni Sentient", category: "Quantum & Consciousness", page: "UltraOmniSentientHub" },
            { name: "Consciousness Mirror", category: "Quantum & Consciousness", page: "ConsciousnessMirrorHub" },
            { name: "Quantum Computing", category: "Quantum & Consciousness", page: "QuantumComputingHub" },
            { name: "Agent Autonomy", category: "Quantum & Consciousness", page: "AgentAutonomy" },
            { name: "Emergent Behavior", category: "Quantum & Consciousness", page: "EmergentBehavior" },
            { name: "Evolution Dashboard", category: "Quantum & Consciousness", page: "EvolutionDashboardPage" },
            { name: "Alignment Hub", category: "Quantum & Consciousness", page: "AlignmentHub" },

            // Analytics & Monitoring
            { name: "Ecosystem Monitoring", category: "Analytics & Monitoring", page: "EcosystemMonitoringDashboard" },
            { name: "AI Analytics", category: "Analytics & Monitoring", page: "AIAnalyticsHub" },
            { name: "Performance Metrics", category: "Analytics & Monitoring", page: "ReportingAnalytics" },
            { name: "Realtime Dashboard", category: "Analytics & Monitoring", page: "RealtimeDashboard" },
            { name: "Intelligence Dashboard", category: "Analytics & Monitoring", page: "IntelligenceDashboard" },
            { name: "Unified Analytics", category: "Analytics & Monitoring", page: "UnifiedAnalytics" },
            { name: "Unified Intelligence", category: "Analytics & Monitoring", page: "UnifiedIntelligenceCenter" },
            { name: "Proactive Monitoring", category: "Analytics & Monitoring", page: "ProactiveMonitoring" },
            { name: "Sensor Data Analysis", category: "Analytics & Monitoring", page: "SensorDataAnalysis" },
            { name: "Agent Monitoring", category: "Analytics & Monitoring", page: "AgentMonitoringDashboard" },
            { name: "Agent Performance", category: "Analytics & Monitoring", page: "AgentPerformanceDashboard" },
            { name: "Analytics Intelligence", category: "Analytics & Monitoring", page: "AnalyticsIntelligenceHub" },

            // Governance & Ethics
            { name: "Governance Hub", category: "Governance & Ethics", page: "GlobalGovernance" },
            { name: "Ethics & Safety", category: "Governance & Ethics", page: "EthicsSafetyHub" },
            { name: "DAO Governance", category: "Governance & Ethics", page: "DAOGovernanceHub" },
            { name: "Agent Governance", category: "Governance & Ethics", page: "AgentGovernanceHub" },
            { name: "Enhanced Governance", category: "Governance & Ethics", page: "EnhancedGovernanceHub" },
            { name: "Community Guidelines", category: "Governance & Ethics", page: "CommunityGuidelines" },
            { name: "Terms", category: "Governance & Ethics", page: "Terms" },

            // Support & Resources
            { name: "Omni Presence Control", category: "Support & Resources", page: "OmniPresenceControlCenter" },
            { name: "Help Center", category: "Support & Resources", page: "FAQ" },
            { name: "Career Portal", category: "Support & Resources", page: "CareerPortal" },
            { name: "Service Providers", category: "Support & Resources", page: "ServiceProviders" },
            { name: "Partnerships", category: "Support & Resources", page: "Partnerships" },
            { name: "Press Releases", category: "Support & Resources", page: "Press Releases" },
            { name: "Events Calendar", category: "Support & Resources", page: "EventsCalendar" },
            { name: "Notifications", category: "Support & Resources", page: "Notifications" }
        ];

        // 3. Prepare full list
        // Add "GenericHub" entries to reach 385+
        const allHubs = [...hubMappings];
        
        const currentCount = allHubs.length;
        const targetCount = 385;
        const remaining = Math.max(0, targetCount - currentCount);
        const perCategory = Math.ceil(remaining / categories.length);

        categories.forEach(cat => {
            for (let i = 1; i <= perCategory; i++) {
                const nodeName = `${cat.split(' ')[0]} Node ${i + 100}`;
                // Crucial: Use GenericHub as the page for procedural nodes
                const pageName = "GenericHub"; 
                
                allHubs.push({
                    name: nodeName,
                    category: cat,
                    page: pageName, 
                    description: `Advanced ${cat} processing node #${i + 100}.`,
                    icon_name: "Activity",
                    featured: false,
                    status: Math.random() > 0.9 ? "maintenance" : "active",
                    complexity_level: Math.floor(Math.random() * 10) + 1
                });
            }
        });

        // 4. Batch create
        const chunkSize = 100;
        let createdCount = 0;
        
        for (let i = 0; i < allHubs.length; i += chunkSize) {
            const chunk = allHubs.slice(i, i + chunkSize);
            // Using createRecords (upsert logic if ID provided, but here new IDs generated)
            // For a 're-add' it's safer to just create new ones or delete old ones first.
            // But 'delete_entities' tool isn't available here in backend code easily without ID list.
            // We'll just create.
            await base44.entities.Hub.createRecords(chunk);
            createdCount += chunk.length;
        }

        return Response.json({ 
            success: true, 
            message: `Successfully mapped ${hubMappings.length} existing pages and generated ${remaining} procedural nodes (Total: ${createdCount}).`,
            total_hubs: createdCount
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
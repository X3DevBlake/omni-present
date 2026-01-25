import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Define the 25 categories
        const categories = [
            "Intelligence", "Academy", "Network", "Marketplace", "Collaboration", 
            "Simulation", "Financial", "Development", "Security", "Physical",
            "Governance", "Quantum", "Neuroscience", "Blockchain", "Gaming", 
            "Media", "Social", "Analytics", "Infrastructure", "Legal", 
            "Ethics", "Research", "Space", "Energy", "Support"
        ];

        // Generate ~15-16 hubs per category to reach 384+
        const hubsToCreate = [];
        
        categories.forEach(cat => {
            for (let i = 1; i <= 16; i++) {
                hubsToCreate.push({
                    name: `${cat} Node ${i}`,
                    category: cat,
                    page: `${cat.replace(/\s+/g, '')}Hub${i}`, // Placeholder page links
                    description: `Advanced ${cat} capabilities and management node ${i}.`,
                    icon_name: "Activity", // Default icon, handled in frontend
                    featured: i <= 2 // Feature first 2 of each
                });
            }
        });

        // Add specific named hubs from previous context to ensure they exist/override
        const specificHubs = [
            { name: "Omega Intelligence", category: "Intelligence", page: "OmegaIntelligenceHub", featured: true },
            { name: "AI Labs", category: "Intelligence", page: "AILabs", featured: true },
            { name: "Academy Portal", category: "Academy", page: "OmniPresentAcademy", featured: true },
            { name: "RedComm Hub", category: "Network", page: "RedCommHub", featured: true },
            { name: "Agent Marketplace", category: "Marketplace", page: "AIAgentMarketplace", featured: true },
            { name: "Financial Hub", category: "Financial", page: "OmegaFinancialHub", featured: true },
            { name: "Simulation Hub", category: "Simulation", page: "SimulationHub", featured: true },
            { name: "Developer Ecosystem", category: "Development", page: "DeveloperEcosystemHub", featured: true }
        ];

        // Insert specific hubs first (upsert logic ideal, but simple create for now)
        // In a real scenario, we'd check existence. For this seed script, we'll just create.
        // To avoid duplicates if run multiple times, ideally we'd check. 
        // We'll just return the list for the user to confirm creation or doing it in batches.
        
        // Batch create in chunks of 50
        const batchSize = 50;
        for (let i = 0; i < hubsToCreate.length; i += batchSize) {
            const batch = hubsToCreate.slice(i, i + batchSize);
            await base44.entities.Hub.createRecords(batch);
        }
        
        // Also ensure specific named hubs are present
        await base44.entities.Hub.createRecords(specificHubs);

        return Response.json({ 
            success: true, 
            message: `Created ${hubsToCreate.length + specificHubs.length} hubs across ${categories.length} categories.` 
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
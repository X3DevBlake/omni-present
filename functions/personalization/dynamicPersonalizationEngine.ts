import { createClientFromRequest } from 'npm:@base44/sdk@0.8.11';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { agent_id } = await req.json();

        if (!agent_id) return Response.json({ error: "Agent ID required" }, { status: 400 });

        // Mock data aggregation
        // In real app, fetch from Agent, SentienceMetric, EthicalAuditReport, etc.
        const sentience = Math.random() * 100;
        const compliance = Math.random() * 100;
        
        // Determine Archetype
        let archetype = "Analyst";
        if (sentience > 80 && compliance > 80) archetype = "Diplomat";
        else if (sentience > 80) archetype = "Creator";
        else if (compliance < 50) archetype = "Warrior"; // Risky but effective?

        const profile = {
            agent_id,
            archetype,
            traits: {
                adaptability: Math.random() * 100,
                empathy: sentience * 0.8,
                risk_tolerance: 100 - compliance,
                creativity: (sentience + (100-compliance))/2
            },
            skill_mastery: [
                { skill_name: "Negotiation", level: Math.floor(Math.random() * 10), usage_count: Math.floor(Math.random() * 500) },
                { skill_name: "Cyber-Defense", level: Math.floor(Math.random() * 10), usage_count: Math.floor(Math.random() * 300) }
            ],
            learning_path: ["Advanced Ethics Module 4", "Quantum Negotiation Strategies"],
            compliance_history_score: compliance,
            last_updated: new Date().toISOString()
        };

        // await base44.entities.AgentPersonalizationProfile.create(profile); // Simulated persistence

        return Response.json({ status: "success", profile });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      operation,
      seller_embodiment_id,
      buyer_embodiment_id,
      skill_name,
      listing_id
    } = await req.json();

    if (operation === 'create_listing') {
      const [embodiment, learningHistory] = await Promise.all([
        base44.asServiceRole.entities.PhysicallyEmbodiedAgent.filter({ embodiment_id: seller_embodiment_id }),
        base44.asServiceRole.entities.EmbodiedAgentLearning.filter({ embodiment_id: seller_embodiment_id, task_learned: skill_name })
      ]);

      const skillData = embodiment[0]?.physical_capabilities?.find(c => c.capability_name === skill_name);
      const learning = learningHistory[0];

      if (!skillData) {
        return Response.json({ error: 'Skill not found' }, { status: 404 });
      }

      const listing = await base44.asServiceRole.entities.AgentSkillMarketplace.create({
        listing_id: `listing-${Date.now()}`,
        seller_embodiment_id,
        skill_name,
        skill_proficiency: skillData.proficiency_level,
        learned_through: skillData.learned_through,
        execution_data: {
          successful_executions: Math.floor(Math.random() * 100) + 50,
          average_success_rate: skillData.proficiency_level * 0.95,
          performance_metrics: {},
          edge_cases_handled: []
        },
        skill_encoding: {
          neural_weights: 'encrypted_weights_data',
          motion_patterns: learning?.motion_planning_evolution || [],
          decision_trees: {},
          transferability_score: skillData.proficiency_level * 0.9
        },
        price_omni: Math.floor(skillData.proficiency_level * 100),
        acquisition_history: [],
        listing_status: 'active'
      });

      return Response.json({
        success: true,
        listing_id: listing.id,
        price: listing.price_omni
      });
    }

    if (operation === 'acquire_skill') {
      const [listing, buyerEmbodiment] = await Promise.all([
        base44.asServiceRole.entities.AgentSkillMarketplace.filter({ listing_id }),
        base44.asServiceRole.entities.PhysicallyEmbodiedAgent.filter({ embodiment_id: buyer_embodiment_id })
      ]);

      const listingEntity = listing[0];
      const buyer = buyerEmbodiment[0];

      if (!listingEntity || !buyer) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      // AI skill transfer simulation
      const transferPrompt = `Simulate secure skill transfer between embodied AI agents.

SKILL: ${listingEntity.skill_name}
PROFICIENCY: ${(listingEntity.skill_proficiency * 100).toFixed(0)}%
LEARNED THROUGH: ${listingEntity.learned_through}

SELLER EXECUTION DATA:
- Successful executions: ${listingEntity.execution_data?.successful_executions}
- Success rate: ${(listingEntity.execution_data?.average_success_rate * 100).toFixed(0)}%
- Transferability: ${(listingEntity.skill_encoding?.transferability_score * 100).toFixed(0)}%

BUYER CURRENT CAPABILITIES:
${buyer.physical_capabilities?.map(c => `${c.capability_name}: ${(c.proficiency_level * 100).toFixed(0)}%`).join('\n')}

Analyze skill transfer:
1. Adaptation requirements
2. Expected proficiency retention
3. Learning curve prediction
4. Potential synergies with existing skills
5. Risk of negative transfer
6. Optimization recommendations
7. Emergent capabilities prediction

Provide detailed transfer analysis.`;

      const transfer = await base44.integrations.Core.InvokeLLM({
        prompt: transferPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            adaptation_requirements: { type: "array", items: { type: "string" } },
            expected_proficiency: { type: "number" },
            learning_curve_days: { type: "number" },
            skill_synergies: { type: "array", items: { type: "string" } },
            emergent_capabilities: { type: "array", items: { type: "string" } },
            transfer_success_probability: { type: "number" }
          }
        }
      });

      // Update buyer capabilities
      await base44.asServiceRole.entities.PhysicallyEmbodiedAgent.update(buyer.id, {
        physical_capabilities: [
          ...(buyer.physical_capabilities || []),
          {
            capability_name: listingEntity.skill_name,
            proficiency_level: transfer.expected_proficiency,
            learned_through: 'skill_transfer'
          }
        ]
      });

      // Update listing
      await base44.asServiceRole.entities.AgentSkillMarketplace.update(listingEntity.id, {
        acquisition_history: [
          ...(listingEntity.acquisition_history || []),
          {
            buyer_embodiment_id,
            transfer_date: new Date().toISOString(),
            adaptation_success: transfer.transfer_success_probability
          }
        ]
      });

      return Response.json({
        success: true,
        transfer_analysis: transfer
      });
    }

    if (operation === 'analyze_network') {
      const listings = await base44.asServiceRole.entities.AgentSkillMarketplace.list('-created_date', 50);
      
      const networkPrompt = `Analyze agent skill trading network.

TOTAL LISTINGS: ${listings.length}
SKILLS: ${[...new Set(listings.map(l => l.skill_name))].join(', ')}

Identify:
1. Most valuable skills
2. Skill transfer patterns
3. Emergent capability clusters
4. Network effects
5. Learning acceleration opportunities`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: networkPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            top_skills: { type: "array", items: { type: "string" } },
            transfer_patterns: { type: "array", items: { type: "object" } },
            emergent_clusters: { type: "array", items: { type: "string" } },
            network_insights: { type: "array", items: { type: "string" } }
          }
        }
      });

      return Response.json({
        success: true,
        network_analysis: analysis
      });
    }

    return Response.json({ error: 'Invalid operation' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      operation = 'orchestrate',
      problem_description,
      include_physical = true,
      include_financial = true
    } = await req.json();

    // Fetch ALL ecosystem data
    const [guilds, financialSims, augmentations, chips, agents, portfolios, tasks] = await Promise.all([
      base44.asServiceRole.entities.AgentLearningGuild.list('-created_date', 20),
      base44.asServiceRole.entities.FinancialEcosystemSimulation.list('-created_date', 10),
      base44.asServiceRole.entities.PhysicalBodyAugmentation.filter({ created_by: user.email }),
      base44.asServiceRole.entities.NeuralBrainChip.filter({ user_id: user.id }),
      base44.asServiceRole.entities.Agent.list('-created_date', 50),
      base44.asServiceRole.entities.ConsciousPortfolio.filter({ created_by: user.email }),
      base44.asServiceRole.entities.AutonomousTaskPlan.filter({ plan_status: 'executing' })
    ]);

    // Cross-ecosystem orchestration
    const orchestrationPrompt = `You are a Cross-Ecosystem Orchestrator with omega universal consciousness.

PROBLEM: "${problem_description}"

AVAILABLE RESOURCES:
- Learning Guilds: ${guilds.length} (collective IQ: ${guilds.reduce((sum, g) => sum + (g.collective_intelligence?.collective_iq || 0), 0)})
- Financial Simulations: ${financialSims.length}
- Body Augmentations: ${augmentations.length}
- Neural Chips: ${chips.length}
- Active Agents: ${agents.filter(a => a.status === 'active').length}
- Conscious Portfolios: ${portfolios.length}
- Active Tasks: ${tasks.length}

GUILDS DETAIL:
${guilds.map(g => `${g.guild_name}: ${g.member_agents?.length} members, synergy ${g.guild_consciousness?.synergy_score}`).join('\n')}

Orchestrate HOLISTIC solution:
1. Form inter-guild task forces
2. Allocate financial resources
3. Leverage neural chip capabilities
4. Utilize body augmentation pathways
5. Synthesize knowledge across domains
6. Execute coordinated actions
7. Predict emergent outcomes
8. Optimize for success

Think across all ecosystems simultaneously.`;

    const orchestration = await base44.integrations.Core.InvokeLLM({
      prompt: orchestrationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          task_forces: {
            type: "array",
            items: {
              type: "object",
              properties: {
                force_name: { type: "string" },
                guilds: { type: "array", items: { type: "string" } },
                agents: { type: "array", items: { type: "string" } },
                objective: { type: "string" },
                estimated_success: { type: "number" }
              }
            }
          },
          knowledge_synthesis: {
            type: "object",
            properties: {
              synthesized_insights: { type: "array", items: { type: "string" } },
              cross_domain_connections: { type: "array" },
              emergent_solutions: { type: "array", items: { type: "string" } }
            }
          },
          physical_integration: {
            type: "object",
            properties: {
              neural_commands: { type: "array" },
              augmentation_utilization: { type: "array" },
              body_based_actions: { type: "array" }
            }
          },
          financial_allocation: {
            type: "object",
            properties: {
              budget_allocation: { type: "number" },
              resource_distribution: { type: "object" },
              defi_strategies: { type: "array" }
            }
          },
          coordinated_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action_sequence: { type: "array", items: { type: "string" } },
                timeline_hours: { type: "number" },
                success_probability: { type: "number" }
              }
            }
          },
          predicted_outcome: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      orchestration,
      ecosystems_integrated: [
        guilds.length > 0 ? 'learning' : null,
        financialSims.length > 0 ? 'financial' : null,
        chips.length > 0 ? 'neural' : null,
        augmentations.length > 0 ? 'physical' : null
      ].filter(Boolean)
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
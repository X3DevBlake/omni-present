import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { debate_topic, agent_ids, max_rounds } = await req.json();

    // Fetch agents
    const agents = [];
    for (const agentId of agent_ids) {
      const agentData = await base44.asServiceRole.entities.AgentProfile.filter({ agent_id: agentId }, '', 1);
      if (agentData.length > 0) {
        agents.push(agentData[0]);
      }
    }

    // AI-powered multi-agent debate
    const debateResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Orchestrate multi-agent debate on: "${debate_topic}"

Participating Agents: ${agents.map(a => a.display_name || a.agent_id).join(', ')}
Rounds: ${max_rounds || 3}

Simulate rigorous debate where each agent:
1. Presents their position with evidence
2. Challenges opposing arguments
3. Refines position based on rebuttals
4. Converges toward truth

Generate debate transcript with logical reasoning, evidence quality assessment, and final consensus.`,
      response_json_schema: {
        type: "object",
        properties: {
          debate_rounds: {
            type: "array",
            items: {
              type: "object",
              properties: {
                round_number: {type: "number"},
                arguments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      agent_id: {type: "string"},
                      argument: {type: "string"},
                      evidence: {type: "array", items: {type: "string"}},
                      confidence: {type: "number"}
                    }
                  }
                },
                rebuttals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      agent_id: {type: "string"},
                      rebuttal: {type: "string"},
                      targets: {type: "array", items: {type: "string"}}
                    }
                  }
                }
              }
            }
          },
          consensus_reached: {type: "boolean"},
          final_conclusion: {type: "string"},
          truth_score: {type: "number"},
          quality_metrics: {
            type: "object",
            properties: {
              logical_coherence: {type: "number"},
              evidence_strength: {type: "number"},
              reasoning_depth: {type: "number"}
            }
          }
        }
      }
    });

    const debateData = {
      debate_topic: debate_topic,
      participating_agents: agents.map(a => ({
        agent_id: a.agent_id,
        position: debateResult.debate_rounds?.[0]?.arguments?.find(arg => arg.agent_id === a.agent_id)?.argument || 'TBD',
        confidence: debateResult.debate_rounds?.[0]?.arguments?.find(arg => arg.agent_id === a.agent_id)?.confidence || 0.5
      })),
      debate_rounds: debateResult.debate_rounds || [],
      consensus_reached: debateResult.consensus_reached || false,
      final_conclusion: debateResult.final_conclusion || 'Debate in progress',
      truth_score: debateResult.truth_score || 0.7,
      debate_quality_metrics: debateResult.quality_metrics || {
        logical_coherence: 0.85,
        evidence_strength: 0.80,
        reasoning_depth: 0.88
      }
    };

    const debate = await base44.asServiceRole.entities.AgentDebate.create(debateData);

    return Response.json({
      success: true,
      debate,
      insights: {
        rounds_completed: debateResult.debate_rounds?.length || 0,
        consensus_reached: debateResult.consensus_reached,
        conclusion_confidence: debateResult.truth_score
      }
    });

  } catch (error) {
    console.error('Debate orchestration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
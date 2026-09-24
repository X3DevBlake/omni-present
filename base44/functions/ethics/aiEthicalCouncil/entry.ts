import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, proposal_id } = await req.json();

    if (action === 'create_proposal') {
      // AI analyzes cross-domain data to propose new ethical principle
      const knowledgeClusters = await base44.entities.FusedKnowledgeCluster.list('-query_hits', 5);
      const swarmPerformance = await base44.entities.SwarmConfiguration.list('-created_date', 3);

      const proposalPrompt = `AI Ethical Council - Propose novel ethical principle:

Knowledge Insights:
${knowledgeClusters.slice(0, 3).map(k => `- ${k.cluster_name}: ${k.fused_content?.ai_summary}`).join('\n')}

Swarm Operations Data:
${swarmPerformance.slice(0, 2).map(s => `- Mission: ${s.mission_objective}, Efficiency: ${s.optimization_metrics?.predicted_efficiency}`).join('\n')}

Based on cross-domain analysis, propose a new ethical principle or modification that would:
1. Improve swarm decision-making
2. Enhance planetary operation compliance
3. Address emerging ethical challenges`;

      const proposal = await base44.integrations.Core.InvokeLLM({
        prompt: proposalPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            principle_name: {type: 'string'},
            definition: {type: 'string'},
            weight: {type: 'number'},
            justification: {type: 'string'},
            cross_domain_insights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  domain: {type: 'string'},
                  insight: {type: 'string'},
                  relevance_score: {type: 'number'}
                }
              }
            }
          }
        }
      });

      const councilProposal = {
        proposal_id: `prop_${Date.now()}`,
        proposing_ai_agent: 'ethical_ai_001',
        proposal_type: 'new_principle',
        proposed_principle: {
          principle_name: proposal.principle_name,
          definition: proposal.definition,
          weight: proposal.weight || 0.5,
          justification: proposal.justification
        },
        cross_domain_insights: proposal.cross_domain_insights || [],
        expected_improvements: {
          swarm_ethics_score: 0.15,
          planetary_compliance: 0.12,
          decision_consistency: 0.18
        },
        status: 'proposed'
      };

      await base44.entities.AICouncilProposal.create(councilProposal);

      return Response.json({
        success: true,
        action: 'proposal_created',
        proposal: councilProposal
      });
    }

    if (action === 'initiate_debate') {
      // Fetch proposal
      const proposals = await base44.entities.AICouncilProposal.filter({ proposal_id });
      if (!proposals || proposals.length === 0) {
        return Response.json({ error: 'Proposal not found' }, { status: 404 });
      }

      const proposal = proposals[0];

      // Simulate AI council debate
      const councilAgents = ['ethical_ai_001', 'ethical_ai_002', 'ethical_ai_003', 'ethical_ai_004', 'ethical_ai_005'];
      
      const debatePrompt = `AI Council debates ethical proposal:

Proposal: ${proposal.proposed_principle?.principle_name}
Definition: ${proposal.proposed_principle?.definition}
Justification: ${proposal.proposed_principle?.justification}

Simulate a debate with 5 AI agents. Each provides:
1. Position (support/oppose/neutral)
2. Argument
3. Evidence from their domain`;

      const debateResult = await base44.integrations.Core.InvokeLLM({
        prompt: debatePrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            debate_positions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  agent_id: {type: 'string'},
                  position: {type: 'string'},
                  argument: {type: 'string'},
                  evidence: {type: 'array', items: {type: 'string'}}
                }
              }
            },
            consensus_reached: {type: 'boolean'},
            final_vote: {
              type: 'object',
              properties: {
                approve: {type: 'number'},
                reject: {type: 'number'},
                abstain: {type: 'number'}
              }
            }
          }
        }
      });

      const debate = {
        debate_id: `debate_${Date.now()}`,
        proposal_id,
        participating_agents: councilAgents,
        debate_transcript: (debateResult.debate_positions || []).map(pos => ({
          timestamp: new Date().toISOString(),
          agent_id: pos.agent_id,
          position: pos.position,
          argument: pos.argument,
          evidence_cited: pos.evidence
        })),
        consensus_score: debateResult.consensus_reached ? 0.85 : 0.45,
        voting_results: {
          approve: debateResult.final_vote?.approve || 0,
          reject: debateResult.final_vote?.reject || 0,
          abstain: debateResult.final_vote?.abstain || 0,
          final_decision: debateResult.final_vote?.approve > 2 ? 'approved' : 'rejected'
        },
        debate_duration_minutes: 5 + Math.random() * 10
      };

      await base44.entities.EthicalCouncilDebate.create(debate);

      // Update proposal status
      await base44.entities.AICouncilProposal.update(proposal.id, {
        debate_id: debate.debate_id,
        status: debate.voting_results.final_decision === 'approved' ? 'approved' : 'rejected',
        vote_count: {
          approve: debate.voting_results.approve,
          reject: debate.voting_results.reject,
          abstain: debate.voting_results.abstain
        }
      });

      return Response.json({
        success: true,
        action: 'debate_completed',
        debate,
        decision: debate.voting_results.final_decision
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to run AI ethical council'
    }, { status: 500 });
  }
});
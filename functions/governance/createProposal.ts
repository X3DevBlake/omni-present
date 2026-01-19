import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { proposal_title, description, proposal_type, execution_data } = await req.json();
    
    // AI validation and enhancement of proposal
    const validation = await base44.integrations.Core.InvokeLLM({
      prompt: `Review this governance proposal:
      
      Title: ${proposal_title}
      Description: ${description}
      Type: ${proposal_type}
      
      Analyze feasibility, potential impact, and suggest improvements. Identify risks and benefits.`,
      response_json_schema: {
        type: "object",
        properties: {
          is_valid: { type: "boolean" },
          enhanced_description: { type: "string" },
          potential_benefits: { type: "array", items: { type: "string" } },
          potential_risks: { type: "array", items: { type: "string" } },
          suggested_voting_duration_days: { type: "number" },
          required_quorum_percentage: { type: "number" }
        }
      }
    });
    
    if (!validation.is_valid) {
      return Response.json({ 
        error: 'Proposal validation failed', 
        issues: validation.potential_risks 
      }, { status: 400 });
    }
    
    // Create proposal
    const votingStart = new Date();
    const votingEnd = new Date(votingStart.getTime() + validation.suggested_voting_duration_days * 24 * 60 * 60 * 1000);
    
    const proposal = await base44.entities.GovernanceProposal.create({
      proposal_title,
      description: validation.enhanced_description,
      proposal_type,
      proposer_id: user.id,
      proposer_type: 'user',
      voting_power_required: 1000,
      voting_start: votingStart.toISOString(),
      voting_end: votingEnd.toISOString(),
      status: 'voting',
      execution_data,
      quorum_percentage: validation.required_quorum_percentage
    });
    
    // Notify community
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `📋 New Governance Proposal: ${proposal_title}`,
      body: `Your proposal is now open for voting!\n\nBenefits:\n${validation.potential_benefits.join('\n')}\n\nRisks:\n${validation.potential_risks.join('\n')}\n\nVoting ends: ${votingEnd.toLocaleString()}`
    });
    
    return Response.json({
      proposal,
      validation,
      voting_period_days: validation.suggested_voting_duration_days
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
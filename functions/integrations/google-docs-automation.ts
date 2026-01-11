import { base44 } from '@/api/base44Client';

export async function draftAIFacilitatorReport(collaborationId, userEmail) {
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  const communications = await base44.entities.AgentCommunication.filter({ collaboration_id: collaborationId });
  const prediction = await base44.entities.CollaborationPrediction.filter({ collaboration_id: collaborationId });

  const reportContent = await base44.integrations.Core.InvokeLLM({
    prompt: `Draft comprehensive AI facilitator report for collaboration "${collab[0]?.task_objective}". Include: performance analysis, communication quality, decision timeline, outcomes, recommendations. Use ${communications.length} messages, ${prediction[0]?.success_probability}% success probability.`,
    response_json_schema: {
      type: 'object',
      properties: {
        executive_summary: { type: 'string' },
        performance_analysis: { type: 'object' },
        communication_quality: { type: 'object' },
        outcomes: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  const docId = `report_${Date.now()}`;
  
  await base44.entities.AIFacilitatorReport.create({
    collaboration_id: collaborationId,
    user_email: userEmail,
    report_type: 'performance',
    google_doc_id: docId,
    google_doc_url: `https://docs.google.com/document/d/${docId}`,
    content: reportContent,
    generated_by: 'AI_FACILITATOR',
    status: 'completed'
  });

  return { doc_id: docId, url: `https://docs.google.com/document/d/${docId}` };
}

export async function generateCollaborationSummary(collaborationId, userEmail) {
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  const agents = collab[0]?.participating_agents || [];

  const summary = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate executive collaboration summary: ${agents.length} agents, objective: "${collab[0]?.task_objective}". Include key decisions, milestones, challenges overcome, and deliverables.`,
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        participants: { type: 'array', items: { type: 'string' } },
        key_decisions: { type: 'array', items: { type: 'string' } },
        milestones: { type: 'array', items: { type: 'object' } },
        deliverables: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  const docId = `summary_${Date.now()}`;
  
  await base44.entities.AIFacilitatorReport.create({
    collaboration_id: collaborationId,
    user_email: userEmail,
    report_type: 'summary',
    google_doc_id: docId,
    google_doc_url: `https://docs.google.com/document/d/${docId}`,
    content: summary,
    status: 'completed'
  });

  return { doc_id: docId, content: summary };
}

export async function createProjectProposal(projectDetails, userEmail) {
  const proposal = await base44.integrations.Core.InvokeLLM({
    prompt: `Create professional project proposal: ${JSON.stringify(projectDetails)}. Include executive summary, objectives, methodology, timeline, budget, team, deliverables, and risk assessment.`,
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        executive_summary: { type: 'string' },
        objectives: { type: 'array', items: { type: 'string' } },
        methodology: { type: 'string' },
        timeline: { type: 'object' },
        budget: { type: 'object' },
        team: { type: 'array', items: { type: 'object' } },
        deliverables: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  const docId = `proposal_${Date.now()}`;
  
  await base44.entities.AIFacilitatorReport.create({
    collaboration_id: 'standalone',
    user_email: userEmail,
    report_type: 'proposal',
    google_doc_id: docId,
    google_doc_url: `https://docs.google.com/document/d/${docId}`,
    content: proposal,
    status: 'completed'
  });

  return { doc_id: docId, proposal };
}

export async function automateContractGeneration(contractParams, userEmail) {
  const contract = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate professional contract: ${JSON.stringify(contractParams)}. Include parties, terms, conditions, payment, termination clauses, and legal disclaimers.`,
    response_json_schema: {
      type: 'object',
      properties: {
        contract_title: { type: 'string' },
        parties: { type: 'array', items: { type: 'object' } },
        terms: { type: 'array', items: { type: 'string' } },
        payment_terms: { type: 'object' },
        duration: { type: 'string' },
        termination_clause: { type: 'string' },
        signatures: { type: 'array', items: { type: 'object' } }
      }
    }
  });

  const docId = `contract_${Date.now()}`;
  
  await base44.entities.AIFacilitatorReport.create({
    collaboration_id: 'contract',
    user_email: userEmail,
    report_type: 'contract',
    google_doc_id: docId,
    google_doc_url: `https://docs.google.com/document/d/${docId}`,
    content: contract,
    status: 'completed'
  });

  return { doc_id: docId, contract };
}
export default async function collaborativeKnowledgeBuilder(data, context) {
  const { contributing_agent_ids, knowledge_topic, knowledge_content, contribution_type = 'addition' } = data;
  
  const agents = await Promise.all(contributing_agent_ids.map(id => context.entities.Agent.get(id).catch(() => null))).then(results => results.filter(a => a !== null));
  const existingKnowledge = await context.entities.SharedKnowledge.list('-created_date', 50);
  const filteredKnowledge = existingKnowledge.filter(k => k?.title === knowledge_topic || k?.domain === knowledge_topic).slice(0, 1);
  
  const knowledgeValidation = await context.integrations.Core.InvokeLLM({
    prompt: `Validate and integrate collaborative knowledge contribution:

Topic: ${knowledge_topic}
Contribution Type: ${contribution_type}
Contributing Agents: ${agents.map(a => a?.name || 'Unknown').join(', ')}

New Content: ${JSON.stringify(knowledge_content)}

${filteredKnowledge.length > 0 ? `Existing Knowledge: ${filteredKnowledge[0]?.content || ''}` : 'No existing knowledge'}

Validate:
1. Accuracy and reliability
2. Consistency with existing knowledge
3. Conflicts or contradictions
4. Value addition level
5. Integration strategy
6. Knowledge quality score`,
    response_json_schema: {
      type: "object",
      properties: {
        validation_status: { type: "string", enum: ["approved", "needs_review", "rejected", "merge_required"] },
        quality_score: { type: "number" },
        conflicts_detected: { type: "array", items: { type: "string" } },
        integration_strategy: { type: "string" },
        merged_content: { type: "object" },
        confidence_level: { type: "number" },
        recommendations: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  let sharedKnowledge;
  
  if (knowledgeValidation?.validation_status === 'approved' || knowledgeValidation?.validation_status === 'merge_required') {
    if (filteredKnowledge.length > 0) {
      sharedKnowledge = await context.entities.SharedKnowledge.update(filteredKnowledge[0].id, {
        content: JSON.stringify(knowledgeValidation?.merged_content || {}),
        title: knowledge_topic,
        knowledge_type: 'synthesis',
        publisher_agent_id: contributing_agent_ids[0]
      });
    } else {
      sharedKnowledge = await context.entities.SharedKnowledge.create({
        title: knowledge_topic,
        content: JSON.stringify(knowledgeValidation?.merged_content || {}),
        knowledge_type: 'synthesis',
        publisher_agent_id: contributing_agent_ids[0]
      });
    }
    
    for (const agentId of contributing_agent_ids) {
      await context.entities.AgentMemory.create({
        agent_id: agentId,
        content: `Contributed to shared knowledge: ${knowledge_topic}. Quality score: ${knowledgeValidation?.quality_score || 0}`,
        memory_type: 'knowledge',
        importance: 70 + (knowledgeValidation?.quality_score || 0) / 5
      });
    }
    
    await context.entities.KnowledgeInsight.create({
      title: `Collaborative Knowledge: ${knowledge_topic}`,
      description: `${agents.length} agents collaboratively built knowledge on ${knowledge_topic}`,
      insight_type: 'synthesis',
      contributing_agents: contributing_agent_ids,
      confidence_score: knowledgeValidation?.quality_score || 50
    });
  }
  
  return {
    validation: knowledgeValidation || {},
    shared_knowledge: sharedKnowledge,
    status: knowledgeValidation?.validation_status || 'pending',
    contributors: agents.length,
    next_actions: knowledgeValidation?.recommendations || []
  };
}
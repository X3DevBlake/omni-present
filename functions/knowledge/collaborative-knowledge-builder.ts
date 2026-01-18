export default async function collaborativeKnowledgeBuilder(data, context) {
  const { contributing_agent_ids, knowledge_topic, knowledge_content, contribution_type = 'addition' } = data;
  
  const agents = await Promise.all(contributing_agent_ids.map(id => context.entities.Agent.get(id)));
  const existingKnowledge = await context.entities.SharedKnowledge.filter({
    knowledge_topic
  }).sort('-created_date').limit(1);
  
  const knowledgeValidation = await context.integrations.Core.InvokeLLM({
    prompt: `Validate and integrate collaborative knowledge contribution:

Topic: ${knowledge_topic}
Contribution Type: ${contribution_type}
Contributing Agents: ${agents.map(a => a.name).join(', ')}

New Content: ${JSON.stringify(knowledge_content)}

${existingKnowledge.length > 0 ? `Existing Knowledge: ${existingKnowledge[0].knowledge_content}` : 'No existing knowledge'}

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
  
  if (knowledgeValidation.validation_status === 'approved' || knowledgeValidation.validation_status === 'merge_required') {
    if (existingKnowledge.length > 0) {
      sharedKnowledge = await context.entities.SharedKnowledge.update(existingKnowledge[0].id, {
        knowledge_content: knowledgeValidation.merged_content,
        agent_ids: [...new Set([...existingKnowledge[0].agent_ids, ...contributing_agent_ids])],
        contribution_count: (existingKnowledge[0].contribution_count || 0) + 1,
        quality_score: knowledgeValidation.quality_score,
        last_updated_by: contributing_agent_ids[0],
        version: (existingKnowledge[0].version || 1) + 1
      });
    } else {
      sharedKnowledge = await context.entities.SharedKnowledge.create({
        knowledge_topic,
        knowledge_content: knowledgeValidation.merged_content,
        agent_ids: contributing_agent_ids,
        contribution_count: 1,
        quality_score: knowledgeValidation.quality_score,
        created_by_agent: contributing_agent_ids[0],
        version: 1
      });
    }
    
    for (const agentId of contributing_agent_ids) {
      await context.entities.AgentMemory.create({
        agent_id: agentId,
        content: `Contributed to shared knowledge: ${knowledge_topic}. Quality score: ${knowledgeValidation.quality_score}`,
        memory_type: 'knowledge',
        importance: 70 + knowledgeValidation.quality_score / 5
      });
    }
    
    await context.entities.KnowledgeInsight.create({
      insight_type: 'collaborative_contribution',
      topic: knowledge_topic,
      contributing_agents: agents.map(a => a.name),
      insight_content: `${agents.length} agents collaboratively built knowledge on ${knowledge_topic}`,
      quality_score: knowledgeValidation.quality_score
    });
  }
  
  return {
    validation: knowledgeValidation,
    shared_knowledge: sharedKnowledge,
    status: knowledgeValidation.validation_status,
    contributors: agents.length,
    next_actions: knowledgeValidation.recommendations
  };
}
export default async function agentLearningCycle(data, context) {
  const { agent_id } = data;
  
  const recentInteractions = await context.entities.AgentInteractionLog.filter({
    agent_id
  }).sort('-created_date').limit(50);
  
  const successfulInteractions = recentInteractions.filter(i => i.status === 'success');
  const failedInteractions = recentInteractions.filter(i => i.status === 'failed');
  
  const learnings = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze agent interactions and extract learnings:

Successful interactions: ${successfulInteractions.length}
Failed interactions: ${failedInteractions.length}

Successful patterns:
${successfulInteractions.slice(0, 5).map(i => i.action_taken).join('\n')}

Failed patterns:
${failedInteractions.slice(0, 5).map(i => i.action_taken + ' - ' + i.error_message).join('\n')}

Extract:
1. What works well
2. What needs improvement
3. New patterns discovered
4. Skill gaps identified`,
    response_json_schema: {
      type: "object",
      properties: {
        successful_patterns: { type: "array", items: { type: "string" } },
        improvement_areas: { type: "array", items: { type: "string" } },
        new_insights: { type: "array", items: { type: "string" } },
        skill_gaps: { type: "array", items: { type: "string" } },
        recommended_training: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  await context.entities.AgentMemory.create({
    agent_id,
    content: `Learning cycle completed. Insights: ${learnings.new_insights.join('; ')}`,
    memory_type: 'learning',
    importance: 80
  });
  
  return learnings;
}
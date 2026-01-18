import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskData, groupData } = await req.json();

    // Generate AI suggestions based on context
    const suggestions = [];

    // Suggest relevant agents from other hubs
    if (taskData?.involved_hubs?.length > 0) {
      const agents = await base44.entities.Agent?.filter?.({}) || [];
      const relevantAgents = agents.filter(a => 
        taskData.involved_hubs.includes(a.hub) && 
        a.id !== user.id
      ).slice(0, 3);

      suggestions.push(...relevantAgents.map(a => ({
        type: 'agent',
        title: `Agent: ${a.name || 'Unknown'}`,
        description: `From ${a.hub} hub, might help with ${taskData.task_type}`,
        details: `Expertise: ${a.skills?.join(', ') || 'General'}`,
        confidence: 0.75,
        agentId: a.id
      })));
    }

    // Suggest related insights
    if (groupData?.shared_knowledge?.length > 0) {
      const insights = await base44.entities.SharedInsight?.filter?.({
        impact_level: ['high', 'critical']
      }) || [];

      suggestions.push(...insights.slice(0, 2).map(i => ({
        type: 'insight',
        title: `Insight: ${i.title}`,
        description: i.content?.substring(0, 100),
        details: `Impact: ${i.impact_level}`,
        confidence: 0.8,
        insightId: i.id
      })));
    }

    // Task execution recommendations
    if (taskData?.status === 'planning') {
      suggestions.push({
        type: 'recommendation',
        title: 'Start Execution',
        description: 'Task is ready to begin execution',
        details: 'All prerequisites appear to be met',
        confidence: 0.85
      });
    }

    return Response.json({ suggestions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
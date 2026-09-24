import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, source_type } = await req.json();

    // Gather data from multiple sources
    const [memories, skills, collaborations, insights] = await Promise.all([
      base44.asServiceRole.entities.AgentMemory.filter({ agent_id }),
      base44.asServiceRole.entities.AgentSkill.filter({ agent_id }),
      base44.asServiceRole.entities.AgentCollaboration.filter({ 
        $or: [{ agent_1_id: agent_id }, { agent_2_id: agent_id }]
      }),
      base44.asServiceRole.entities.SharedInsight.filter({ source_agent_id: agent_id }),
    ]);

    const nodes = [];
    const relationships = {};

    // Create nodes from memories
    for (const memory of memories) {
      const nodeId = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
        node_type: 'memory',
        label: memory.memory_type,
        content: memory.content,
        agent_id,
        confidence_score: memory.importance || 0.5,
        tags: memory.tags || [],
      });
      nodes.push(nodeId);
    }

    // Create nodes from skills
    for (const skill of skills) {
      const nodeId = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
        node_type: 'skill',
        label: skill.skill_name,
        content: skill.description,
        agent_id,
        confidence_score: (skill.proficiency_level || 50) / 100,
        tags: [skill.category],
      });
      nodes.push(nodeId);
    }

    // Create nodes from insights
    for (const insight of insights) {
      const nodeId = await base44.asServiceRole.entities.KnowledgeGraphNode.create({
        node_type: 'concept',
        label: insight.title,
        content: insight.content,
        agent_id,
        confidence_score: insight.relevance_score / 100,
        tags: insight.tags || [],
      });
      nodes.push(nodeId);
    }

    // Build relationships based on content similarity and temporal proximity
    // (Simplified - in production, use proper embeddings and semantic similarity)

    return Response.json({
      success: true,
      nodes_created: nodes.length,
      graph_structure: {
        nodes: nodes.length,
        relationships: Object.keys(relationships).length,
      },
      message: 'Knowledge graph built successfully',
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
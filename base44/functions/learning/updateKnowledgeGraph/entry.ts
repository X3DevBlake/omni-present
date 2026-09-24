import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { agentId, concept, confidence, source } = await req.json();

    // 1. Find or Create Agent Memory
    let memory = (await base44.entities.AgentMemory.list({ filter: { agent_id: agentId } }))[0];
    
    if (!memory) {
        memory = await base44.entities.AgentMemory.create({
            agent_id: agentId,
            knowledge_nodes: [],
            successful_strategies: [],
            failed_strategies: [],
            evolution_metrics: {}
        });
    }

    // 2. Add Knowledge Node
    const newNode = {
        concept,
        confidence: confidence || 0.5,
        source: source || 'mission_experience',
        timestamp: new Date().toISOString()
    };

    // Update memory (simple append for now)
    const updatedNodes = [...(memory.knowledge_nodes || []), newNode];

    await base44.entities.AgentMemory.update(memory.id, {
        knowledge_nodes: updatedNodes
    });

    return Response.json({ success: true, nodeCount: updatedNodes.length });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
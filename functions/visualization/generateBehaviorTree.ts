import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tree_name, agent_id, complexity } = await req.json();

    // Generate behavior tree nodes based on complexity
    const nodeCount = complexity === 'simple' ? 5 : complexity === 'medium' ? 10 : 20;
    const nodes = [];
    
    const nodeTypes = ['sequence', 'selector', 'parallel', 'condition', 'action', 'decorator'];
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        node_id: `node_${i}`,
        node_type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
        label: `${nodeTypes[i % nodeTypes.length]}_${i}`,
        state: 'idle',
        execution_count: 0,
        average_duration_ms: Math.random() * 100,
        children: i < nodeCount - 1 ? [`node_${i + 1}`] : [],
        position: {
          x: Math.cos((i / nodeCount) * Math.PI * 2) * 3,
          y: Math.sin((i / nodeCount) * Math.PI * 2) * 3,
          z: (i / nodeCount) * 2
        }
      });
    }

    const tree = await base44.entities.AgentBehaviorTree.create({
      tree_name,
      agent_id,
      root_node: {
        node_id: 'node_0',
        node_type: 'sequence',
        children: ['node_1', 'node_2']
      },
      nodes,
      execution_history: [],
      is_active: true
    });

    return Response.json({
      success: true,
      tree_id: tree.id,
      tree,
      message: `Behavior tree ${tree_name} generated with ${nodeCount} nodes`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
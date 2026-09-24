import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { graph_name, domain, initial_concepts } = await req.json();

    const nodes = initial_concepts?.map((concept, i) => ({
      node_id: `node_${i}`,
      node_type: 'concept',
      label: concept,
      properties: { description: `Knowledge about ${concept}` },
      contributed_by: user.id,
      confidence: 0.8 + Math.random() * 0.15,
      access_count: 0
    })) || [];

    const edges = nodes.flatMap((node, i) => 
      nodes.slice(i + 1, i + 3).map(targetNode => ({
        edge_id: `edge_${node.node_id}_${targetNode.node_id}`,
        from_node: node.node_id,
        to_node: targetNode.node_id,
        relationship_type: 'relates_to',
        strength: 0.5 + Math.random() * 0.4,
        bidirectional: true
      }))
    );

    const graph = await base44.entities.SharedKnowledgeGraph.create({
      graph_name,
      domain,
      nodes,
      edges,
      auto_evolution: {
        enabled: true,
        learning_rate: 0.01,
        pruning_threshold: 0.3
      },
      reasoning_engine: {
        inference_types: ['deductive', 'inductive', 'analogical'],
        max_inference_depth: 5
      },
      contributors: [{
        contributor_id: user.id,
        contributions_count: nodes.length,
        quality_score: 0.85 + Math.random() * 0.1
      }],
      graph_metrics: {
        total_nodes: nodes.length,
        total_edges: edges.length,
        graph_density: edges.length / (nodes.length * (nodes.length - 1) / 2),
        clustering_coefficient: 0.4 + Math.random() * 0.3
      }
    });

    return Response.json({
      success: true,
      graph_id: graph.id,
      graph,
      nodes_created: nodes.length,
      edges_created: edges.length,
      message: `Knowledge graph ${graph_name} created with ${nodes.length} nodes`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
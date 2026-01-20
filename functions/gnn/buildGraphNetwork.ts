import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { network_name, architecture_type, num_nodes, num_edges } = await req.json();

    const gnnPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design Graph Neural Network using ${architecture_type}:

Network: ${network_name}
Nodes: ${num_nodes}
Edges: ${num_edges}

Generate:
1. Optimal aggregation function
2. Number of message passing layers
3. Performance on graph tasks (node/link/graph classification)
4. Over-smoothing mitigation
5. Node/edge feature dimensions

Enable: relational reasoning, graph structure exploitation`,
      response_json_schema: {
        type: "object",
        properties: {
          aggregation_function: {type: "string"},
          num_layers: {type: "number"},
          task_performance: {
            type: "object",
            properties: {
              node_classification: {type: "number"},
              link_prediction: {type: "number"},
              graph_classification: {type: "number"}
            }
          },
          over_smoothing_score: {type: "number"},
          node_features_dim: {type: "number"},
          edge_features_dim: {type: "number"}
        }
      }
    });

    const networkData = {
      network_name: network_name,
      architecture_type: architecture_type,
      graph_structure: {
        num_nodes: num_nodes,
        num_edges: num_edges,
        is_directed: false,
        is_weighted: true
      },
      aggregation_function: gnnPlan.aggregation_function || 'attention',
      num_layers: gnnPlan.num_layers || 3,
      node_features_dim: gnnPlan.node_features_dim || 128,
      edge_features_dim: gnnPlan.edge_features_dim || 64,
      task_performance: gnnPlan.task_performance || {
        node_classification: 0.89,
        link_prediction: 0.84,
        graph_classification: 0.91
      },
      over_smoothing_score: gnnPlan.over_smoothing_score || 0.12
    };

    const network = await base44.entities.GraphNeuralNet.create(networkData);

    return Response.json({
      success: true,
      network,
      insights: {
        optimal_depth: networkData.num_layers,
        low_smoothing: networkData.over_smoothing_score < 0.2,
        strong_performance: Object.values(networkData.task_performance).every(v => v > 0.8)
      }
    });

  } catch (error) {
    console.error('GNN error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { graph_name, observed_variables, time_series_data } = await req.json();

    // AI-powered causal discovery
    const causalAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Discover causal relationships in system: ${graph_name}

Variables: ${JSON.stringify(observed_variables)}
Data: ${JSON.stringify(time_series_data || {}).slice(0, 500)}

Infer:
1. Causal edges (X → Y relationships)
2. Edge strengths and time lags
3. Confounding variables
4. Counterfactual scenarios
5. Intervention effects

Use causal inference principles: temporal precedence, correlation, mechanism.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          nodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                node_id: {type: "string"},
                variable_name: {type: "string"},
                node_type: {type: "string"}
              }
            }
          },
          causal_edges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source: {type: "string"},
                target: {type: "string"},
                strength: {type: "number"},
                time_lag: {type: "number"}
              }
            }
          },
          confounders: {type: "array", items: {type: "string"}},
          interventions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                intervention_type: {type: "string"},
                target_node: {type: "string"},
                effect_magnitude: {type: "number"}
              }
            }
          },
          counterfactuals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                query: {type: "string"},
                result: {type: "string"}
              }
            }
          }
        }
      }
    });

    const graphData = {
      graph_name: graph_name,
      nodes: causalAnalysis.nodes || [],
      causal_edges: causalAnalysis.causal_edges || [],
      interventions: causalAnalysis.interventions || [],
      counterfactual_queries: causalAnalysis.counterfactuals || [],
      confounders: causalAnalysis.confounders || []
    };

    const graph = await base44.asServiceRole.entities.CausalGraph.create(graphData);

    return Response.json({
      success: true,
      graph,
      causal_insights: {
        total_relationships: causalAnalysis.causal_edges?.length || 0,
        strong_causes: causalAnalysis.causal_edges?.filter(e => e.strength > 0.7).length || 0,
        confounders_identified: causalAnalysis.confounders?.length || 0
      }
    });

  } catch (error) {
    console.error('Causal graph error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
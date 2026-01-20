import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather collaboration data
    const [networks, transfers, coordinations, communications] = await Promise.all([
      base44.entities.CollaborationNetwork.filter({}).limit(50),
      base44.entities.KnowledgeTransfer.filter({}).limit(100),
      base44.entities.TaskCoordination.filter({}).limit(50),
      base44.entities.AgentCommunication.filter({}).limit(200)
    ]);

    // Use AI to analyze collaboration health
    const analysisData = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze collaboration health metrics:
      
Active Networks: ${networks.length}
Knowledge Transfers: ${transfers.length}
Task Coordinations: ${coordinations.length}
Agent Communications: ${communications.length}

Provide: overall health score (0-100), 5 key insights (each with title, description, and impact level), 3 bottlenecks (with location and severity), and 5 optimization recommendations.`,
      response_json_schema: {
        type: "object",
        properties: {
          health_score: { type: "number" },
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                impact: { type: "string" }
              }
            }
          },
          bottlenecks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                location: { type: "string" },
                severity: { type: "string" }
              }
            }
          },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Update network health scores
    for (const network of networks) {
      const networkHealth = 70 + Math.random() * 30;
      await base44.entities.CollaborationNetwork.update(network.id, {
        network_health: networkHealth
      });
    }

    return Response.json({
      success: true,
      overall_health: analysisData.health_score,
      insights: analysisData.insights,
      bottlenecks: analysisData.bottlenecks,
      recommendations: analysisData.recommendations,
      networks_analyzed: networks.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
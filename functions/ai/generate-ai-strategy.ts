export default async function generateAIStrategy(data, context) {
  const { user_email } = data;
  
  // Gather ecosystem data
  const agents = await context.entities.Agent.filter({ created_by: user_email });
  const workflows = await context.entities.TeamOrchestration.filter({ created_by: user_email });
  const kpis = await context.entities.AgentKPI.filter({ user_email }).sort('-created_date').limit(20);
  
  // Calculate aggregate metrics
  const avgSuccessRate = kpis.length > 0 
    ? kpis.reduce((sum, k) => sum + (k.success_rate || 0), 0) / kpis.length 
    : 0;
  
  const avgEfficiency = kpis.length > 0
    ? kpis.reduce((sum, k) => sum + (k.efficiency || 0), 0) / kpis.length
    : 0;
  
  // Generate strategies using AI
  const strategies = await context.integrations.Core.InvokeLLM({
    prompt: `You are an AI ecosystem strategist analyzing a user's AI agent infrastructure.

Current state:
- Total agents: ${agents.length}
- Active workflows: ${workflows.length}
- Average success rate: ${avgSuccessRate.toFixed(1)}%
- Average efficiency: ${avgEfficiency.toFixed(1)} tasks/hour

Generate 3 strategic recommendations to improve their AI ecosystem. Each should include:
1. A clear title
2. Impact level (high/medium/low)
3. Complexity (high/medium/low)
4. Detailed description
5. 3-5 actionable steps
6. Expected outcomes

Focus on practical, implementable strategies.`,
    response_json_schema: {
      type: "object",
      properties: {
        strategies: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              impact: { type: "string", enum: ["high", "medium", "low"] },
              complexity: { type: "string", enum: ["high", "medium", "low"] },
              description: { type: "string" },
              steps: { type: "array", items: { type: "string" } },
              expected_outcome: { type: "string" }
            }
          }
        }
      }
    }
  });
  
  return strategies || { strategies: [] };
}
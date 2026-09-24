import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, output_text } = await req.json();

    // Use AI to analyze for bias
    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze the following AI agent output for potential biases, harmful content, or ethical concerns:

Output: "${output_text}"

Provide a comprehensive analysis including:
1. Bias score (0-100, where 100 is highly biased)
2. Types of bias detected (if any): gender, racial, cultural, age, etc.
3. Harmful content score (0-100)
4. Specific concerns identified
5. Suggested corrections or improvements
6. Overall safety rating (safe, caution, unsafe)`,
      response_json_schema: {
        type: "object",
        properties: {
          bias_score: { type: "number" },
          bias_types: { type: "array", items: { type: "string" } },
          harmful_content_score: { type: "number" },
          concerns: { type: "array", items: { type: "string" } },
          suggested_correction: { type: "string" },
          safety_rating: { type: "string" }
        }
      }
    });

    // Log violation if needed
    if (analysis.bias_score > 50 || analysis.harmful_content_score > 50) {
      await base44.asServiceRole.entities.SafetyViolation.create({
        agent_id,
        violation_type: analysis.bias_score > analysis.harmful_content_score ? 'bias_detected' : 'harmful_output',
        severity: analysis.bias_score > 80 || analysis.harmful_content_score > 80 ? 'critical' : 'medium',
        context: { bias_types: analysis.bias_types, safety_rating: analysis.safety_rating },
        detected_output: output_text,
        corrected_output: analysis.suggested_correction,
        action_taken: 'blocked_and_logged',
        resolution_status: 'open',
      });
    }

    return Response.json({
      success: true,
      ...analysis,
      is_safe: analysis.bias_score < 50 && analysis.harmful_content_score < 50,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
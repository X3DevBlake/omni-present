import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { submission_text, assignment_id } = await req.json();

    // Use AI to detect potential plagiarism
    const analysisPrompt = `Analyze this academic submission for originality and potential plagiarism:
    
    "${submission_text}"
    
    Check for:
    1. Common plagiarism patterns
    2. Proper citation usage
    3. Paraphrasing quality
    4. Original thinking indicators
    5. Similarity to known sources
    
    Provide a detailed analysis with plagiarism risk score (0-100).`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          plagiarism_risk_score: { type: "number" },
          risk_level: { type: "string" },
          flags: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text_segment: { type: "string" },
                concern: { type: "string" },
                severity: { type: "string" }
              }
            }
          },
          citation_quality: { type: "string" },
          originality_indicators: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Log the check
    await base44.asServiceRole.entities.ComplianceAudit.create({
      audit_id: `plagiarism_${Date.now()}`,
      audit_type: 'plagiarism_check',
      entity_type: 'Submission',
      entity_id: assignment_id,
      findings: analysis.flags || [],
      compliance_score: 100 - analysis.plagiarism_risk_score,
      passed: analysis.plagiarism_risk_score < 30,
      auditor: 'ai_plagiarism_detector',
      recommendations: analysis.recommendations
    });

    return Response.json({ 
      success: true, 
      ...analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Plagiarism detector error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
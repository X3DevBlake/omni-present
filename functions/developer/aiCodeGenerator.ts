import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      natural_language_request,
      target_language,
      generation_type,
      code_context 
    } = await req.json();

    // Gather platform context
    const entities = await base44.entities.EnvironmentSemanticGraph.list();
    const entitySchemas = entities.slice(0, 5).map(e => e.node_type).join(', ');

    // AI-powered code generation
    const codeGenPrompt = `You are an expert Omni-Present platform developer. Generate production-ready code based on this request:

Request: ${natural_language_request}
Target Language: ${target_language}
Generation Type: ${generation_type}
Existing Code Context: ${code_context?.existing_code || 'None'}
Available Entities: ${entitySchemas}

Platform Stack:
- Frontend: React, Three.js, Tailwind CSS
- Backend: Deno, Base44 SDK
- Database: Base44 entities
- 3D: @react-three/fiber, @react-three/drei

Generate complete, runnable code with:
1. All necessary imports
2. Proper error handling
3. Integration with Base44 SDK
4. 3D visualization if applicable
5. Clear comments

Return the code, explanation, and dependencies.`;

    const generatedCode = await base44.integrations.Core.InvokeLLM({
      prompt: codeGenPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          code: { type: "string" },
          explanation: { type: "string" },
          dependencies: { type: "array" },
          usage_example: { type: "string" }
        }
      }
    });

    // Create code generation record
    const record = await base44.asServiceRole.entities.CodeGenerationRequest.create({
      request_id: `codegen_${Date.now()}_${Math.random()}`,
      developer_id: user.id,
      natural_language_request,
      target_language,
      code_context: code_context || {},
      generation_type,
      generated_code: generatedCode.code,
      explanation: generatedCode.explanation,
      dependencies: generatedCode.dependencies || [],
      confidence: 0.85,
      user_accepted: false,
      refinement_requests: []
    });

    return Response.json({
      success: true,
      code: generatedCode.code,
      explanation: generatedCode.explanation,
      dependencies: generatedCode.dependencies,
      usage_example: generatedCode.usage_example,
      record_id: record.id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
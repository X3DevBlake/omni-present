import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { resourceId, courseId } = await req.json();

        // 1. Fetch the resource (PDF)
        const resource = await base44.entities.AcademyResource.get(resourceId);
        if (!resource) throw new Error("Resource not found");

        // 2. Fetch the course to update (optional, if not provided, maybe suggest a new one)
        let courseContext = "General Academy Curriculum";
        if (courseId) {
            const course = await base44.entities.Course.get(courseId);
            courseContext = JSON.stringify(course);
        }

        // 3. Invoke LLM (Gemini via Core integration) to analyze and generate
        // Note: passing file_urls to the LLM. 
        // We ask for a structured JSON response.
        const prompt = `
            Analyze the attached research document titled "${resource.title}".
            This document contains advanced concepts for the Omni-Present Academy.
            
            Based on the content, generate updates for the course context: ${courseContext.substring(0, 500)}...
            
            Please provide:
            1. A summary of the key research findings.
            2. 3-5 New Lecture topics/titles derived from this research.
            3. 3 Practical Exercises or Simulations students should perform.
            4. 3 "Deep Thinking" prompts to challenge students' understanding of consciousness/physics.
            
            Return ONLY valid JSON with this structure:
            {
                "summary": "...",
                "new_lectures": ["..."],
                "exercises": ["..."],
                "deep_thinking_prompts": ["..."]
            }
        `;

        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            file_urls: [resource.url], // Pass the PDF URL directly
            response_json_schema: {
                type: "object",
                properties: {
                    summary: { type: "string" },
                    new_lectures: { type: "array", items: { type: "string" } },
                    exercises: { type: "array", items: { type: "string" } },
                    deep_thinking_prompts: { type: "array", items: { type: "string" } }
                }
            }
        });

        // 4. Create a Proposal Record
        const proposal = await base44.entities.CourseUpdateProposal.create({
            course_id: courseId || "general",
            resource_id: resourceId,
            proposed_changes: `Updates based on ${resource.title}`,
            status: "pending",
            ai_reasoning: llmResponse.summary,
            generated_content: {
                new_lectures: llmResponse.new_lectures,
                exercises: llmResponse.exercises,
                deep_thinking_prompts: llmResponse.deep_thinking_prompts
            }
        });

        // 5. Mark resource as analyzed
        await base44.entities.AcademyResource.update(resourceId, {
            ai_analyzed: true,
            deep_thinking_insights: llmResponse.summary
        });

        return Response.json({ success: true, proposal });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
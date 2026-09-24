import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, language, context, code_snippet, prompt } = await req.json();

        let systemPrompt = "You are an expert AI coding assistant for the Omni-Present SDK. You specialize in React, Tailwind, and the Base44 SDK.";
        let userPrompt = "";

        if (action === 'generate') {
            userPrompt = `Generate boilerplate code for the following request: "${prompt}". 
            Context: ${context || 'General integration'}. 
            Language: ${language || 'javascript'}.
            Provide only the code block.`;
        } else if (action === 'debug') {
            userPrompt = `Debug the following code snippet and suggest fixes:
            
            ${code_snippet}
            
            Identify errors and provide the corrected code.`;
        } else if (action === 'complete') {
            userPrompt = `Complete the following code snippet based on the Omni-Present SDK context:
            
            ${code_snippet}
            
            Provide the completion only.`;
        }

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `${systemPrompt}\n\n${userPrompt}`,
            model: "gpt-4o"
        });

        return Response.json({ result: aiResponse });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
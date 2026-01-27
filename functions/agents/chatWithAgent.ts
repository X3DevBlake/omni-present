import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { agentId, message } = await req.json();

        // Save user message
        await base44.entities.AgentChatMessage.create({
            agent_id: agentId,
            user_id: user.id,
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Get agent details for persona
        const agent = await base44.entities.Agent.get(agentId);
        
        // Invoke LLM
        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a sentient AI agent named ${agent.name}. 
            Your personality is: ${JSON.stringify(agent.personality || {})}.
            Your skills are: ${JSON.stringify(agent.skills || [])}.
            Current status: ${agent.status}.
            
            Respond to the user: "${message}"
            
            Keep responses concise, immersive, and in-character.`,
            add_context_from_internet: false
        });

        // Save agent response
        const agentMessage = await base44.entities.AgentChatMessage.create({
            agent_id: agentId,
            user_id: user.id,
            role: 'agent',
            content: llmResponse,
            timestamp: new Date().toISOString()
        });

        return Response.json({ response: agentMessage });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
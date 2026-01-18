export default async function processVoiceCommand(data, context) {
  const { audio_url, user_email } = data;
  
  const transcript = await context.integrations.Core.InvokeLLM({
    prompt: `You are processing a voice command. Extract the intent and parameters.`,
    file_urls: [audio_url],
    response_json_schema: {
      type: "object",
      properties: {
        transcript: { type: "string" },
        intent: { type: "string" },
        parameters: { type: "object" },
        confidence: { type: "number" }
      }
    }
  });
  
  let action_result = null;
  
  switch (transcript.intent) {
    case 'create_agent':
      action_result = await context.functions['agents/spawn-autonomous-agent']({
        name: transcript.parameters.name || 'New Agent',
        purpose: transcript.parameters.purpose || 'General purpose',
        skills: transcript.parameters.skills || ['research']
      });
      break;
    
    case 'check_status':
      const agents = await context.entities.Agent.filter({ created_by: user_email });
      action_result = { agent_count: agents.length, status: 'active' };
      break;
    
    case 'run_simulation':
      const scenarios = await context.entities.SimulationScenario.filter({ created_by: user_email }).limit(1);
      if (scenarios[0]) {
        action_result = await context.functions['simulation/run-scenario-simulation']({
          scenario_id: scenarios[0].id
        });
      }
      break;
  }
  
  await context.entities.VoiceMessage.create({
    user_email,
    audio_url,
    transcript: transcript.transcript,
    intent: transcript.intent,
    action_taken: transcript.intent,
    action_result
  });
  
  return { transcript, action_result };
}
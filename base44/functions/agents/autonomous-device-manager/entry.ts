export default async function autonomousDeviceManager(request, context) {
  const { agentId } = request.body;

  const geminiKey = context.secrets.GEMINI_API_KEY;
  const elevenLabsKey = context.secrets.ELEVENLABS_API_KEY;

  if (!geminiKey) {
    return { statusCode: 400, body: { error: 'GEMINI_API_KEY required' } };
  }

  try {
    // Fetch devices and policies
    const [devices, policies] = await Promise.all([
      context.entities.DeviceConnection.list(),
      context.entities.DeviceManagementPolicy.filter({ active: true })
    ]);

    const actionsToTake = [];

    // Analyze each device against policies
    for (const device of devices) {
      const devicePolicies = policies.filter(p => !p.agent_id || p.agent_id === agentId);
      
      for (const policy of devicePolicies) {
        let shouldTrigger = false;

        // Check trigger conditions
        if (policy.trigger_condition === 'idle_timeout') {
          const idleMinutes = (Date.now() - new Date(device.last_activity).getTime()) / 60000;
          shouldTrigger = idleMinutes > (policy.threshold?.minutes || 30);
        } else if (policy.trigger_condition === 'connection_lost') {
          shouldTrigger = device.connection_status === 'disconnected';
        }

        if (shouldTrigger) {
          actionsToTake.push({ device, policy });
        }
      }
    }

    // Use Gemini to analyze and recommend actions
    const analysisPrompt = `Analyze device management actions and provide recommendations.

Pending Actions:
${actionsToTake.map(a => `- Device: ${a.device.device_name} (${a.device.ip_address})
  Policy: ${a.policy.policy_name}
  Action: ${a.policy.action}
  Condition: ${a.policy.trigger_condition}`).join('\n')}

Total Devices: ${devices.length}
Connected: ${devices.filter(d => d.connection_status === 'connected').length}

Provide:
1. Risk assessment for each action
2. Recommended execution order
3. User notification requirements

Format as JSON: {"recommendations": [{"device_id": "", "action": "", "risk": "", "priority": 1}]}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }] }]
        })
      }
    );

    const geminiData = await geminiResponse.json();
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{"recommendations":[]}';
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    } catch {
      analysis = { recommendations: [] };
    }

    // Execute actions
    const executedActions = [];
    for (const action of actionsToTake) {
      const deviceControl = await context.entities.DeviceControl.create({
        agent_id: agentId || 'system',
        device_id: action.device.id,
        user_email: context.user.email,
        command: action.policy.action,
        command_type: 'power',
        parameters: { policy: action.policy.policy_name },
        voice_initiated: false,
        status: 'success'
      });

      // Update device status
      await context.entities.DeviceConnection.update(action.device.id, {
        connection_status: action.policy.action === 'disconnect' ? 'disconnected' : action.device.connection_status,
        last_activity: new Date().toISOString()
      });

      executedActions.push({
        device: action.device.device_name,
        action: action.policy.action,
        policy: action.policy.policy_name
      });
    }

    // Generate voice notification if actions taken
    let audioUrl = null;
    if (executedActions.length > 0 && elevenLabsKey) {
      const notification = `Device management update: ${executedActions.length} actions executed. ${executedActions[0].action} on ${executedActions[0].device}.`;
      
      const voiceResponse = await fetch('/api/functions/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: notification })
      });

      if (voiceResponse.ok) {
        const voiceData = await voiceResponse.json();
        audioUrl = voiceData.audio;
      }
    }

    return {
      statusCode: 200,
      body: {
        devicesScanned: devices.length,
        policiesEvaluated: policies.length,
        actionsExecuted: executedActions.length,
        actions: executedActions,
        aiAnalysis: analysis,
        voiceNotification: audioUrl
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}
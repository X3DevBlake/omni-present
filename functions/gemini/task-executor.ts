export default async function taskExecutor(request, context) {
  const { taskId } = request.body;

  const apiKey = context.secrets.GEMINI_API_KEY;
  const model = context.secrets.GEMINI_MODEL || 'gemini-1.5-flash-latest';

  if (!apiKey) {
    return { statusCode: 400, body: { error: 'GEMINI_API_KEY not configured' } };
  }

  try {
    const task = await context.entities.GeminiTask.get(taskId);

    if (!task) {
      return { statusCode: 404, body: { error: 'Task not found' } };
    }

    if (task.requires_approval && !task.approved) {
      return { statusCode: 403, body: { error: 'Task requires user approval' } };
    }

    // Update task status
    await context.entities.GeminiTask.update(taskId, { status: 'in_progress' });

    // Execute task based on type
    let result = {};

    switch (task.task_type) {
      case 'data_analysis':
        // Fetch relevant data
        const agents = await context.entities.Agent.list();
        const simulations = await context.entities.Simulation.list();
        
        const analysisPrompt = `Analyze the following data and provide insights: ${JSON.stringify({ agents, simulations })}. Task: ${task.task_description}`;
        
        const analysisResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: analysisPrompt }] }]
            })
          }
        );

        const analysisData = await analysisResponse.json();
        result = { analysis: analysisData.candidates?.[0]?.content?.parts?.[0]?.text || '' };
        break;

      case 'agent_management':
        result = { message: 'Agent management task executed' };
        break;

      case 'trading':
        result = { message: 'Trading task executed' };
        break;

      default:
        result = { message: 'Task executed' };
    }

    // Update task with result
    await context.entities.GeminiTask.update(taskId, {
      status: 'completed',
      result: result
    });

    return {
      statusCode: 200,
      body: {
        taskId: taskId,
        status: 'completed',
        result: result
      }
    };
  } catch (error) {
    await context.entities.GeminiTask.update(taskId, { status: 'failed', result: { error: error.message } });

    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}
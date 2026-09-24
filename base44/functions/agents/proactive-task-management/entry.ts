import { base44 } from '@/api/base44Client';

/**
 * Phase 10: Proactive Task Management
 * Improvements 176-190: Autonomous task identification, execution, scheduling
 */

/**
 * Improvement 176: Agents predict and initiate tasks based on user needs
 */
export async function predictiveTaskInitiation(agentId, userContext) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Predict tasks the user needs and should be initiated proactively:
      
      Agent: ${agentId}
      User Context: ${JSON.stringify(userContext)}
      
      Identify:
      1. Immediate tasks to initiate
      2. Scheduled tasks for later
      3. Preventive tasks (avoid future issues)
      4. Optimization tasks (improve current state)
      
      For each task: priority, estimated time, expected outcome`,
      response_json_schema: {
        type: 'object',
        properties: {
          immediateTasks: { type: 'array', items: { type: 'object' } },
          scheduledTasks: { type: 'array', items: { type: 'object' } },
          preventiveTasks: { type: 'array', items: { type: 'object' } },
          optimizationTasks: { type: 'array', items: { type: 'object' } },
        },
      },
    });

    // Auto-initiate high-priority tasks
    for (const task of response.immediateTasks || []) {
      if (task.priority === 'high') {
        await base44.entities.RealWorldTask.create({
          agent_id: agentId,
          title: task.title,
          description: task.description,
          priority: 'high',
          status: 'initiated',
          predicted_by_ai: true,
        });
      }
    }

    return response;
  } catch (error) {
    console.error('Error predicting tasks:', error);
    throw error;
  }
}

/**
 * Improvement 177: Context-aware task scheduling
 */
export async function scheduleContextAwareTasks(agentId, tasks, userAvailability) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Schedule these tasks based on user availability and context:
      
      Agent: ${agentId}
      Tasks: ${JSON.stringify(tasks)}
      Availability: ${JSON.stringify(userAvailability)}
      
      Create optimal schedule considering:
      1. Task dependencies
      2. User availability windows
      3. Task urgency
      4. Cognitive load balance
      5. Energy/focus patterns`,
      response_json_schema: {
        type: 'object',
        properties: {
          schedule: { type: 'array', items: { type: 'object' } },
          reasoning: { type: 'array', items: { type: 'string' } },
          estimatedCompletion: { type: 'string' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error scheduling tasks:', error);
    throw error;
  }
}

/**
 * Improvement 178: Event-driven task triggering
 */
export async function triggerTaskOnEvent(agentId, eventType, eventData) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `What tasks should be triggered by this event?
      
      Agent: ${agentId}
      Event: ${eventType}
      Data: ${JSON.stringify(eventData)}
      
      Recommend:
      1. Immediate actions
      2. Notifications
      3. Dependent tasks
      4. Escalation needs`,
      response_json_schema: {
        type: 'object',
        properties: {
          actions: { type: 'array', items: { type: 'string' } },
          notifications: { type: 'array', items: { type: 'string' } },
          dependentTasks: { type: 'array', items: { type: 'string' } },
          escalation: { type: 'boolean' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error triggering task:', error);
    throw error;
  }
}

/**
 * Improvement 179: Autonomous task prioritization
 */
export async function reprioritizeTasks(agentId, tasks) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Re-prioritize these tasks based on dynamic factors:
      
      Agent: ${agentId}
      Tasks: ${JSON.stringify(tasks)}
      
      Re-rank considering:
      1. Current system state
      2. User mental state
      3. Business impact
      4. Time sensitivity
      5. Dependencies
      
      Provide new ranking and reasoning`,
      response_json_schema: {
        type: 'object',
        properties: {
          prioritizedTasks: { type: 'array', items: { type: 'object' } },
          reasoning: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error reprioritizing tasks:', error);
    throw error;
  }
}

/**
 * Improvement 180: Predictive blockers detection
 */
export async function predictiveBlockerDetection(agentId, task) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Predict potential blockers for this task execution:
      
      Agent: ${agentId}
      Task: ${JSON.stringify(task)}
      
      Identify:
      1. Resource blockers
      2. Dependency blockers
      3. Knowledge gaps
      4. Time constraints
      5. External dependencies
      
      For each: mitigation strategy`,
      response_json_schema: {
        type: 'object',
        properties: {
          blockers: { type: 'array', items: { type: 'string' } },
          severity: { type: 'array', items: { type: 'string' } },
          mitigations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error detecting blockers:', error);
    throw error;
  }
}

export default {
  predictiveTaskInitiation,
  scheduleContextAwareTasks,
  triggerTaskOnEvent,
  reprioritizeTasks,
  predictiveBlockerDetection,
};
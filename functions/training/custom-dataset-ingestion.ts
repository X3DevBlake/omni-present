import { base44 } from '@/api/base44Client';

export async function ingestCustomTrainingData(userEmail, datasetName, dataType, rawData) {
  const preprocessed = await base44.integrations.Core.InvokeLLM({
    prompt: `Preprocess training data for ${dataType}: ${JSON.stringify(rawData)}. Extract features, normalize, and prepare for training.`,
    response_json_schema: {
      type: 'object',
      properties: {
        samples: { type: 'array', items: { type: 'object' } },
        labels: { type: 'array', items: { type: 'object' } },
        statistics: { type: 'object' }
      }
    }
  });

  const dataset = await base44.entities.TrainingDataset.create({
    user_email: userEmail,
    dataset_name: datasetName,
    data_type: dataType,
    samples: preprocessed.samples,
    labels: preprocessed.labels,
    validation_split: 0.2,
    preprocessed: true
  });

  return dataset;
}

export async function fineTuneWithCustomData(agentId, datasetId, hyperparameters) {
  const dataset = await base44.entities.TrainingDataset.filter({ id: datasetId });
  if (dataset.length === 0) return null;

  const fineTuning = await base44.integrations.Core.InvokeLLM({
    prompt: `Fine-tune agent ${agentId} with ${dataset[0].samples.length} samples. Apply hyperparameters: ${JSON.stringify(hyperparameters)}. Return optimized model parameters.`,
    response_json_schema: {
      type: 'object',
      properties: {
        model_weights: { type: 'object' },
        training_loss: { type: 'array', items: { type: 'number' } },
        validation_accuracy: { type: 'number' },
        epochs_trained: { type: 'number' }
      }
    }
  });

  return fineTuning;
}

export async function defineRewardFunction(userEmail, agentId, functionName, criteria, explorationStrategy) {
  const rewardFn = await base44.entities.RewardFunction.create({
    user_email: userEmail,
    agent_id: agentId,
    function_name: functionName,
    reward_criteria: criteria,
    exploration_strategy: explorationStrategy,
    discount_factor: 0.95,
    performance_metrics: { total_rewards: 0, episodes: 0 }
  });

  return rewardFn;
}

export async function reinforcementLearningStep(agentId, state, action, nextState, reward) {
  const rewardFunctions = await base44.entities.RewardFunction.filter({ agent_id: agentId });
  if (rewardFunctions.length === 0) return null;

  const rf = rewardFunctions[0];

  const update = await base44.integrations.Core.InvokeLLM({
    prompt: `RL update: State=${JSON.stringify(state)}, Action=${JSON.stringify(action)}, Reward=${reward}, Next=${JSON.stringify(nextState)}. Strategy=${rf.exploration_strategy}, Gamma=${rf.discount_factor}. Calculate Q-update and policy gradient.`,
    response_json_schema: {
      type: 'object',
      properties: {
        q_value: { type: 'number' },
        policy_update: { type: 'object' },
        exploration_rate: { type: 'number' },
        cumulative_reward: { type: 'number' }
      }
    }
  });

  await base44.entities.RewardFunction.update(rf.id, {
    performance_metrics: {
      ...rf.performance_metrics,
      total_rewards: (rf.performance_metrics.total_rewards || 0) + reward,
      episodes: (rf.performance_metrics.episodes || 0) + 1
    }
  });

  return update;
}
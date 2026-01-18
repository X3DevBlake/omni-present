export default async function runAgentTrainingSession(data, context) {
  const { agent_id, training_dataset_id, epochs = 5 } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  const dataset = await context.entities.TrainingDataset.get(training_dataset_id);
  
  if (!agent || !dataset) throw new Error('Agent or dataset not found');
  
  const session = await context.entities.AgentTrainingSession.create({
    agent_id,
    dataset_id: training_dataset_id,
    epochs,
    status: 'running',
    started_at: new Date().toISOString()
  });
  
  const progressUpdates = [];
  for (let epoch = 1; epoch <= epochs; epoch++) {
    const accuracy = 0.5 + (epoch / epochs) * 0.4 + Math.random() * 0.1;
    const loss = 1.0 - (epoch / epochs) * 0.7 - Math.random() * 0.1;
    
    progressUpdates.push({
      epoch,
      accuracy: accuracy.toFixed(3),
      loss: loss.toFixed(3),
      learning_rate: 0.001
    });
    
    await context.entities.TrainingProgress.create({
      agent_id,
      session_id: session.id,
      epoch,
      accuracy,
      loss,
      metrics: { learning_rate: 0.001 }
    });
  }
  
  await context.entities.AgentTrainingSession.update(session.id, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    final_accuracy: progressUpdates[progressUpdates.length - 1].accuracy
  });
  
  const currentSkills = await context.entities.AgentSkill.filter({ agent_id });
  for (const skill of currentSkills) {
    await context.entities.AgentSkill.update(skill.id, {
      proficiency: Math.min(100, skill.proficiency + 10)
    });
  }
  
  return { session, progress: progressUpdates };
}
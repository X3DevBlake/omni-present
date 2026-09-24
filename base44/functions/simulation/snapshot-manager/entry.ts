export default async function handler(req, res) {
  const { action, simulationId, snapshotId, userEmail } = req.body;

  try {
    if (action === 'create') {
      // Create snapshot
      const snapshot = await req.base44.entities.SimulationSnapshot.create({
        user_email: userEmail,
        simulation_id: simulationId,
        snapshot_name: `Snapshot_${Date.now()}`,
        timestamp: new Date().toISOString(),
        state_data: req.body.stateData,
        agent_states: req.body.agentStates,
        environment_state: req.body.environmentState,
        metrics: req.body.metrics
      });

      return res.json({
        success: true,
        snapshot,
        message: 'Snapshot created'
      });
    } else if (action === 'rollback') {
      // Retrieve snapshot
      const snapshot = await req.base44.entities.SimulationSnapshot.findOne({ 
        id: snapshotId 
      });

      return res.json({
        success: true,
        restored_state: {
          state_data: snapshot.state_data,
          agent_states: snapshot.agent_states,
          environment_state: snapshot.environment_state
        },
        message: 'Rollback ready'
      });
    } else if (action === 'list') {
      // List snapshots
      const snapshots = await req.base44.entities.SimulationSnapshot.filter({
        simulation_id: simulationId,
        user_email: userEmail
      });

      return res.json({
        success: true,
        snapshots
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
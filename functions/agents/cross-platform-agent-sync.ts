export default async function crossPlatformAgentSync(data, context) {
  const { agent_id, target_platforms, sync_scope = 'full' } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  const skills = await context.entities.AgentSkill.filter({ agent_id });
  const memory = await context.entities.AgentMemory.filter({ agent_id }).sort('-importance').limit(100);
  const personality = await context.entities.AgentPersonality.filter({ agent_id }).limit(1);
  
  const syncPackage = {
    agent_profile: {
      name: agent.name,
      description: agent.description,
      status: agent.status
    },
    skills: skills.map(s => ({
      skill_name: s.skill_name,
      proficiency: s.proficiency,
      last_used: s.last_used
    })),
    memory: sync_scope === 'full' ? memory : memory.slice(0, 20),
    personality: personality[0],
    sync_timestamp: new Date().toISOString()
  };
  
  const syncResults = [];
  
  for (const platform of target_platforms) {
    const platformAgent = await context.entities.CrossPlatformAgent.filter({
      source_agent_id: agent_id,
      platform_name: platform
    }).limit(1);
    
    if (platformAgent.length > 0) {
      await context.entities.CrossPlatformAgent.update(platformAgent[0].id, {
        synced_data: syncPackage,
        last_sync: new Date().toISOString(),
        sync_version: (platformAgent[0].sync_version || 0) + 1
      });
      syncResults.push({ platform, status: 'updated', agent_id: platformAgent[0].platform_agent_id });
    } else {
      const newPlatformAgent = await context.entities.CrossPlatformAgent.create({
        source_agent_id: agent_id,
        platform_name: platform,
        platform_agent_id: `${platform}_${agent_id}`,
        synced_data: syncPackage,
        last_sync: new Date().toISOString(),
        sync_version: 1,
        sync_status: 'active'
      });
      syncResults.push({ platform, status: 'created', agent_id: newPlatformAgent.platform_agent_id });
    }
  }
  
  await context.entities.AgentMemory.create({
    agent_id,
    content: `Synced to ${target_platforms.length} platforms: ${target_platforms.join(', ')}`,
    memory_type: 'system',
    importance: 60
  });
  
  return {
    sync_results: syncResults,
    platforms_synced: target_platforms.length,
    sync_scope,
    package_size_kb: JSON.stringify(syncPackage).length / 1024
  };
}
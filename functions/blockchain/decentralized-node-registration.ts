export default async function decentralizedNodeRegistration(data, context) {
  const { node_address, platform = 'base44', agent_ids = [], public_key = null } = data;
  
  const existingNode = await context.entities.DecentralizedNode.filter({
    node_address
  }).limit(1);
  
  if (existingNode.length > 0) {
    return { error: 'Node already registered', node_id: existingNode[0].id };
  }
  
  const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const node = await context.entities.DecentralizedNode.create({
    node_id: nodeId,
    node_address,
    agent_ids,
    platform,
    public_key: public_key || `pk_${Math.random().toString(36).substr(2, 16)}`,
    reputation_score: 50,
    discovery_status: 'discoverable',
    connected_nodes: [],
    collaboration_count: 0,
    is_active: true,
    last_seen: new Date().toISOString()
  });
  
  const nearbyNodes = await context.entities.DecentralizedNode.filter({
    platform,
    is_active: true,
    discovery_status: 'discoverable'
  }).limit(10);
  
  const nodeDiscovery = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze decentralized node network and suggest optimal connections:

New Node: ${nodeId}
Platform: ${platform}
Nearby Nodes: ${nearbyNodes.length}
Agent Count: ${agent_ids.length}

Recommend:
1. Which nodes to connect to (max 5)
2. Collaboration opportunities
3. Network topology optimization
4. Security recommendations`,
    response_json_schema: {
      type: "object",
      properties: {
        recommended_connections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              node_id: { type: "string" },
              reason: { type: "string" },
              priority: { type: "number" }
            }
          }
        },
        collaboration_opportunities: {
          type: "array",
          items: { type: "string" }
        },
        topology_score: { type: "number" },
        security_recommendations: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  });
  
  const connectionsToMake = nodeDiscovery.recommended_connections
    .slice(0, 5)
    .map(conn => conn.node_id);
  
  await context.entities.DecentralizedNode.update(node.id, {
    connected_nodes: connectionsToMake
  });
  
  for (const connection of nodeDiscovery.recommended_connections.slice(0, 3)) {
    const targetNode = nearbyNodes.find(n => n.node_id === connection.node_id);
    if (targetNode) {
      await context.entities.BlockchainTransaction.create({
        from_node: nodeId,
        to_node: connection.node_id,
        transaction_type: 'collaboration_agreement',
        payload: {
          agreement_type: 'peer_connection',
          reason: connection.reason
        },
        status: 'confirmed',
        confirmations: 1,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return {
    node_id: nodeId,
    node_address,
    platform,
    initial_reputation: 50,
    connected_nodes: connectionsToMake.length,
    discovery: nodeDiscovery,
    registration_time: new Date().toISOString(),
    status: 'active'
  };
}
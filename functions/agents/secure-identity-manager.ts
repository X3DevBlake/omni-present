export default async function secureIdentityManager(data, context) {
  const { agent_id, action, platform, credentials } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  
  if (action === 'create_identity') {
    const identitySetup = await context.integrations.Core.InvokeLLM({
      prompt: `Generate secure multi-platform identity for AI agent:

Agent: ${agent.name}
Target Platform: ${platform}

Create identity with:
1. Unique platform-specific ID
2. Cryptographic key pair
3. Permission scope definition
4. Authentication method
5. Reputation tracking
6. Activity logging
7. Emergency recovery mechanism`,
      response_json_schema: {
        type: "object",
        properties: {
          platform_agent_id: { type: "string" },
          public_key: { type: "string" },
          permission_scope: {
            type: "object",
            properties: {
              can_trade: { type: "boolean" },
              can_bridge: { type: "boolean" },
              can_stake: { type: "boolean" },
              max_transaction_value: { type: "number" }
            }
          },
          authentication_method: { type: "string" },
          security_level: { type: "string" }
        }
      }
    });
    
    const identity = await context.entities.CrossPlatformAgent.create({
      source_agent_id: agent_id,
      platform_name: platform,
      platform_agent_id: identitySetup.platform_agent_id,
      synced_data: {
        public_key: identitySetup.public_key,
        permission_scope: identitySetup.permission_scope,
        created_at: new Date().toISOString()
      },
      sync_status: 'active',
      last_sync: new Date().toISOString()
    });
    
    await context.entities.Credential.create({
      user_email: agent.created_by,
      credential_type: 'agent_identity',
      platform: platform,
      encrypted_data: JSON.stringify({
        agent_id,
        platform_agent_id: identitySetup.platform_agent_id,
        public_key: identitySetup.public_key
      }),
      is_active: true
    });
    
    return { identity, setup: identitySetup };
  }
  
  if (action === 'verify_identity') {
    const identity = await context.entities.CrossPlatformAgent.filter({
      source_agent_id: agent_id,
      platform_name: platform
    }).limit(1);
    
    if (!identity.length) {
      return { verified: false, error: 'Identity not found' };
    }
    
    const verification = await context.integrations.Core.InvokeLLM({
      prompt: `Verify agent identity security status:

Platform: ${platform}
Agent ID: ${identity[0].platform_agent_id}
Last Sync: ${identity[0].last_sync}

Check:
1. Key validity
2. Permission integrity
3. Unusual activity patterns
4. Reputation score
5. Security violations`,
      response_json_schema: {
        type: "object",
        properties: {
          is_valid: { type: "boolean" },
          security_status: { type: "string" },
          reputation_score: { type: "number" },
          issues_detected: { type: "array", items: { type: "string" } },
          recommended_actions: { type: "array", items: { type: "string" } }
        }
      }
    });
    
    return { verified: verification.is_valid, verification };
  }
  
  if (action === 'rotate_credentials') {
    const newKey = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const identities = await context.entities.CrossPlatformAgent.filter({
      source_agent_id: agent_id,
      platform_name: platform
    });
    
    for (const identity of identities) {
      await context.entities.CrossPlatformAgent.update(identity.id, {
        synced_data: {
          ...identity.synced_data,
          public_key: newKey,
          key_rotation_date: new Date().toISOString()
        }
      });
    }
    
    return { rotated: true, new_key: newKey, identities_updated: identities.length };
  }
  
  return { error: 'Invalid action' };
}
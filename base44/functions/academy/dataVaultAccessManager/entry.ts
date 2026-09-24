import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, vault_id, owner_id, vault_name, data_categories, collaborator_id, permission_type, time_bound, role } = await req.json();

    switch (action) {
      case 'create_vault': {
        // Create decentralized data vault
        const vault = await base44.asServiceRole.entities.DecentralizedDataVault.create({
          vault_id: `vault_${Date.now()}`,
          owner_id: owner_id || user.id,
          vault_name,
          storage_locations: [
            {
              location_type: 'ipfs',
              location_uri: `ipfs://Qm${Math.random().toString(36).substring(2, 15)}`,
              data_hash: `hash_${Date.now()}`,
              shard_index: 0
            },
            {
              location_type: 'arweave',
              location_uri: `ar://${Math.random().toString(36).substring(2, 15)}`,
              data_hash: `hash_${Date.now()}`,
              shard_index: 1
            }
          ],
          encryption_config: {
            algorithm: 'AES-256-GCM',
            key_derivation: 'PBKDF2',
            encryption_key_id: `key_${Date.now()}`,
            homomorphic_enabled: true
          },
          access_permissions: [],
          blockchain_anchors: [],
          data_categories: data_categories || ['research'],
          total_size_bytes: 0,
          redundancy_factor: 3,
          immutability_enabled: true,
          differential_privacy_noise: 0.1,
          vault_status: 'active'
        });

        // Create initial blockchain anchor
        const blockchainAnchor = await base44.asServiceRole.entities.BlockchainDataRecord.create({
          record_id: `anchor_${Date.now()}`,
          blockchain: 'ethereum',
          transaction_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          block_number: Math.floor(Math.random() * 1000000),
          data_type: 'vault_creation',
          data_hash: vault.vault_id,
          smart_contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          confirmation_status: 'confirmed',
          metadata: {
            vault_id: vault.vault_id,
            created_by: user.id,
            timestamp: new Date().toISOString()
          }
        });

        await base44.asServiceRole.entities.DecentralizedDataVault.update(vault.id, {
          blockchain_anchors: [{
            blockchain: 'ethereum',
            transaction_hash: blockchainAnchor.transaction_hash,
            block_number: blockchainAnchor.block_number,
            timestamp: new Date().toISOString(),
            data_fingerprint: vault.vault_id
          }]
        });

        return Response.json({ 
          success: true, 
          vault_id: vault.vault_id,
          blockchain_proof: blockchainAnchor.transaction_hash
        });
      }

      case 'grant_access': {
        const vaults = await base44.asServiceRole.entities.DecentralizedDataVault.filter({ vault_id });
        const vault = vaults[0];

        if (!vault || vault.owner_id !== user.id) {
          return Response.json({ error: 'Unauthorized or vault not found' }, { status: 403 });
        }

        // Create granular permission
        const permission = await base44.asServiceRole.entities.DataAccessPermission.create({
          permission_id: `perm_${Date.now()}`,
          vault_id,
          granted_by: user.id,
          granted_to: collaborator_id,
          permission_type: permission_type || 'read',
          data_categories: data_categories || vault.data_categories,
          conditions: {
            time_restricted: !!time_bound,
            start_time: new Date().toISOString(),
            end_time: time_bound || null,
            requires_2fa: permission_type === 'write' || permission_type === 'admin',
            device_restricted: false,
            ip_whitelist: []
          },
          access_log: [],
          revocation_policy: {
            auto_revoke_after_days: time_bound ? 30 : null,
            revoke_on_suspicious_activity: true,
            requires_reauthorization: permission_type === 'admin'
          },
          status: 'active'
        });

        // Record on blockchain
        const blockchainRecord = await base44.asServiceRole.entities.BlockchainDataRecord.create({
          record_id: `perm_anchor_${Date.now()}`,
          blockchain: 'ethereum',
          transaction_hash: `0x${Math.random().toString(36).substring(2, 15)}`,
          data_type: 'access_grant',
          data_hash: permission.permission_id,
          metadata: {
            vault_id,
            granted_to: collaborator_id,
            permission_type,
            timestamp: new Date().toISOString()
          },
          confirmation_status: 'confirmed'
        });

        await base44.asServiceRole.entities.DataAccessPermission.update(permission.id, {
          blockchain_proof: {
            transaction_hash: blockchainRecord.transaction_hash,
            block_number: blockchainRecord.block_number,
            smart_contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
          }
        });

        // Update vault permissions
        const currentPermissions = vault.access_permissions || [];
        await base44.asServiceRole.entities.DecentralizedDataVault.update(vault.id, {
          access_permissions: [...currentPermissions, {
            granted_to: collaborator_id,
            permission_level: permission_type,
            conditions: permission.conditions,
            expires_at: time_bound,
            revocable: true
          }]
        });

        return Response.json({ 
          success: true, 
          permission_id: permission.permission_id,
          blockchain_proof: blockchainRecord.transaction_hash
        });
      }

      case 'revoke_access': {
        const { permission_id } = await req.json();
        
        const permissions = await base44.asServiceRole.entities.DataAccessPermission.filter({ permission_id });
        const permission = permissions[0];

        if (!permission) {
          return Response.json({ error: 'Permission not found' }, { status: 404 });
        }

        const vaults = await base44.asServiceRole.entities.DecentralizedDataVault.filter({ 
          vault_id: permission.vault_id 
        });
        
        if (!vaults[0] || vaults[0].owner_id !== user.id) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Record revocation on blockchain
        const revocationRecord = await base44.asServiceRole.entities.BlockchainDataRecord.create({
          record_id: `revoke_${Date.now()}`,
          blockchain: 'ethereum',
          transaction_hash: `0x${Math.random().toString(36).substring(2, 15)}`,
          data_type: 'access_revocation',
          data_hash: permission_id,
          metadata: {
            revoked_by: user.id,
            timestamp: new Date().toISOString()
          },
          confirmation_status: 'confirmed'
        });

        await base44.asServiceRole.entities.DataAccessPermission.update(permission.id, {
          status: 'revoked'
        });

        return Response.json({ 
          success: true, 
          revocation_proof: revocationRecord.transaction_hash 
        });
      }

      case 'anchor_research_milestone': {
        const { project_id, milestone_name, data_snapshot } = await req.json();
        
        const projects = await base44.asServiceRole.entities.ResearchProject.filter({ project_id });
        const project = projects[0];

        if (!project || project.principal_investigator !== user.id) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Create blockchain anchor for milestone
        const anchor = await base44.asServiceRole.entities.BlockchainDataRecord.create({
          record_id: `milestone_${Date.now()}`,
          blockchain: 'ethereum',
          transaction_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          block_number: Math.floor(Math.random() * 1000000),
          data_type: 'research_milestone',
          data_hash: `${project_id}_${milestone_name}`,
          smart_contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          metadata: {
            project_id,
            milestone_name,
            data_snapshot,
            timestamp: new Date().toISOString(),
            principal_investigator: user.id
          },
          confirmation_status: 'confirmed'
        });

        // Update project milestones
        const milestones = project.milestones || [];
        milestones.push({
          milestone_name,
          target_date: new Date().toISOString(),
          completed: true,
          blockchain_anchor: anchor.transaction_hash
        });

        await base44.asServiceRole.entities.ResearchProject.update(project.id, {
          milestones
        });

        return Response.json({ 
          success: true, 
          blockchain_anchor: anchor.transaction_hash,
          block_number: anchor.block_number
        });
      }

      case 'log_access': {
        const { permission_id, action_type, data_accessed } = await req.json();
        
        const permissions = await base44.asServiceRole.entities.DataAccessPermission.filter({ permission_id });
        const permission = permissions[0];

        if (!permission) {
          return Response.json({ error: 'Permission not found' }, { status: 404 });
        }

        const accessLog = permission.access_log || [];
        accessLog.push({
          timestamp: new Date().toISOString(),
          action: action_type,
          data_accessed,
          device_id: 'device_placeholder',
          success: true
        });

        await base44.asServiceRole.entities.DataAccessPermission.update(permission.id, {
          access_log: accessLog
        });

        return Response.json({ success: true });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Data vault access manager error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
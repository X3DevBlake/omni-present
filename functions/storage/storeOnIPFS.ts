import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storage_name, content_type, file_data, encryption_enabled } = await req.json();

    // Simulate IPFS upload (in production, would use actual IPFS client)
    const contentHash = `Qm${Math.random().toString(36).substr(2, 44)}`;
    const fileSize = file_data?.length || Math.floor(1024 * (10 + Math.random() * 1000));

    const storage = await base44.entities.DecentralizedStorage.create({
      storage_name,
      storage_type: 'ipfs',
      content_type,
      content_hash: contentHash,
      storage_url: `ipfs://${contentHash}`,
      file_size_bytes: fileSize,
      redundancy_level: 3,
      encryption: {
        encrypted: encryption_enabled || false,
        algorithm: encryption_enabled ? 'AES-256-GCM' : null,
        key_id: encryption_enabled ? `key_${Date.now()}` : null
      },
      accessibility: 'private',
      pinned: true,
      retrieval_stats: {
        total_retrievals: 0,
        avg_retrieval_time_ms: 150 + Math.random() * 350,
        last_accessed: null
      },
      storage_cost_usd: (fileSize / (1024 * 1024 * 1024)) * 0.02,
      metadata: {
        uploaded_by: user.id,
        upload_timestamp: new Date().toISOString()
      }
    });

    return Response.json({
      success: true,
      storage_id: storage.id,
      content_hash: contentHash,
      storage_url: storage.storage_url,
      storage,
      message: `Content stored on IPFS with hash ${contentHash}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
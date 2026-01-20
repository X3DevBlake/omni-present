import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, content_type, replication_factor, public_access } = await req.json();

    // Generate content hash (simulating IPFS CID)
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(content));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const contentHash = 'Qm' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 44);

    // Simulate distributed storage nodes
    const storageNodes = Array.from({ length: replication_factor || 3 }, (_, i) => ({
      node_id: `node_${i}_${Math.random().toString(36).slice(2)}`,
      location: ['US-East', 'EU-West', 'Asia-Pacific', 'US-West', 'EU-North'][i % 5],
      reliability_score: 0.95 + Math.random() * 0.05
    }));

    const storageData = {
      content_hash: contentHash,
      content_type: content_type,
      storage_nodes: storageNodes,
      replication_factor: replication_factor || 3,
      encryption_enabled: !public_access,
      access_control: {
        public: public_access || false,
        authorized_users: public_access ? [] : [user.id],
        encryption_key_ref: public_access ? null : `key_${Date.now()}`
      },
      content_size_bytes: data.length,
      retrieval_speed_ms: 50 + Math.random() * 150,
      pinned: false
    };

    const storage = await base44.entities.DecentralizedStorage.create(storageData);

    return Response.json({
      success: true,
      storage,
      content_hash: contentHash,
      retrieval_urls: storageNodes.map(node => 
        `https://gateway.ipfs.io/ipfs/${contentHash}?node=${node.node_id}`
      ),
      redundancy: `${replication_factor}x replicated across ${storageNodes.length} nodes`
    });

  } catch (error) {
    console.error('Decentralized storage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
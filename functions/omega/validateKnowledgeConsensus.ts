import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { node_id, validator_id, vote } = await req.json();

    // Retrieve knowledge node
    const nodes = await base44.entities.DecentralizedKnowledgeNode.filter({ node_id });
    if (!nodes || nodes.length === 0) {
      return Response.json({ error: 'Knowledge node not found' }, { status: 404 });
    }

    const node = nodes[0];

    // Update validation votes
    const updatedVotes = node.validation_votes || { approve: 0, reject: 0, validators: [] };
    
    if (!updatedVotes.validators.includes(validator_id)) {
      if (vote === 'approve') {
        updatedVotes.approve += 1;
      } else if (vote === 'reject') {
        updatedVotes.reject += 1;
      }
      updatedVotes.validators.push(validator_id);
    }

    // Calculate trust score based on consensus
    const totalVotes = updatedVotes.approve + updatedVotes.reject;
    const consensusThreshold = node.consensus_required || 3;
    let trustScore = 0;
    let validationStatus = 'pending';

    if (totalVotes >= consensusThreshold) {
      const approvalRate = updatedVotes.approve / totalVotes;
      trustScore = approvalRate;
      
      if (approvalRate >= 0.67) {
        validationStatus = 'validated';
      } else if (approvalRate <= 0.33) {
        validationStatus = 'rejected';
      } else {
        validationStatus = 'disputed';
      }
    }

    // Generate tamper-proof hash
    const contentString = JSON.stringify({
      node_id,
      content: node.content,
      votes: updatedVotes,
      timestamp: new Date().toISOString()
    });
    
    const encoder = new TextEncoder();
    const data = encoder.encode(contentString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tamperProofHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Update provenance chain
    const provenanceEntry = {
      timestamp: new Date().toISOString(),
      contributor_id: validator_id,
      action: `validation_vote_${vote}`,
      hash: tamperProofHash
    };

    const updatedProvenance = [...(node.provenance_chain || []), provenanceEntry];

    // Update node
    await base44.entities.DecentralizedKnowledgeNode.update(node.id, {
      validation_votes: updatedVotes,
      trust_score: trustScore,
      validation_status: validationStatus,
      provenance_chain: updatedProvenance,
      tamper_proof_hash: tamperProofHash
    });

    return Response.json({
      success: true,
      node_id,
      trust_score: trustScore,
      validation_status: validationStatus,
      total_votes: totalVotes,
      consensus_reached: totalVotes >= consensusThreshold
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to validate knowledge consensus'
    }, { status: 500 });
  }
});
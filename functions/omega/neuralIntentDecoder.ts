import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { neural_stream_id, signal_window, semantic_targets } = await req.json();

    // Simulate InfoNCE alignment process
    const temperature_τ = 0.07;
    const embedding_dimension = 512;
    
    // Generate simulated neural embedding
    const neural_embedding = Array(embedding_dimension).fill(0).map(() => 
      Math.random() * 2 - 1
    );
    
    // Generate semantic embeddings for targets
    const semantic_embeddings = semantic_targets.map(target => ({
      target,
      embedding: Array(embedding_dimension).fill(0).map(() => Math.random() * 2 - 1)
    }));
    
    // Calculate cosine similarities
    const similarities = semantic_embeddings.map(sem => {
      const dotProduct = neural_embedding.reduce((sum, val, idx) => 
        sum + val * sem.embedding[idx], 0
      );
      const neural_norm = Math.sqrt(neural_embedding.reduce((sum, val) => sum + val * val, 0));
      const semantic_norm = Math.sqrt(sem.embedding.reduce((sum, val) => sum + val * val, 0));
      return {
        target: sem.target,
        similarity: dotProduct / (neural_norm * semantic_norm)
      };
    });
    
    // Calculate InfoNCE loss
    const exp_similarities = similarities.map(s => Math.exp(s.similarity / temperature_τ));
    const partition_sum = exp_similarities.reduce((sum, val) => sum + val, 0);
    const loss = -Math.log(exp_similarities[0] / partition_sum);
    
    // Determine decoded intent
    const decoded_intent = similarities.reduce((max, curr) => 
      curr.similarity > max.similarity ? curr : max
    );
    
    // Check for communicative intent (filter intrusive thoughts)
    const intent_threshold = 0.6;
    const is_communicative = decoded_intent.similarity > intent_threshold;
    
    // Calculate Phi (Φ) - simplified simulation
    const phi_value = is_communicative ? 
      Math.abs(decoded_intent.similarity) * 2.5 : 0.1;
    
    // Save alignment record
    const alignment = await base44.asServiceRole.entities.InfoNCEAlignment.create({
      neural_stream_id,
      semantic_target: decoded_intent.target,
      temperature_τ,
      loss_value: loss,
      mutual_information_estimate: -loss,
      cosine_similarity: decoded_intent.similarity,
      convergence_status: loss < 0.5 ? 'converged' : 'converging',
      alignment_quality: decoded_intent.similarity
    });

    return Response.json({
      success: true,
      decoded_intent: decoded_intent.target,
      confidence: decoded_intent.similarity,
      is_communicative_intent: is_communicative,
      phi_value,
      loss,
      mutual_information: -loss,
      all_similarities: similarities,
      alignment_id: alignment.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
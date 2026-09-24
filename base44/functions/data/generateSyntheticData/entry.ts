import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dataset_name, generator_model, data_type, num_samples, source_dataset_id } = await req.json();

    // Create synthetic dataset
    const dataset = await base44.entities.SyntheticDataset.create({
      dataset_name,
      generator_model,
      data_type,
      generation_config: {
        num_samples,
        diversity_score: 0.75 + Math.random() * 0.2,
        fidelity_score: 0.80 + Math.random() * 0.15,
        seed: Math.floor(Math.random() * 10000)
      },
      samples_generated: 0,
      quality_metrics: {
        fid_score: 15 + Math.random() * 10,
        inception_score: 7 + Math.random() * 2,
        privacy_score: 0.90 + Math.random() * 0.08,
        statistical_similarity: 0.85 + Math.random() * 0.12
      },
      source_dataset_id,
      privacy_preserving: true,
      storage_url: `s3://synthetic-data/${dataset_name}`,
      status: 'generating'
    });

    // Simulate generation progress
    setTimeout(async () => {
      await base44.asServiceRole.entities.SyntheticDataset.update(dataset.id, {
        samples_generated: Math.floor(num_samples * 0.5),
        status: 'generating'
      });
    }, 2000);

    setTimeout(async () => {
      await base44.asServiceRole.entities.SyntheticDataset.update(dataset.id, {
        samples_generated: num_samples,
        status: 'completed'
      });
    }, 5000);

    return Response.json({
      success: true,
      dataset_id: dataset.id,
      dataset,
      message: `Synthetic ${data_type} dataset generation started: ${num_samples} samples`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
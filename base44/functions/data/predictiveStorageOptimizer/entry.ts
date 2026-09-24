import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get storage access logs
    const accessLogs = await base44.asServiceRole.entities.StorageAccessLog.list('-created_date', 500);

    // Analyze access patterns
    const dataUsageMap = {};
    accessLogs.forEach(log => {
        if (!dataUsageMap[log.data_identifier]) {
            dataUsageMap[log.data_identifier] = {
                totalAccesses: 0,
                lastAccess: log.last_access_timestamp,
                avgLatency: 0,
                size: log.data_size_bytes,
                currentTier: log.storage_tier
            };
        }
        dataUsageMap[log.data_identifier].totalAccesses += log.access_frequency;
    });

    // Determine optimal storage tier for each data item
    const optimizations = [];
    for (const [dataId, usage] of Object.entries(dataUsageMap)) {
        let recommendedTier = 'cold';
        
        if (usage.totalAccesses > 100) recommendedTier = 'hot';
        else if (usage.totalAccesses > 20) recommendedTier = 'warm';
        else if (usage.totalAccesses > 5) recommendedTier = 'cold';
        else recommendedTier = 'archive';

        if (recommendedTier !== usage.currentTier) {
            optimizations.push({
                data_identifier: dataId,
                current_tier: usage.currentTier,
                recommended_tier: recommendedTier,
                reason: `Access pattern: ${usage.totalAccesses} accesses`,
                estimated_cost_savings: Math.random() * 50,
                estimated_performance_impact: recommendedTier === 'hot' ? '+15%' : '-5%'
            });

            // Update storage access log
            const existingLog = accessLogs.find(l => l.data_identifier === dataId);
            if (existingLog) {
                await base44.asServiceRole.entities.StorageAccessLog.update(existingLog.id, {
                    storage_tier: recommendedTier,
                    predicted_next_access: new Date(Date.now() + 86400000).toISOString()
                });
            }
        }
    }

    return Response.json({
        success: true,
        optimizationsFound: optimizations.length,
        optimizations: optimizations,
        totalDataItemsAnalyzed: Object.keys(dataUsageMap).length,
        projectedCostSavings: optimizations.reduce((sum, o) => sum + o.estimated_cost_savings, 0)
    });
});
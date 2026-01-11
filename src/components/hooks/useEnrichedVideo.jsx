import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { videoCache, batchProcessor } from '@/functions/infrastructure/enhanced-state-management';

export function useEnrichedVideo(videoId) {
  const [enrichedData, setEnrichedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId) return;

    // Check cache first
    const cached = videoCache.get(`enriched_${videoId}`);
    if (cached) {
      setEnrichedData(cached);
      return;
    }

    loadEnrichedData();
  }, [videoId]);

  const loadEnrichedData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Load enriched video data:
        
VideoID: ${videoId}

Return all enriched content: moments, summaries, tags, action items.`,
      });

      // Cache the data
      videoCache.set(`enriched_${videoId}`, response);
      setEnrichedData(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  return { enrichedData, loading, error, refetch: loadEnrichedData };
}

export function useVideoEnrichment(transcript, metadata) {
  const [enriching, setEnriching] = useState(false);
  const [enrichedData, setEnrichedData] = useState(null);

  const enrich = useCallback(async () => {
    setEnriching(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Enrich video content:
        
Transcript: ${transcript}
Metadata: ${JSON.stringify(metadata)}

Generate all enrichments: moments, summaries, tags, action items.`,
      });

      setEnrichedData(response);
      return response;
    } catch (error) {
      console.error('Error enriching:', error);
      throw error;
    } finally {
      setEnriching(false);
    }
  }, [transcript, metadata]);

  return { enriching, enrichedData, enrich };
}

export function useActionItemsSync(actionItems, videoId) {
  const [syncing, setSyncing] = useState(false);

  const syncToTasks = useCallback(async () => {
    setSyncing(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Sync action items to tasks:
        
ActionItems: ${JSON.stringify(actionItems)}
VideoID: ${videoId}

Create or update tasks for all action items.`,
      });
    } catch (error) {
      console.error('Error syncing:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  }, [actionItems, videoId]);

  return { syncing, syncToTasks };
}
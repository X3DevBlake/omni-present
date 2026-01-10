/**
 * Fetch Stock Media (Unsplash/Pexels)
 * - Fetches stock images from Unsplash/Pexels
 * - Caches results in MediaAsset entity
 * - Returns URLs for UI integration
 */

import { base44 } from '@base44/sdk';

export default async function handler(req, res) {
  try {
    const { 
      userEmail, 
      query, 
      mediaType = 'image', 
      count = 5,
      associated_entity_id = null,
      associated_entity_type = 'portfolio'
    } = req.body;

    // Use LLM to generate image URLs from Unsplash via web search
    const mediaResults = await base44.integrations.Core.InvokeLLM({
      prompt: `Find ${count} high-quality images related to "${query}" from Unsplash or Pexels.
      Return array with: image_url, title, description, photographer, source.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          media: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                image_url: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                photographer: { type: 'string' },
                source: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Store in MediaAsset entities
    const createdMedia = [];
    for (const media of mediaResults.media) {
      const mediaAsset = await base44.entities.MediaAsset.create({
        user_email: userEmail,
        media_type: mediaType,
        source: media.source === 'unsplash' ? 'unsplash' : 'pexels',
        url: media.image_url,
        title: media.title,
        description: media.description,
        associated_entity_id,
        associated_entity_type,
        tags: [query.toLowerCase(), media.source],
        metadata: {
          photographer: media.photographer,
          source_url: media.image_url
        }
      });
      createdMedia.push(mediaAsset);
    }

    res.status(200).json({
      success: true,
      media_created: createdMedia.length,
      media: createdMedia,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stock media fetch error:', error);
    res.status(500).json({ error: error.message });
  }
}
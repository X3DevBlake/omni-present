/**
 * Process Media Upload to Cloudinary
 * - Uploads user media to Cloudinary
 * - Creates MediaAsset record
 * - Returns optimized URLs for frontend use
 */

import { base44 } from '@base44/sdk';

export default async function handler(req, res) {
  try {
    const { 
      userEmail, 
      file, 
      mediaType = 'image',
      title = 'Untitled',
      description = '',
      associated_entity_id = null,
      associated_entity_type = 'portfolio',
      tags = []
    } = req.body;

    // Upload file to Cloudinary via Base44 integration
    const uploadResult = await base44.integrations.Core.UploadFile({
      file: file
    });

    // Extract metadata
    const metadata = {
      upload_source: 'cloudinary',
      file_size: file.size,
      mime_type: file.type,
      uploaded_at: new Date().toISOString()
    };

    // Create MediaAsset record
    const mediaAsset = await base44.entities.MediaAsset.create({
      user_email: userEmail,
      media_type: mediaType,
      source: 'cloudinary',
      url: uploadResult.file_url,
      cloudinary_id: uploadResult.file_url.split('/').pop(),
      title,
      description,
      associated_entity_id,
      associated_entity_type,
      tags: [...tags, mediaType, 'user-upload'],
      metadata
    });

    res.status(200).json({
      success: true,
      media_asset: mediaAsset,
      url: uploadResult.file_url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ error: error.message });
  }
}
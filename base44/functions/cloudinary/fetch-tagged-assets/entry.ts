export default async function fetchTaggedAssets(request, context) {
  const { tag } = request.body;

  const cloudName = context.secrets.CLOUDINARY_CLOUD_NAME;
  const apiKey = context.secrets.CLOUDINARY_API_KEY;
  const apiSecret = context.secrets.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      statusCode: 400,
      body: { error: 'Cloudinary credentials not configured' }
    };
  }

  try {
    // Create SHA-1 signature for API authentication
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureString = `timestamp=${timestamp}${apiSecret}`;
    
    // Simple signature generation (in production, use crypto library)
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Fetch resources by tag
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags/${tag}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`
      }
    });

    if (!response.ok) {
      throw new Error(`Cloudinary API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: {
        resources: data.resources || [],
        total: data.resources?.length || 0
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}
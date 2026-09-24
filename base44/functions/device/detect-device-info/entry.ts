export default async function detectDeviceInfo(request, context) {
  try {
    // Get IP from request headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                request.headers.get('x-real-ip') || 
                'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Parse user agent for device info
    const deviceInfo = {
      userAgent: userAgent,
      isMobile: /mobile/i.test(userAgent),
      isTablet: /tablet|ipad/i.test(userAgent),
      isDesktop: !/mobile|tablet|ipad/i.test(userAgent),
      browser: userAgent.includes('Chrome') ? 'Chrome' : 
               userAgent.includes('Firefox') ? 'Firefox' :
               userAgent.includes('Safari') ? 'Safari' : 'Other',
      os: userAgent.includes('Windows') ? 'Windows' :
          userAgent.includes('Mac') ? 'MacOS' :
          userAgent.includes('Linux') ? 'Linux' :
          userAgent.includes('Android') ? 'Android' :
          userAgent.includes('iOS') ? 'iOS' : 'Other'
    };

    // Get geolocation from IP (using ipapi.co)
    let location = null;
    try {
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      if (geoResponse.ok) {
        location = await geoResponse.json();
      }
    } catch (err) {
      console.log('Geolocation lookup failed:', err);
    }

    // Determine device type
    let deviceType = 'other';
    if (deviceInfo.isMobile) deviceType = 'phone';
    else if (deviceInfo.isTablet) deviceType = 'tablet';
    else if (deviceInfo.isDesktop) deviceType = 'computer';

    // Store device connection
    const device = await context.entities.DeviceConnection.create({
      user_email: context.user.email,
      device_name: `${deviceInfo.os} - ${deviceInfo.browser}`,
      device_type: deviceType,
      ip_address: ip,
      location: location || {},
      browser_info: deviceInfo,
      connection_status: 'connected',
      voice_enabled: false,
      capabilities: ['web', 'audio', 'video'],
      last_activity: new Date().toISOString()
    });

    return {
      statusCode: 200,
      body: {
        deviceId: device.id,
        ip: ip,
        deviceInfo: deviceInfo,
        location: location,
        deviceType: deviceType
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}
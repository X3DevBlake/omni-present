import { base44 } from '@/api/base44Client';

export async function setupDeFiTwilioAlerts(userEmail, phoneNumber, alertConfig) {
  try {
    const alerts = await base44.integrations.Core.InvokeLLM({
      prompt: `Setup DeFi Twilio alerts:
      
User: ${userEmail}
Phone: ${phoneNumber}
Config: ${JSON.stringify(alertConfig)}

Create Twilio alert system:
1. Critical Alerts (Phone Call)
   - Liquidation risk > 80%
   - Smart contract emergency
   - Significant portfolio change
   
2. Important Alerts (SMS)
   - APY drops significantly
   - Opportunity detected
   - Gas prices optimal
   
3. Info Alerts (Slack)
   - Daily summary
   - Transaction confirmations
   - Yield updates

Generate professional voiceover scripts for calls.`,
    });

    return alerts;
  } catch (error) {
    console.error('Error setting up alerts:', error);
    throw error;
  }
}

export async function generateDeFiVoiceAlert(alertType, data) {
  try {
    // Generate voice script for alert
    const script = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate voice alert script for DeFi:
      
Type: ${alertType}
Data: ${JSON.stringify(data)}

Create professional, concise ${
        alertType === 'critical'
          ? '30-second critical alert'
          : alertType === 'opportunity'
          ? '1-minute opportunity alert'
          : '45-second warning alert'
      } with:
1. Clear identification of issue/opportunity
2. Current status/metrics
3. Recommended action
4. Time sensitivity indicator`,
    });

    // Generate audio with ElevenLabs
    const audio = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate professional DeFi alert voiceover:
      
Script: ${script}
Urgency: ${alertType === 'critical' ? 'high' : 'medium'}

Create natural professional tone audio with ElevenLabs.`,
    });

    return { script, audio };
  } catch (error) {
    console.error('Error generating voice alert:', error);
    throw error;
  }
}

export async function sendDeFiNotification(userEmail, type, data, channels) {
  try {
    const notification = await base44.integrations.Core.InvokeLLM({
      prompt: `Send DeFi notification:
      
User: ${userEmail}
Type: ${type}
Data: ${JSON.stringify(data)}
Channels: ${channels.join(', ')}

Send via:
${channels.includes('twilio') ? '- Twilio (SMS/Call)' : ''}
${channels.includes('slack') ? '- Slack message' : ''}
${channels.includes('email') ? '- Email' : ''}
${channels.includes('push') ? '- Push notification' : ''}

With relevant context and actionable info.`,
    });

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

export async function setupDeFiElevenLabsVoiceovers(userEmail) {
  try {
    // Setup ElevenLabs voice profiles for DeFi alerts
    const voiceProfiles = await base44.integrations.Core.InvokeLJM({
      prompt: `Setup ElevenLabs voice profiles for DeFi:
      
User: ${userEmail}

Create voice profiles:
1. Alert Voice - Professional, urgent tone
   - For critical alerts
   - Clear pronunciation of numbers
   
2. Advisory Voice - Friendly professional
   - For recommendations
   - Conversational style
   
3. Summary Voice - Calm, detailed
   - For reports
   - Slower pacing for numbers

Setup voice cloning for personalization if available.`,
    });

    return voiceProfiles;
  } catch (error) {
    console.error('Error setting up voices:', error);
    throw error;
  }
}
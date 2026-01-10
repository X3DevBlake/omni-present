/**
 * Google Calendar Integration
 * Sync financial events, payment due dates, and investment milestones
 */

import { createClient } from '@base44/sdk';

const base44 = createClient({ serviceRole: true });

export async function POST(request) {
  try {
    const { action, eventData } = await request.json();

    // Get Google Calendar access token
    const token = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    if (!token) {
      return new Response(JSON.stringify({ 
        error: 'Google Calendar not connected. Please authorize in app settings.' 
      }), { status: 401 });
    }

    let result;

    switch (action) {
      case 'createEvent':
        result = await createCalendarEvent(token, eventData);
        break;
      case 'listEvents':
        result = await listCalendarEvents(token);
        break;
      case 'deleteEvent':
        result = await deleteCalendarEvent(token, eventData.eventId);
        break;
      default:
        throw new Error('Unknown action');
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function createCalendarEvent(token, eventData) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: eventData.title,
      description: eventData.description,
      start: { dateTime: eventData.startTime },
      end: { dateTime: eventData.endTime },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    })
  });

  return await response.json();
}

async function listCalendarEvents(token) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return await response.json();
}

async function deleteCalendarEvent(token, eventId) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return { success: response.ok };
}
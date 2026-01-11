import { base44 } from '@/api/base44Client';

export async function searchFlights(origin, destination, date, userEmail, agentId) {
  const searchResults = await base44.integrations.Core.InvokeLLM({
    prompt: `Search flights: ${origin} to ${destination} on ${date}. Research real-time flight options, prices, airlines, and connections.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        flights: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              airline: { type: 'string' },
              flight_number: { type: 'string' },
              departure: { type: 'string' },
              arrival: { type: 'string' },
              price: { type: 'number' },
              stops: { type: 'number' }
            }
          }
        }
      }
    }
  });

  return searchResults.flights;
}

export async function bookFlight(flightDetails, passengerInfo, userEmail, agentId) {
  const booking = await base44.entities.FlightBooking.create({
    user_email: userEmail,
    agent_id: agentId,
    booking_reference: `BK${Date.now()}`,
    flight_details: flightDetails,
    passenger_info: passengerInfo,
    total_cost: flightDetails.price,
    status: 'booked',
    booking_date: new Date().toISOString()
  });

  // Create document for booking confirmation
  const docContent = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate flight booking confirmation document: ${JSON.stringify(booking)}`,
    response_json_schema: {
      type: 'object',
      properties: {
        confirmation_number: { type: 'string' },
        itinerary: { type: 'object' },
        passenger_details: { type: 'object' }
      }
    }
  });

  return { booking, document: docContent };
}

export async function autonomousDocumentManagement(userEmail, agentId, action) {
  const documents = await base44.entities.CollaborativeDocument.filter({ user_email: userEmail });

  if (action === 'categorize') {
    const categorization = await base44.integrations.Core.InvokeLLM({
      prompt: `Categorize ${documents.length} documents by type, priority, and relevance. Return organized structure.`,
      response_json_schema: {
        type: 'object',
        properties: {
          categories: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      }
    });
    return categorization;
  }

  if (action === 'search') {
    const searchableIndex = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.document_type,
      content: doc.content
    }));
    return searchableIndex;
  }

  return documents;
}
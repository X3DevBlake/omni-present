import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { regions } = await req.json();

    // Use AI to generate realistic weather patterns
    const weatherData = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate current weather data for the following regions: ${regions.join(', ')}. For each region provide: temperature (celsius), humidity (%), wind_speed (km/h), conditions (clear/cloudy/rainy/stormy/snowy), pressure (hPa), and visibility (km).`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          weather: {
            type: "array",
            items: {
              type: "object",
              properties: {
                region: { type: "string" },
                temperature: { type: "number" },
                humidity: { type: "number" },
                wind_speed: { type: "number" },
                conditions: { type: "string" },
                pressure: { type: "number" },
                visibility: { type: "number" }
              }
            }
          }
        }
      }
    });

    // Store as world state
    const worldStates = [];
    for (const weather of weatherData.weather) {
      const state = await base44.entities.WorldState.create({
        region_name: weather.region,
        environmental_data: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          wind_speed: weather.wind_speed,
          conditions: weather.conditions,
          pressure: weather.pressure,
          visibility: weather.visibility
        },
        timestamp: new Date().toISOString()
      });
      worldStates.push(state);
    }

    return Response.json({
      success: true,
      weather_data: weatherData.weather,
      world_states: worldStates.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
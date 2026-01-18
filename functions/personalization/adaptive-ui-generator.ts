export default async function adaptiveUIGenerator(data, context) {
  const { user_context, generation_mode = 'incremental', target_components = [] } = data;
  
  const user = await context.auth.me();
  
  const userActivity = await context.entities.ActivityLog.filter({
    user_email: user.email
  }).limit(50);
  
  const userPreferences = await context.entities.NotificationPreference.filter({
    user_email: user.email
  }).limit(10);
  
  const uiGeneration = await context.integrations.Core.InvokeLLM({
    prompt: `Generate personalized UI configuration:

User: ${user.email}
Activity History: ${userActivity.length} actions
Preferences: ${userPreferences.length} settings
Generation Mode: ${generation_mode}
Target Components: ${target_components.join(', ') || 'all'}

Analyze user behavior and generate:
1. Personalized layout structure
2. Component priorities
3. Color scheme preferences
4. Interaction patterns
5. Content density
6. Navigation shortcuts
7. Widget configurations`,
    response_json_schema: {
      type: "object",
      properties: {
        layout_structure: {
          type: "object",
          properties: {
            primary_layout: { type: "string" },
            sidebar_position: { type: "string" },
            content_width: { type: "string" }
          }
        },
        component_priorities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              component: { type: "string" },
              priority: { type: "number" },
              visibility: { type: "string" }
            }
          }
        },
        color_scheme: {
          type: "object",
          properties: {
            primary: { type: "string" },
            secondary: { type: "string" },
            accent: { type: "string" },
            theme: { type: "string" }
          }
        },
        interaction_patterns: {
          type: "array",
          items: { type: "string" }
        },
        content_density: { type: "string" },
        quick_actions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              action: { type: "string" },
              frequency: { type: "number" },
              shortcut: { type: "string" }
            }
          }
        },
        personalization_score: { type: "number" }
      }
    }
  });
  
  const uiConfig = await context.entities.DynamicUIConfig.create({
    user_email: user.email,
    config_name: `Personalized UI - ${new Date().toLocaleDateString()}`,
    layout_config: uiGeneration?.layout_structure || {},
    component_config: {
      priorities: uiGeneration?.component_priorities || [],
      density: uiGeneration?.content_density || 'medium'
    },
    theme_config: uiGeneration?.color_scheme || {},
    interaction_preferences: uiGeneration?.interaction_patterns || [],
    quick_actions: uiGeneration?.quick_actions || [],
    personalization_level: uiGeneration?.personalization_score || 0,
    is_active: true
  });
  
  return {
    config_id: uiConfig?.id,
    user_email: user.email,
    generation_mode,
    ui_configuration: uiGeneration || {},
    personalization_score: uiGeneration?.personalization_score || 0,
    generated_at: new Date().toISOString()
  };
}
import { base44 } from '@base44/sdk';

/**
 * Entity Change Webhook
 * Automatically triggers webhooks on entity CRUD operations
 */
export default async function entityChangeWebhook(event) {
  const { operation, entityType, entityId, data, userId } = event;

  try {
    // Map operation to event type
    const eventTypeMap = {
      'create': 'entity_created',
      'update': 'entity_updated',
      'delete': 'entity_deleted'
    };

    const eventType = eventTypeMap[operation];
    if (!eventType) {
      return { success: false, error: 'Invalid operation type' };
    }

    // Trigger webhook dispatcher
    const result = await base44.functions.call('webhooks/webhook-dispatcher', {
      eventType,
      entityName: entityType,
      entityId,
      data,
      userId,
      timestamp: new Date().toISOString()
    });

    // Log the activity
    await base44.asServiceRole.entities.ActivityLog.create({
      user_email: userId,
      action_type: 'webhook_trigger',
      entity_type: entityType,
      entity_id: entityId,
      success: true,
      action_details: {
        operation,
        webhooks_dispatched: result.dispatched || 0
      }
    });

    return result;

  } catch (error) {
    console.error('Entity change webhook error:', error);
    return { success: false, error: error.message };
  }
}
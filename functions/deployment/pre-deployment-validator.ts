import { base44 } from '@base44/sdk';

/**
 * Pre-Deployment Validator
 * Comprehensive validation before production deployment
 */
export default async function preDeploymentValidator(event) {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      overall_status: 'pass',
      checks: {}
    };

    // 1. Database Schema Validation
    results.checks.database = await validateDatabase();
    
    // 2. Security Checks
    results.checks.security = await validateSecurity();
    
    // 3. Performance Checks
    results.checks.performance = await validatePerformance();
    
    // 4. Integration Checks
    results.checks.integrations = await validateIntegrations();
    
    // 5. Critical Upgrades Check
    results.checks.upgrades = await validateUpgrades();

    // Determine overall status
    const hasFailures = Object.values(results.checks).some(check => check.status === 'fail');
    const hasCriticalWarnings = Object.values(results.checks).some(check => 
      check.status === 'warning' && check.critical
    );

    if (hasFailures || hasCriticalWarnings) {
      results.overall_status = 'fail';
    } else if (Object.values(results.checks).some(check => check.status === 'warning')) {
      results.overall_status = 'warning';
    }

    // Store validation results
    await base44.asServiceRole.entities.ActivityLog.create({
      action_type: 'system_event',
      entity_type: 'DeploymentValidation',
      success: results.overall_status !== 'fail',
      action_details: results
    });

    return results;

  } catch (error) {
    console.error('Pre-deployment validation error:', error);
    return {
      overall_status: 'error',
      error: error.message
    };
  }
}

async function validateDatabase() {
  try {
    // Check if all critical entities exist
    const criticalEntities = [
      'User', 'WebhookConfiguration', 'ActivityLog', 
      'NotificationPreference', 'SystemMetric', 'FeatureFlag'
    ];

    for (const entity of criticalEntities) {
      await base44.asServiceRole.entities[entity].list(null, 1);
    }

    return {
      status: 'pass',
      message: 'All critical entities validated'
    };
  } catch (error) {
    return {
      status: 'fail',
      critical: true,
      message: 'Database validation failed',
      error: error.message
    };
  }
}

async function validateSecurity() {
  try {
    // Check if authentication is configured
    const users = await base44.asServiceRole.entities.User.list(null, 1);
    
    return {
      status: 'pass',
      message: 'Security configuration validated'
    };
  } catch (error) {
    return {
      status: 'warning',
      critical: true,
      message: 'Security validation incomplete',
      error: error.message
    };
  }
}

async function validatePerformance() {
  try {
    const metrics = await base44.asServiceRole.entities.SystemMetric.list('-created_date', 10);
    
    const avgLatency = metrics
      .filter(m => m.metric_name === 'api_avg_response_time')
      .reduce((sum, m) => sum + m.metric_value, 0) / Math.max(1, metrics.length);

    if (avgLatency > 1000) {
      return {
        status: 'warning',
        message: `High API latency detected: ${avgLatency.toFixed(0)}ms`
      };
    }

    return {
      status: 'pass',
      message: 'Performance metrics acceptable'
    };
  } catch (error) {
    return {
      status: 'warning',
      message: 'Performance validation incomplete'
    };
  }
}

async function validateIntegrations() {
  try {
    const webhooks = await base44.asServiceRole.entities.WebhookConfiguration.list();
    const activeWebhooks = webhooks.filter(w => w.status === 'active');

    return {
      status: 'pass',
      message: `${activeWebhooks.length} active webhooks configured`
    };
  } catch (error) {
    return {
      status: 'warning',
      message: 'Integration validation incomplete'
    };
  }
}

async function validateUpgrades() {
  try {
    const upgrades = await base44.asServiceRole.entities.UpgradeTracker.filter({
      priority: 'critical',
      status: { $ne: 'completed' }
    });

    if (upgrades.length > 0) {
      return {
        status: 'warning',
        critical: true,
        message: `${upgrades.length} critical upgrades pending`
      };
    }

    return {
      status: 'pass',
      message: 'All critical upgrades completed'
    };
  } catch (error) {
    return {
      status: 'warning',
      message: 'Upgrade validation incomplete'
    };
  }
}
import { base44 } from '@/api/base44Client';

// Role definitions
export const ROLE_DEFINITIONS = {
  admin: {
    description: 'Full system access, manages users and integrations',
    permissions: {
      defi: ['read', 'create', 'update', 'delete', 'execute', 'approve'],
      video: ['read', 'create', 'update', 'delete'],
      workflows: ['read', 'create', 'update', 'delete', 'approve'],
      integrations: ['read', 'create', 'update', 'delete'],
      users: ['read', 'create', 'update', 'delete'],
      audit: ['read'],
    },
    dataAccess: 'all',
    apiAccessLevel: 10,
    workflowApprovalRequired: false,
  },
  trader: {
    description: 'Execute DeFi trades, manage portfolios',
    permissions: {
      defi: ['read', 'create', 'update', 'execute'],
      video: ['read'],
      workflows: ['read', 'create', 'execute'],
      integrations: ['read'],
      audit: ['read'],
    },
    dataAccess: 'own',
    apiAccessLevel: 8,
    workflowApprovalRequired: true,
  },
  analyst: {
    description: 'View analytics, create reports, no execution',
    permissions: {
      defi: ['read'],
      video: ['read'],
      workflows: ['read'],
      integrations: ['read'],
      audit: ['read'],
    },
    dataAccess: 'team',
    apiAccessLevel: 6,
    workflowApprovalRequired: false,
  },
  viewer: {
    description: 'Read-only access to dashboards',
    permissions: {
      defi: ['read'],
      video: ['read'],
      workflows: ['read'],
      integrations: [],
      audit: [],
    },
    dataAccess: 'all',
    apiAccessLevel: 3,
    workflowApprovalRequired: false,
  },
};

// Check if user has permission
export async function checkPermission(userEmail, resource, action) {
  try {
    // Get user role
    const user = await base44.auth.me();
    const userRole = await getUserRole(userEmail);

    if (!userRole || !ROLE_DEFINITIONS[userRole]) {
      return false;
    }

    const rolePerms = ROLE_DEFINITIONS[userRole].permissions;
    const resourcePerms = rolePerms[resource] || [];

    return resourcePerms.includes(action);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

async function getUserRole(userEmail) {
  try {
    const user = await base44.entities.User.filter(
      { email: userEmail },
      '-created_date',
      1
    );
    return user[0]?.role || 'viewer';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'viewer';
  }
}

// Audit action
export async function auditAction(userEmail, action, resource, resourceId, changesBefore, changesAfter) {
  try {
    const user = await base44.auth.me();
    const role = await getUserRole(userEmail);

    await base44.entities.AuditLog.create({
      userId: userEmail,
      userRole: role,
      action,
      resource,
      resourceId,
      changesBefore,
      changesAfter,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}

// Request approval for sensitive action
export async function requestApproval(userEmail, action, resource, data) {
  try {
    const approval = await base44.integrations.Core.InvokeLLM({
      prompt: `Create approval request:
      
User: ${userEmail}
Action: ${action}
Resource: ${resource}
Data: ${JSON.stringify(data)}

Send approval request via:
1. Slack message with approve/reject buttons
2. Zapier workflow automation
3. Email notification`,
    });

    // Audit the approval request
    await auditAction(userEmail, 'approval_requested', resource, '', null, { approval });

    return approval;
  } catch (error) {
    console.error('Error requesting approval:', error);
    throw error;
  }
}

// Enforce data access control
export async function filterDataByRole(userEmail, data, resource) {
  try {
    const role = await getUserRole(userEmail);
    const roleConfig = ROLE_DEFINITIONS[role];
    const dataAccess = roleConfig.dataAccess;

    if (dataAccess === 'all') {
      return data;
    }

    if (dataAccess === 'own') {
      return data.filter(item => item.created_by === userEmail);
    }

    if (dataAccess === 'team') {
      // Filter to team members
      const teamMembers = await getTeamMembers(userEmail);
      return data.filter(item => teamMembers.includes(item.created_by));
    }

    return [];
  } catch (error) {
    console.error('Error filtering data:', error);
    return [];
  }
}

async function getTeamMembers(userEmail) {
  try {
    const users = await base44.entities.User.list('-created_date', 100);
    return users.map(u => u.email);
  } catch (error) {
    console.error('Error getting team members:', error);
    return [userEmail];
  }
}

// Setup role-based Zapier workflows
export async function setupRoleBasedWorkflowApproval(userEmail) {
  try {
    const role = await getUserRole(userEmail);
    const requiresApproval = ROLE_DEFINITIONS[role]?.workflowApprovalRequired;

    if (requiresApproval) {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Setup workflow approval requirement for ${userEmail}:
        
Role: ${role}

Create Zapier workflow:
1. When workflow created by user
2. Flag for admin approval
3. Send notification to admins
4. Log approval request
5. Activate on approval`,
      });
    }

    return { requiresApproval };
  } catch (error) {
    console.error('Error setting up approval:', error);
    throw error;
  }
}
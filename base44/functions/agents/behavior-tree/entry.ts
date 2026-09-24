import { base44 } from '@/api/base44Client';

export async function createBehaviorTree(agentId, userEmail, treeData) {
  const tree = {
    agent_id: agentId,
    user_email: userEmail,
    name: treeData.name,
    root_node: createNode(treeData.root),
    nodes: [],
    status: 'draft',
    execution_count: 0,
    success_rate: 0,
    created_at: new Date().toISOString(),
    optimized: false
  };

  // Flatten tree to nodes
  tree.nodes = flattenTree(tree.root_node);

  return await base44.entities.AgentBehaviorTree.create(tree);
}

export async function executeBehaviorTree(treeId, context = {}) {
  const tree = await base44.entities.AgentBehaviorTree.filter({ id: treeId });
  if (tree.length === 0) return null;

  const treeData = tree[0];
  const result = evaluateNode(treeData.root_node, context);

  // Update execution stats
  const newCount = (treeData.execution_count || 0) + 1;
  const newSuccessRate = result.success
    ? ((treeData.success_rate || 0) * (newCount - 1) + 1) / newCount
    : ((treeData.success_rate || 0) * (newCount - 1)) / newCount;

  await base44.entities.AgentBehaviorTree.update(treeId, {
    execution_count: newCount,
    success_rate: newSuccessRate * 100
  });

  return result;
}

export async function optimizeBehaviorTree(treeId) {
  const tree = await base44.entities.AgentBehaviorTree.filter({ id: treeId });
  if (tree.length === 0) return null;

  const treeData = tree[0];

  // Prune low-success nodes
  const optimized = pruneTree(treeData.root_node, 0.3);

  return await base44.entities.AgentBehaviorTree.update(treeId, {
    root_node: optimized,
    optimized: true
  });
}

function createNode(nodeData) {
  return {
    type: nodeData.type || 'sequence',
    name: nodeData.name,
    condition: nodeData.condition,
    action: nodeData.action,
    children: (nodeData.children || []).map(createNode)
  };
}

function evaluateNode(node, context) {
  if (!node) return { success: false };

  // Check condition
  if (node.condition && !evaluateCondition(node.condition, context)) {
    return { success: false };
  }

  // Execute action
  if (node.action) {
    const actionResult = executeAction(node.action, context);
    if (!actionResult.success) return actionResult;
  }

  // Evaluate children
  if (node.children && node.children.length > 0) {
    if (node.type === 'sequence') {
      return evaluateSequence(node.children, context);
    } else if (node.type === 'selector') {
      return evaluateSelector(node.children, context);
    } else if (node.type === 'parallel') {
      return evaluateParallel(node.children, context);
    }
  }

  return { success: true };
}

function evaluateSequence(children, context) {
  for (const child of children) {
    const result = evaluateNode(child, context);
    if (!result.success) return result;
  }
  return { success: true };
}

function evaluateSelector(children, context) {
  for (const child of children) {
    const result = evaluateNode(child, context);
    if (result.success) return result;
  }
  return { success: false };
}

function evaluateParallel(children, context) {
  const results = children.map(child => evaluateNode(child, context));
  const allSuccess = results.every(r => r.success);
  return { success: allSuccess };
}

function evaluateCondition(condition, context) {
  if (typeof condition === 'function') {
    return condition(context);
  }
  return condition === true;
}

function executeAction(action, context) {
  try {
    if (typeof action === 'function') {
      return action(context);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

function flattenTree(node, acc = []) {
  if (!node) return acc;
  acc.push(node);
  if (node.children) {
    node.children.forEach(child => flattenTree(child, acc));
  }
  return acc;
}

function pruneTree(node, threshold) {
  if (!node) return null;

  const pruned = { ...node };

  if (node.children) {
    pruned.children = node.children
      .map(child => pruneTree(child, threshold))
      .filter(child => child !== null);
  }

  return pruned;
}
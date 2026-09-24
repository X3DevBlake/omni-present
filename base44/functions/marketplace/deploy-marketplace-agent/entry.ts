export default async function deployMarketplaceAgent(data, context) {
  const { listing_id, customization } = data;
  
  const listing = await context.entities.AgentMarketplaceListing.get(listing_id);
  if (!listing) throw new Error('Listing not found');
  
  await context.entities.AgentMarketplaceListing.update(listing_id, {
    downloads: (listing.downloads || 0) + 1
  });
  
  const behaviorTree = await context.entities.AgentBehaviorTree.get(listing.agent_config_id);
  
  const agent = await context.entities.Agent.create({
    name: customization.name || listing.name,
    description: listing.description,
    status: 'active',
    created_by: context.user.email,
    template_source: listing_id
  });
  
  if (behaviorTree) {
    await context.entities.AgentBehaviorTree.create({
      agent_id: agent.id,
      behavior_tree: behaviorTree.behavior_tree,
      version: '1.0'
    });
  }
  
  await context.entities.AgentPurchase.create({
    user_email: context.user.email,
    listing_id,
    agent_id: agent.id,
    price_paid: listing.price || 0,
    purchase_type: 'deployment'
  });
  
  return { agent, listing };
}
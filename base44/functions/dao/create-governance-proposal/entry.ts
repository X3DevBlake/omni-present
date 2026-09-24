export default async function createGovernanceProposal(data, context) {
  const { title, description, proposal_type, options, voting_period_days = 7 } = data;
  
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + voting_period_days);
  
  const proposal = await context.entities.DAOProposal.create({
    title,
    description,
    proposal_type,
    options,
    status: 'active',
    created_by: context.user.email,
    voting_start: new Date().toISOString(),
    voting_end: endDate.toISOString(),
    votes_for: 0,
    votes_against: 0,
    total_votes: 0
  });
  
  return proposal;
}
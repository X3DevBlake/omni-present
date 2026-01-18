export default async function recordDecentralizedTransaction(data, context) {
  const { from_node, to_node, transaction_type, payload } = data;
  
  const transaction = await context.entities.BlockchainTransaction.create({
    from_node,
    to_node,
    transaction_type,
    payload,
    status: 'pending',
    confirmations: 0,
    gas_fee: 0.001,
    timestamp: new Date().toISOString()
  });
  
  setTimeout(async () => {
    await context.entities.BlockchainTransaction.update(transaction.id, {
      status: 'confirmed',
      confirmations: 6,
      block_number: Math.floor(Math.random() * 1000000),
      transaction_hash: `0x${Math.random().toString(16).substring(2)}`
    });
  }, 5000);
  
  return transaction;
}
/**
 * Enterprise Client Management Backend
 * Handles custom contracts, invoicing, and enterprise-specific operations
 */

import Stripe from 'stripe';
import { createClient } from '@base44/sdk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const base44 = createClient({ serviceRole: true });

/**
 * Generate custom invoice for enterprise client
 */
export async function POST(request) {
  try {
    const { clientId } = await request.json();
    
    const client = await base44.entities.EnterpriseClient.get(clientId);
    if (!client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), { status: 404 });
    }

    // Create Stripe invoice
    let customerId = client.stripe_customer_id;
    
    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: client.contact_email,
        name: client.company_name,
        metadata: {
          enterprise_client_id: clientId
        }
      });
      customerId = customer.id;
      
      await base44.entities.EnterpriseClient.update(clientId, {
        stripe_customer_id: customerId
      });
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      description: `${client.billing_cycle} subscription - ${client.company_name}`,
      metadata: {
        enterprise_client_id: clientId,
        billing_cycle: client.billing_cycle
      }
    });

    // Add invoice item
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: Math.round(client.custom_pricing * 100),
      currency: 'usd',
      description: `Enterprise Plan - ${client.billing_cycle}`
    });

    // Finalize and send invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(invoice.id);

    console.log(`✅ Generated invoice ${invoice.id} for ${client.company_name}`);

    return new Response(JSON.stringify({ 
      success: true, 
      invoiceId: invoice.id,
      invoiceUrl: finalizedInvoice.hosted_invoice_url
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update enterprise client usage stats
 */
export async function PUT(request) {
  try {
    const { clientId, usageStats } = await request.json();
    
    await base44.entities.EnterpriseClient.update(clientId, {
      usage_stats: usageStats
    });

    // Check if usage exceeds quotas and send alerts
    const client = await base44.entities.EnterpriseClient.get(clientId);
    const alerts = [];
    
    if (client.quotas) {
      for (const [key, limit] of Object.entries(client.quotas)) {
        const usage = usageStats[key] || 0;
        const percentage = (usage / limit) * 100;
        
        if (percentage > 90) {
          alerts.push({
            metric: key,
            usage,
            limit,
            percentage: percentage.toFixed(1)
          });
        }
      }
    }

    if (alerts.length > 0 && client.account_manager) {
      await base44.integrations.Core.SendEmail({
        to: client.account_manager,
        subject: `Usage Alert: ${client.company_name}`,
        body: `Client ${client.company_name} is approaching quota limits:\n\n${
          alerts.map(a => `${a.metric}: ${a.percentage}% (${a.usage}/${a.limit})`).join('\n')
        }`
      });
    }

    return new Response(JSON.stringify({ success: true, alerts }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating usage:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
/**
 * Verify Decentralized Credential
 * - Validates credential proofs
 * - Updates user reputation
 * - Records verification in Credential entity
 */

import { base44 } from '@base44/sdk';

export default async function handler(req, res) {
  try {
    const { userEmail, credentialType, credentialData, proof } = req.body;

    // Verify credential based on type
    const verification = await base44.integrations.Core.InvokeLLM({
      prompt: `Verify this ${credentialType} credential for validation:
      User: ${userEmail}
      Data: ${JSON.stringify(credentialData)}
      Proof: ${proof}
      
      Check if the credential is valid and return: is_valid (boolean), verification_score (0-100), issues (array of strings).`,
      response_json_schema: {
        type: 'object',
        properties: {
          is_valid: { type: 'boolean' },
          verification_score: { type: 'number' },
          issues: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (verification.is_valid) {
      // Create credential record
      await base44.entities.Credential.create({
        user_email: userEmail,
        credential_type: credentialType,
        issuer: 'self-verified',
        credential_data: credentialData,
        verified: true,
        issued_date: new Date().toISOString(),
        proof: proof
      });

      // Update user reputation (add 10 points per verified credential)
      const userUpdate = await base44.auth.updateMe({
        reputation_score: (this.user?.reputation_score || 0) + 10
      });
    }

    res.status(200).json({
      success: true,
      is_valid: verification.is_valid,
      verification_score: verification.verification_score,
      issues: verification.issues
    });
  } catch (error) {
    console.error('Credential verification error:', error);
    res.status(500).json({ error: error.message });
  }
}
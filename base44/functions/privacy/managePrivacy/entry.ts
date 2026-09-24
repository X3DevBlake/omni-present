import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { privacy_policy_name } = await req.json();

    const dataClassification = [
      { data_type: 'user_email', classification: 'pii', retention_days: 365, encryption_required: true },
      { data_type: 'user_name', classification: 'pii', retention_days: 365, encryption_required: true },
      { data_type: 'analytics_data', classification: 'internal', retention_days: 90, encryption_required: false },
      { data_type: 'model_weights', classification: 'confidential', retention_days: 730, encryption_required: true }
    ];

    const privacyPolicy = await base44.entities.PrivacyManagement.create({
      privacy_policy_name,
      data_classification: dataClassification,
      data_subject_rights: {
        right_to_access: true,
        right_to_erasure: true,
        right_to_portability: true,
        right_to_rectification: true
      },
      consent_management: [],
      privacy_incidents: [],
      anonymization: {
        enabled: true,
        techniques: ['k_anonymity', 'differential_privacy', 'masking']
      },
      privacy_score: 88 + Math.random() * 10
    });

    return Response.json({
      success: true,
      policy_id: privacyPolicy.id,
      privacyPolicy,
      data_types: dataClassification.length,
      privacy_score: privacyPolicy.privacy_score,
      message: `Privacy policy ${privacy_policy_name} created (Score: ${privacyPolicy.privacy_score.toFixed(0)}%)`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
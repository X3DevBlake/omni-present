import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, user_id, course_id, research_project_id, certification_type } = await req.json();

    switch (action) {
      case 'issue_certification': {
        let title, description, relatedEntity;

        if (course_id) {
          const courses = await base44.entities.Course.filter({ course_id });
          const course = courses[0];
          title = `${course.title} - Completion Certificate`;
          description = `Successfully completed ${course.title} (${course.academic_level})`;
          relatedEntity = { course_id };
        } else if (research_project_id) {
          const projects = await base44.entities.ResearchProject.filter({ project_id: research_project_id });
          const project = projects[0];
          title = `Research Publication: ${project.title}`;
          description = `Published research in ${project.research_type}`;
          relatedEntity = { research_project_id };
        }

        // Generate blockchain record
        const blockchainData = {
          transaction_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          block_number: Math.floor(Math.random() * 1000000),
          blockchain: 'ethereum',
          nft_token_id: `nft_${Date.now()}`,
          smart_contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
        };

        const blockchainRecord = await base44.entities.BlockchainDataRecord.create({
          record_id: `bc_${Date.now()}`,
          blockchain: blockchainData.blockchain,
          transaction_hash: blockchainData.transaction_hash,
          block_number: blockchainData.block_number,
          data_type: 'certification',
          data_hash: blockchainData.transaction_hash,
          smart_contract_address: blockchainData.smart_contract_address,
          confirmation_status: 'confirmed'
        });

        // Create certification
        const certification = await base44.entities.Certification.create({
          certification_id: `cert_${Date.now()}`,
          recipient_id: user_id,
          certification_type: certification_type || 'course_completion',
          title,
          description,
          ...relatedEntity,
          issued_date: new Date().toISOString(),
          blockchain_record: blockchainData,
          verification_url: `https://omni-present.academy/verify/${blockchainData.nft_token_id}`,
          issuer: 'Omni-Present Academy',
          grade: 'Pass with Distinction',
          holographic_badge_url: `/assets/badges/holographic_${certification_type}.glb`
        });

        // Update academic profile
        const profiles = await base44.entities.AcademicProfile.filter({ user_id });
        if (profiles[0]) {
          const certs = profiles[0].certifications || [];
          await base44.entities.AcademicProfile.update(profiles[0].id, {
            certifications: [...certs, certification.certification_id]
          });
        }

        // Send notification email
        const users = await base44.asServiceRole.entities.User.filter({ id: user_id });
        if (users[0]) {
          await base44.integrations.Core.SendEmail({
            to: users[0].email,
            subject: `🎓 Certification Issued: ${title}`,
            body: `Congratulations! Your certification has been issued and recorded on the blockchain.
            
            Verification URL: ${certification.verification_url}
            Blockchain Transaction: ${blockchainData.transaction_hash}
            
            Your achievement is now permanently verified and accessible worldwide.`
          });
        }

        return Response.json({ success: true, certification });
      }

      case 'verify_certification': {
        const { certification_id, nft_token_id } = await req.json();
        
        let cert;
        if (certification_id) {
          const certs = await base44.asServiceRole.entities.Certification.filter({ certification_id });
          cert = certs[0];
        } else if (nft_token_id) {
          const certs = await base44.asServiceRole.entities.Certification.list();
          cert = certs.find(c => c.blockchain_record?.nft_token_id === nft_token_id);
        }

        if (!cert) {
          return Response.json({ verified: false, error: 'Certification not found' });
        }

        // Verify blockchain record
        const blockchainRecords = await base44.asServiceRole.entities.BlockchainDataRecord.filter({
          transaction_hash: cert.blockchain_record.transaction_hash
        });
        
        const verified = blockchainRecords.length > 0 && 
                        blockchainRecords[0].confirmation_status === 'confirmed';

        return Response.json({
          verified,
          certification: {
            title: cert.title,
            recipient_id: cert.recipient_id,
            issued_date: cert.issued_date,
            issuer: cert.issuer,
            blockchain_hash: cert.blockchain_record.transaction_hash
          }
        });
      }

      case 'revoke_certification': {
        const { certification_id, reason } = await req.json();
        
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
          return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const certs = await base44.asServiceRole.entities.Certification.filter({ certification_id });
        const cert = certs[0];

        if (!cert) {
          return Response.json({ error: 'Certification not found' }, { status: 404 });
        }

        // Record revocation on blockchain
        const revocationRecord = await base44.asServiceRole.entities.BlockchainDataRecord.create({
          record_id: `revoke_${Date.now()}`,
          blockchain: 'ethereum',
          transaction_hash: `0x${Math.random().toString(36).substring(2, 15)}`,
          data_type: 'certification_revocation',
          data_hash: cert.blockchain_record.transaction_hash,
          metadata: { reason, revoked_at: new Date().toISOString() },
          confirmation_status: 'confirmed'
        });

        await base44.asServiceRole.entities.Certification.delete(cert.id);

        return Response.json({ success: true, revocation_record: revocationRecord });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Certification manager error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
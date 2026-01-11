import { base44 } from '@/api/base44Client';

export async function createCollaborativeDocument(workspaceId, userEmail, title, type) {
  // In production, create Google Doc via API
  const googleDocId = `doc_${Date.now()}`;
  const googleDriveUrl = `https://docs.google.com/document/d/${googleDocId}`;

  const doc = {
    workspace_id: workspaceId,
    user_email: userEmail,
    title,
    document_type: type,
    google_doc_id: googleDocId,
    google_drive_url: googleDriveUrl,
    content: { sections: [] },
    contributing_agents: [],
    edit_history: [],
    status: 'draft',
    last_synced: new Date().toISOString()
  };

  return await base44.entities.CollaborativeDocument.create(doc);
}

export async function agentEditDocument(documentId, agentId, edits) {
  const doc = await base44.entities.CollaborativeDocument.filter({ id: documentId });
  if (doc.length === 0) return null;

  const docData = doc[0];
  
  // Apply edits
  const updatedContent = { ...docData.content, ...edits };
  
  // Add to edit history
  const history = docData.edit_history || [];
  history.push({
    agent_id: agentId,
    timestamp: new Date().toISOString(),
    changes: edits
  });

  // Add agent to contributors if not present
  const contributors = docData.contributing_agents || [];
  if (!contributors.includes(agentId)) {
    contributors.push(agentId);
  }

  // Sync to Google Docs in production
  await syncToGoogleDocs(docData.google_doc_id, updatedContent);

  return await base44.entities.CollaborativeDocument.update(documentId, {
    content: updatedContent,
    edit_history: history,
    contributing_agents: contributors,
    last_synced: new Date().toISOString()
  });
}

async function syncToGoogleDocs(docId, content) {
  // In production, use Google Docs API
  console.log(`Syncing to Google Docs: ${docId}`);
  return true;
}

export async function downloadDocument(documentId) {
  const doc = await base44.entities.CollaborativeDocument.filter({ id: documentId });
  if (doc.length === 0) return null;

  return {
    url: doc[0].google_drive_url,
    content: doc[0].content,
    format: 'google_docs'
  };
}

export async function shareDocument(documentId, emailAddresses) {
  // In production, use Google Drive sharing API
  console.log(`Sharing document ${documentId} with:`, emailAddresses);
  return { shared: true, recipients: emailAddresses };
}
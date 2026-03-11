import { getDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// VULN 5 — Base64-Encoded ID IDOR (False Security)
// Base64 gives illusion of security. Decode → increment → re-encode.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { encoded_id } = req.query;

  try {
    // Decode Base64 to get raw document ID
    const decodedId = Buffer.from(encoded_id, 'base64').toString('utf-8');
    const docId = parseInt(decodedId);

    if (isNaN(docId)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const sql = getDb();
    const documents = await sql`
      SELECT d.id, d.user_id, d.title, d.content, d.doc_type, d.created_at, d.encoded_id,
             u.username as owner_username, u.first_name as owner_first_name, u.last_name as owner_last_name
      FROM documents d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ${docId}
    `;

    if (documents.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    return res.status(200).json(documents[0]);
  } catch (error) {
    console.error('Document lookup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

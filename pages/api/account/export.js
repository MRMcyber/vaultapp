import { getDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// VULN 9 — IDOR via API Key in Header (Impersonation)
// No check that the API key belongs to the authenticated user's session
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(400).json({ error: 'X-API-Key header is required' });
  }

  try {
    const sql = getDb();

    // Look up user by API key (not by authenticated session)
    const users = await sql`
      SELECT id, username, email, phone, address, balance, role, account_number, 
             ssn_last4, api_key, first_name, last_name, date_joined, uuid
      FROM users 
      WHERE api_key = ${apiKey}
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'Invalid API key' });
    }

    const targetUser = users[0];

    // Get all transactions
    const transactions = await sql`
      SELECT id, from_account, to_account, amount, description, transaction_date, status
      FROM transactions 
      WHERE user_id = ${targetUser.id}
      ORDER BY transaction_date DESC
    `;

    // Get all documents
    const documents = await sql`
      SELECT id, title, doc_type, created_at, encoded_id
      FROM documents 
      WHERE user_id = ${targetUser.id}
      ORDER BY created_at DESC
    `;

    return res.status(200).json({
      profile: targetUser,
      transactions,
      documents,
      export_date: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Account export error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

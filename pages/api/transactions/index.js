import { getDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// VULN 2 — Query Parameter IDOR (Transaction History)
// Accepts account_id from query param, no ownership validation
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { account_id } = req.query;

  if (!account_id) {
    return res.status(400).json({ error: 'account_id query parameter is required' });
  }

  try {
    const sql = getDb();
    const transactions = await sql`
      SELECT id, user_id, from_account, to_account, amount, description, transaction_date, status
      FROM transactions 
      WHERE from_account = ${account_id} OR to_account = ${account_id}
      ORDER BY transaction_date DESC
    `;

    return res.status(200).json({ account_id, transactions });
  } catch (error) {
    console.error('Transaction lookup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

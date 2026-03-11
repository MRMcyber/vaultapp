import { getDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// VULN 1 — Sequential ID IDOR (Horizontal)
// No check that req.user.id === id
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    const sql = getDb();
    const users = await sql`
      SELECT id, username, email, phone, address, balance, role, account_number, ssn_last4, first_name, last_name, date_joined
      FROM users 
      WHERE id = ${parseInt(id)}
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(users[0]);
  } catch (error) {
    console.error('User lookup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

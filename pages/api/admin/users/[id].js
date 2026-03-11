import { getDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// VULN 7 — IDOR in DELETE (Vertical Privilege Escalation)
// Only checks auth, NOT role. Any user can delete any account.
export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Intentionally missing: role check (should require admin)
  const { id } = req.query;

  try {
    const sql = getDb();
    const result = await sql`
      DELETE FROM users WHERE id = ${parseInt(id)} RETURNING id, username
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'User deleted successfully',
      deleted_user: result[0],
    });
  } catch (error) {
    console.error('User delete error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

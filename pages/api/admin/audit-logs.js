import { getDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// VULN 10 — IDOR in Audit Log (Admin-Only Data Exposed to All)
// No role check. Any authenticated user can query audit logs for any user_id.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Intentionally missing: role check (should require admin)
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id query parameter is required' });
  }

  try {
    const sql = getDb();
    const logs = await sql`
      SELECT al.id, al.user_id, al.action, al.target_user_id, al.ip_address, al.created_at,
             u.username as user_username,
             t.username as target_username
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      LEFT JOIN users t ON al.target_user_id = t.id
      WHERE al.user_id = ${parseInt(user_id)}
      ORDER BY al.created_at DESC
    `;

    return res.status(200).json({
      user_id: parseInt(user_id),
      total: logs.length,
      logs,
    });
  } catch (error) {
    console.error('Audit log error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

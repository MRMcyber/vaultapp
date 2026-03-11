import { getDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// VULN 8 — IDOR on Private Notes (Boolean Flag Not Enforced)
// Ignores is_private flag and ownership. Any auth user can read any note.
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
    const notes = await sql`
      SELECT n.id, n.user_id, n.title, n.body, n.is_private, n.created_at,
             u.username as owner_username
      FROM notes n
      JOIN users u ON n.user_id = u.id
      WHERE n.id = ${parseInt(id)}
    `;

    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.status(200).json(notes[0]);
  } catch (error) {
    console.error('Note lookup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

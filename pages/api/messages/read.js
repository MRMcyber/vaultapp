import { getDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// VULN 3 — POST Body IDOR (Read Private Messages)
// Checks auth but not that the message belongs to the requesting user
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { message_id } = req.body;

  if (!message_id) {
    return res.status(400).json({ error: 'message_id is required' });
  }

  try {
    const sql = getDb();
    const messages = await sql`
      SELECT m.id, m.subject, m.body, m.sent_at, m.is_read,
             s.username as sender_username, s.email as sender_email,
             r.username as receiver_username, r.email as receiver_email
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE m.id = ${parseInt(message_id)}
    `;

    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Mark as read (no ownership check)
    await sql`UPDATE messages SET is_read = true WHERE id = ${parseInt(message_id)}`;

    return res.status(200).json(messages[0]);
  } catch (error) {
    console.error('Message read error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

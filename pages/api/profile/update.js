import { getDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// VULN 4 — Mass Assignment / Body Parameter Tampering
// Blindly passes entire request body to SQL update, including role and balance
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const updates = req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    const sql = getDb();

    // Intentionally vulnerable: blindly construct SET clause from all body fields
    const allowedColumns = ['phone', 'address', 'email', 'first_name', 'last_name', 'role', 'balance', 'password', 'username'];
    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedColumns.includes(key)) {
        setClauses.push(`${key} = $${values.length + 1}`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(user.id);
    const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING id, username, email, phone, address, role, balance, first_name, last_name`;

    const result = await sql.query(query, values);

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: result[0],
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

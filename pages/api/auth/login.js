import { getDb } from '@/lib/db';
import { signToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const sql = getDb();
    const users = await sql`
      SELECT id, username, password, role, account_number, balance, uuid, email, first_name, last_name
      FROM users 
      WHERE username = ${username}
    `;

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];

    // Intentional: plaintext password comparison
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role,
      account_number: user.account_number,
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        account_number: user.account_number,
        balance: user.balance,
        uuid: user.uuid,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
  }
}

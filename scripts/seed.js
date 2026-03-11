require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set.');
  console.error('Create a .env.local file with your Neon connection string.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Deterministic pseudo-random number generator (Mulberry32)
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function randomInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (rand() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function randomHex(len) {
  let result = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(rand() * chars.length)];
  }
  return result;
}

function randomDate(yearsBack = 3) {
  const now = Date.now();
  const past = now - yearsBack * 365 * 24 * 60 * 60 * 1000;
  return new Date(past + rand() * (now - past)).toISOString();
}

function randomRecentDate() {
  const now = Date.now();
  const past = now - 90 * 24 * 60 * 60 * 1000;
  return new Date(past + rand() * (now - past)).toISOString();
}

// Name data
const firstNames = ['James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Christopher','Karen','Charles','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Kimberly','Andrew','Emily','Paul','Donna','Joshua','Michelle','Kenneth','Carol','Kevin','Amanda','Brian','Dorothy','George','Melissa','Timothy','Deborah','Ronald','Stephanie','Edward','Rebecca','Jason','Sharon','Jeffrey','Laura','Ryan','Cynthia','Jacob','Kathleen','Gary','Amy','Nicholas','Angela','Eric','Shirley','Jonathan','Anna','Stephen','Brenda','Larry','Pamela','Justin','Emma','Scott','Nicole','Brandon','Helen','Benjamin','Samantha','Samuel','Katherine','Raymond','Christine','Gregory','Debra','Frank','Rachel','Alexander','Carolyn','Patrick','Janet','Jack','Catherine','Dennis','Maria','Jerry','Heather','Tyler','Diane'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez','Powell'];
const streets = ['Main St','Oak Ave','Elm St','Park Blvd','Cedar Ln','Maple Dr','Pine St','Walnut St','Washington Ave','Lake St','Hill Rd','River Dr','Forest Ave','Spring St','Church St','High St','Mill Rd','Academy Dr','Center St','Union Ave','Market St','School Rd','North Ave','South Blvd','West Dr','East Ln','Liberty St','Franklin Ave','Jefferson Blvd','Lincoln Way'];
const cities = ['Springfield','Franklin','Clinton','Madison','Georgetown','Fairview','Salem','Bristol','Oakland','Riverside','Arlington','Burlington','Manchester','Milton','Newport','Greenville','Lexington','Winchester','Ashland','Auburn'];
const states = ['CA','TX','FL','NY','IL','PA','OH','GA','NC','MI','NJ','VA','WA','AZ','MA','TN','IN','MO','MD','WI'];

function generateUsers() {
  const users = [];
  const usedUsernames = new Set();

  for (let i = 1; i <= 300; i++) {
    let username, email, password, role, firstName, lastName;

    if (i === 42) {
      username = 'player';
      email = 'player@vaultapp.com';
      password = 'player123';
      firstName = 'Player';
      lastName = 'One';
    } else if (i === 299) {
      username = 'sysadmin';
      email = 'sysadmin@vaultapp.com';
      password = 'adminpass1';
      firstName = 'System';
      lastName = 'Admin';
    } else if (i === 300) {
      username = 'rootadmin';
      email = 'rootadmin@vaultapp.com';
      password = 'adminpass2';
      firstName = 'Root';
      lastName = 'Admin';
    } else {
      firstName = randomChoice(firstNames);
      lastName = randomChoice(lastNames);
      let base = (firstName[0] + lastName).toLowerCase();
      let attempt = base + randomInt(1, 99);
      while (usedUsernames.has(attempt)) {
        attempt = base + randomInt(100, 9999);
      }
      username = attempt;
      email = `${username}@${randomChoice(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com'])}`;
      password = randomChoice(['pass', 'qwerty', 'letmein', 'welcome', 'monkey']) + randomInt(100, 9999);
    }

    usedUsernames.add(username);

    if (i >= 299) role = 'admin';
    else if (i >= 295) role = 'moderator';
    else role = 'user';

    const uuid = generateUUID();
    const accountNumber = `ACCT-${String(i).padStart(5, '0')}`;
    const balance = randomInt(500, 50000);
    const phone = `(${randomInt(200, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
    const address = `${randomInt(100, 9999)} ${randomChoice(streets)}, ${randomChoice(cities)}, ${randomChoice(states)} ${randomInt(10000, 99999)}`;
    const apiKey = randomHex(32);
    const dateJoined = randomDate(3);
    const ssnLast4 = String(randomInt(1000, 9999));

    users.push({
      id: i, uuid, username, email, password, role,
      account_number: accountNumber, balance, phone, address,
      api_key: apiKey, date_joined: dateJoined, ssn_last4: ssnLast4,
      first_name: firstName, last_name: lastName
    });
  }
  return users;
}

function generateTransactions(users) {
  const txns = [];
  let txnId = 1;
  const descriptions = [
    'Grocery Store Purchase', 'Netflix Subscription', 'Rent Payment',
    'ATM Withdrawal', 'Online Transfer', 'Electric Bill Payment',
    'Gas Station', 'Restaurant - Dinner', 'Amazon Purchase',
    'Spotify Premium', 'Gym Membership', 'Insurance Premium',
    'Phone Bill', 'Water Utility', 'Coffee Shop',
    'Uber Ride', 'Target Shopping', 'Walmart Purchase',
    'Freelance Payment Received', 'Salary Deposit'
  ];
  const statuses = ['completed', 'completed', 'completed', 'completed', 'pending', 'failed'];

  for (const user of users) {
    for (let j = 0; j < 6; j++) {
      const otherUser = users[randomInt(0, users.length - 1)];
      txns.push({
        id: txnId++,
        user_id: user.id,
        from_account: user.account_number,
        to_account: otherUser.account_number,
        amount: (randomInt(5, 500) + rand()).toFixed(2),
        description: `${randomChoice(descriptions)} - $${(randomInt(5, 500) + rand()).toFixed(2)}`,
        transaction_date: randomRecentDate(),
        status: randomChoice(statuses)
      });
    }
  }
  return txns;
}

function generateMessages(users) {
  const msgs = [];
  let msgId = 1;
  const subjects = [
    'Account Security Update', 'Your Recent Transaction', 'Welcome to VaultApp',
    'Password Reset Request', 'Monthly Statement Ready', 'Important Account Notice',
    'Transfer Confirmation', 'New Login Detected', 'Profile Update Confirmation',
    'Scheduled Maintenance Notice'
  ];
  const bodies = [
    'Your account has been updated successfully. If you did not make this change, please contact support immediately.',
    'A new transaction was processed on your account. Please review your recent activity.',
    'Welcome to VaultApp! Your account is now active. Get started by exploring your dashboard.',
    'We received a request to reset your password. If this was not you, please ignore this message.',
    'Your monthly statement is now available. Log in to view your transactions and balance.',
  ];
  const sensitiveSubjects = [
    'Temporary Credentials', 'Account Recovery Info', 'Security Backup Codes',
  ];
  const sensitiveBodies = [
    (user) => `Your temporary password is: changeme99. Please update it immediately. Account: ${user.account_number}`,
    (user) => `SSN on file for verification: XXX-XX-${user.ssn_last4}. Do not share this information.`,
    (user) => `Backup recovery code: ${randomHex(8).toUpperCase()}-${randomHex(8).toUpperCase()}. API Key: ${user.api_key.substring(0, 8)}...`,
    (user) => `Your account ${user.account_number} balance is $${user.balance}. Routing number: 021000021.`,
  ];

  for (const user of users) {
    for (let j = 0; j < 4; j++) {
      const otherUser = users[randomInt(0, users.length - 1)];
      const isSensitive = j === 0 && user.id % 5 === 0;
      const sender = j < 2 ? user : otherUser;
      const receiver = j < 2 ? otherUser : user;

      let subject, body;
      if (isSensitive) {
        subject = randomChoice(sensitiveSubjects);
        body = randomChoice(sensitiveBodies)(user);
      } else {
        subject = randomChoice(subjects);
        body = randomChoice(bodies);
      }

      msgs.push({
        id: msgId++,
        sender_id: sender.id,
        receiver_id: receiver.id,
        subject,
        body,
        sent_at: randomRecentDate(),
        is_read: rand() > 0.3
      });
    }
  }
  return msgs;
}

function generateDocuments(users) {
  const docs = [];
  let docId = 1;
  const docTypes = ['invoice', 'statement', 'report'];
  const titles = {
    invoice: ['Monthly Service Invoice', 'Subscription Renewal Invoice', 'Transaction Fee Invoice', 'Annual Membership Invoice'],
    statement: ['Monthly Account Statement', 'Quarterly Financial Summary', 'Year-End Statement', 'Balance Verification Statement'],
    report: ['Credit Score Report', 'Account Activity Report', 'Tax Summary Report', 'Investment Performance Report']
  };
  const contentTemplates = {
    invoice: (user) => `Invoice for account ${user.account_number}\nBilled to: ${user.first_name} ${user.last_name}\nEmail: ${user.email}\nAmount Due: $${randomInt(50, 500)}.${randomInt(10, 99)}\nDue Date: ${randomRecentDate().split('T')[0]}\nPayment Method: Account Balance ($${user.balance})`,
    statement: (user) => `Account Statement - ${user.account_number}\nAccount Holder: ${user.first_name} ${user.last_name}\nCurrent Balance: $${user.balance}\nSSN (last 4): ${user.ssn_last4}\nPhone: ${user.phone}\nAddress: ${user.address}`,
    report: (user) => `Financial Report for ${user.first_name} ${user.last_name}\nAccount: ${user.account_number}\nRole: ${user.role}\nAPI Access Key: ${user.api_key}\nTotal Assets: $${user.balance}\nRisk Level: ${randomChoice(['Low', 'Medium', 'High'])}`
  };

  for (const user of users) {
    for (let j = 0; j < 3; j++) {
      const docType = docTypes[j];
      const id = docId++;
      docs.push({
        id,
        user_id: user.id,
        title: randomChoice(titles[docType]),
        content: contentTemplates[docType](user),
        doc_type: docType,
        created_at: randomRecentDate(),
        encoded_id: Buffer.from(String(id)).toString('base64')
      });
    }
  }
  return docs;
}

function generateNotes(users) {
  const notes = [];
  let noteId = 1;
  const normalTitles = ['Meeting Notes', 'Todo List', 'Project Ideas', 'Quick Reminder', 'Shopping List'];
  const normalBodies = [
    'Remember to follow up on the quarterly review meeting.',
    'Check dashboard for pending transactions. Update profile info.',
    'Look into new investment options. Review portfolio diversification.',
    'Schedule dentist appointment. Renew gym membership.',
    'Research vacation destinations for next month.'
  ];
  const privateTitles = ['Personal API Keys', 'Password Backup', 'Card Details Backup', 'Account Recovery', 'Admin Credentials'];
  const privateBodies = [
    (user) => `My API key: ${user.api_key}\nBackup code: ${randomHex(16)}\nDo not share!`,
    (user) => `Email: ${user.email}\nPassword: ${user.password}\nSSN last 4: ${user.ssn_last4}\nSaved for recovery.`,
    (user) => `Credit Card: 4532-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}\nExpiry: ${randomInt(1, 12)}/${randomInt(25, 29)}\nCVV: ${randomInt(100, 999)}`,
    (user) => `Account: ${user.account_number}\nRecovery email: backup-${user.username}@gmail.com\nSecurity answer: ${randomChoice(['Fluffy', 'Rover', 'Whiskers', 'Buddy'])}`,
    (user) => `Admin panel: /admin\nDefault admin pass: adminpass1\nAPI endpoint: /api/admin/audit-logs\nMaster key: ${randomHex(24)}`
  ];

  for (const user of users) {
    for (let j = 0; j < 2; j++) {
      const isPrivate = j === 0;
      let title, body;
      if (isPrivate) {
        title = randomChoice(privateTitles);
        body = randomChoice(privateBodies)(user);
      } else {
        title = randomChoice(normalTitles);
        body = randomChoice(normalBodies);
      }
      notes.push({
        id: noteId++,
        user_id: user.id,
        title,
        body,
        is_private: isPrivate,
        created_at: randomRecentDate()
      });
    }
  }
  return notes;
}

function generateAuditLogs(users) {
  const logs = [];
  let logId = 1;
  const actions = ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'PROFILE_VIEW', 'PROFILE_UPDATE', 'PASSWORD_RESET', 'DOCUMENT_ACCESS', 'TRANSACTION_CREATED', 'ROLE_CHANGE', 'API_KEY_GENERATED', 'EXPORT_DATA'];
  const ips = ['192.168.1.', '10.0.0.', '172.16.0.', '203.0.113.', '198.51.100.'];

  for (const user of users) {
    for (let j = 0; j < 3; j++) {
      const targetUser = users[randomInt(0, users.length - 1)];
      logs.push({
        id: logId++,
        user_id: user.id,
        action: randomChoice(actions),
        target_user_id: targetUser.id,
        ip_address: randomChoice(ips) + randomInt(1, 254),
        created_at: randomRecentDate()
      });
    }
  }
  return logs;
}

async function seed() {
  console.log('🏦 VaultApp Database Seeder');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Drop tables
  console.log('🗑️  Dropping existing tables...');
  await sql`DROP TABLE IF EXISTS audit_logs CASCADE`;
  await sql`DROP TABLE IF EXISTS notes CASCADE`;
  await sql`DROP TABLE IF EXISTS documents CASCADE`;
  await sql`DROP TABLE IF EXISTS messages CASCADE`;
  await sql`DROP TABLE IF EXISTS transactions CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  console.log('   ✓ Tables dropped');

  // Create tables
  console.log('📋 Creating tables...');
  await sql`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      uuid VARCHAR(36) UNIQUE NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(100) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      account_number VARCHAR(20) UNIQUE NOT NULL,
      balance INTEGER DEFAULT 0,
      phone VARCHAR(20),
      address TEXT,
      api_key VARCHAR(64) UNIQUE NOT NULL,
      date_joined TIMESTAMP NOT NULL,
      ssn_last4 VARCHAR(4),
      first_name VARCHAR(50),
      last_name VARCHAR(50)
    )
  `;

  await sql`
    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      from_account VARCHAR(20),
      to_account VARCHAR(20),
      amount DECIMAL(10,2),
      description TEXT,
      transaction_date TIMESTAMP,
      status VARCHAR(20) DEFAULT 'completed'
    )
  `;

  await sql`
    CREATE TABLE messages (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      subject VARCHAR(200),
      body TEXT,
      sent_at TIMESTAMP,
      is_read BOOLEAN DEFAULT false
    )
  `;

  await sql`
    CREATE TABLE documents (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200),
      content TEXT,
      doc_type VARCHAR(20),
      created_at TIMESTAMP,
      encoded_id VARCHAR(50)
    )
  `;

  await sql`
    CREATE TABLE notes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200),
      body TEXT,
      is_private BOOLEAN DEFAULT false,
      created_at TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      action VARCHAR(50),
      target_user_id INTEGER,
      ip_address VARCHAR(45),
      created_at TIMESTAMP
    )
  `;
  console.log('   ✓ All tables created');

  // Generate data
  console.log('🔧 Generating data...');
  const users = generateUsers();
  const transactions = generateTransactions(users);
  const messages = generateMessages(users);
  const documents = generateDocuments(users);
  const notes = generateNotes(users);
  const auditLogs = generateAuditLogs(users);
  console.log(`   ✓ Generated ${users.length} users`);
  console.log(`   ✓ Generated ${transactions.length} transactions`);
  console.log(`   ✓ Generated ${messages.length} messages`);
  console.log(`   ✓ Generated ${documents.length} documents`);
  console.log(`   ✓ Generated ${notes.length} notes`);
  console.log(`   ✓ Generated ${auditLogs.length} audit logs`);

  // Insert users in batches
  console.log('📥 Inserting users...');
  const batchSize = 10;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const values = batch.map(u =>
      `(${u.id}, '${u.uuid}', '${u.username}', '${u.email}', '${u.password}', '${u.role}', '${u.account_number}', ${u.balance}, '${u.phone}', '${u.address.replace(/'/g, "''")}', '${u.api_key}', '${u.date_joined}', '${u.ssn_last4}', '${u.first_name}', '${u.last_name}')`
    ).join(',\n');
    await sql`INSERT INTO users (id, uuid, username, email, password, role, account_number, balance, phone, address, api_key, date_joined, ssn_last4, first_name, last_name) VALUES ${sql.unsafe(values)}`;
    if ((i + batchSize) % 50 === 0 || i + batchSize >= users.length) {
      process.stdout.write(`   ✓ Inserted ${Math.min(i + batchSize, users.length)}/${users.length} users\r`);
    }
  }
  console.log('');

  // Insert transactions in batches
  console.log('📥 Inserting transactions...');
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const values = batch.map(t =>
      `(${t.user_id}, '${t.from_account}', '${t.to_account}', ${t.amount}, '${t.description.replace(/'/g, "''")}', '${t.transaction_date}', '${t.status}')`
    ).join(',\n');
    await sql`INSERT INTO transactions (user_id, from_account, to_account, amount, description, transaction_date, status) VALUES ${sql.unsafe(values)}`;
    if ((i + batchSize) % 100 === 0 || i + batchSize >= transactions.length) {
      process.stdout.write(`   ✓ Inserted ${Math.min(i + batchSize, transactions.length)}/${transactions.length} transactions\r`);
    }
  }
  console.log('');

  // Insert messages in batches
  console.log('📥 Inserting messages...');
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const values = batch.map(m =>
      `(${m.sender_id}, ${m.receiver_id}, '${m.subject.replace(/'/g, "''")}', '${m.body.replace(/'/g, "''")}', '${m.sent_at}', ${m.is_read})`
    ).join(',\n');
    await sql`INSERT INTO messages (sender_id, receiver_id, subject, body, sent_at, is_read) VALUES ${sql.unsafe(values)}`;
    if ((i + batchSize) % 100 === 0 || i + batchSize >= messages.length) {
      process.stdout.write(`   ✓ Inserted ${Math.min(i + batchSize, messages.length)}/${messages.length} messages\r`);
    }
  }
  console.log('');

  // Insert documents in batches
  console.log('📥 Inserting documents...');
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    const values = batch.map(d =>
      `(${d.user_id}, '${d.title.replace(/'/g, "''")}', '${d.content.replace(/'/g, "''")}', '${d.doc_type}', '${d.created_at}', '${d.encoded_id}')`
    ).join(',\n');
    await sql`INSERT INTO documents (user_id, title, content, doc_type, created_at, encoded_id) VALUES ${sql.unsafe(values)}`;
    if ((i + batchSize) % 100 === 0 || i + batchSize >= documents.length) {
      process.stdout.write(`   ✓ Inserted ${Math.min(i + batchSize, documents.length)}/${documents.length} documents\r`);
    }
  }
  console.log('');

  // Insert notes in batches
  console.log('📥 Inserting notes...');
  for (let i = 0; i < notes.length; i += batchSize) {
    const batch = notes.slice(i, i + batchSize);
    const values = batch.map(n =>
      `(${n.user_id}, '${n.title.replace(/'/g, "''")}', '${n.body.replace(/'/g, "''")}', ${n.is_private}, '${n.created_at}')`
    ).join(',\n');
    await sql`INSERT INTO notes (user_id, title, body, is_private, created_at) VALUES ${sql.unsafe(values)}`;
    if ((i + batchSize) % 100 === 0 || i + batchSize >= notes.length) {
      process.stdout.write(`   ✓ Inserted ${Math.min(i + batchSize, notes.length)}/${notes.length} notes\r`);
    }
  }
  console.log('');

  // Insert audit logs in batches
  console.log('📥 Inserting audit logs...');
  for (let i = 0; i < auditLogs.length; i += batchSize) {
    const batch = auditLogs.slice(i, i + batchSize);
    const values = batch.map(a =>
      `(${a.user_id}, '${a.action}', ${a.target_user_id}, '${a.ip_address}', '${a.created_at}')`
    ).join(',\n');
    await sql`INSERT INTO audit_logs (user_id, action, target_user_id, ip_address, created_at) VALUES ${sql.unsafe(values)}`;
    if ((i + batchSize) % 100 === 0 || i + batchSize >= auditLogs.length) {
      process.stdout.write(`   ✓ Inserted ${Math.min(i + batchSize, auditLogs.length)}/${auditLogs.length} audit logs\r`);
    }
  }
  console.log('');

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Users:        ${users.length}`);
  console.log(`   Transactions: ${transactions.length}`);
  console.log(`   Messages:     ${messages.length}`);
  console.log(`   Documents:    ${documents.length}`);
  console.log(`   Notes:        ${notes.length}`);
  console.log(`   Audit Logs:   ${auditLogs.length}`);
  console.log('');
  console.log('🔑 Test Credentials:');
  console.log('   Player:  player / player123     (ID: 42)');
  console.log('   Admin:   sysadmin / adminpass1   (ID: 299)');
  console.log('   Admin:   rootadmin / adminpass2  (ID: 300)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

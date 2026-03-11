# 🏦 VaultApp — IDOR Security Training Lab

A full-stack deliberately vulnerable web application designed for practising **Insecure Direct Object Reference (IDOR)** vulnerability discovery and exploitation.

> ⚠️ **This is an intentionally vulnerable application for educational purposes only.** Do NOT deploy to a production environment or expose to the public internet.

## 🎯 Overview

VaultApp simulates a personal finance and document management portal with **10 intentionally exploitable IDOR vulnerabilities**. It's designed as a medium-difficulty security training lab for penetration testing practice.

### Features
- 300 seeded user accounts with realistic fake data
- 6 database tables (users, transactions, messages, documents, notes, audit_logs)
- 10 distinct IDOR vulnerabilities across different attack patterns
- Dark-themed fintech UI that looks like a real application
- Built-in Lab Guide with challenge descriptions and hints

## 🧱 Tech Stack

- **Framework:** Next.js 14 (Pages Router)
- **Styling:** Tailwind CSS
- **Database:** Neon Postgres (serverless)
- **Auth:** JWT (localStorage)
- **Deployment:** Vercel

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd vaultapp
npm install
```

### 2. Set Up Neon Postgres Database
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project and database
3. Copy your connection string

### 3. Configure Environment
Create a `.env.local` file (or copy from `.env.example`):
```
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
JWT_SECRET=vaultapp-secret-key-2024
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Seed the Database
```bash
node scripts/seed.js
```
This creates all tables and inserts:
- 300 users
- 1,800 transactions
- 1,200 messages
- 900 documents
- 600 notes
- 900 audit log entries

### 5. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🔑 Test Credentials

| Account | Username | Password | User ID | Role |
|---------|----------|----------|---------|------|
| Player | `player` | `player123` | 42 | user |
| Admin 1 | `sysadmin` | `adminpass1` | 299 | admin |
| Admin 2 | `rootadmin` | `adminpass2` | 300 | admin |

## 🎯 Lab Objectives

Find and exploit all 10 IDOR vulnerabilities:

| # | Vulnerability | Difficulty | Method |
|---|--------------|------------|--------|
| 1 | Sequential ID Enumeration | Easy | GET |
| 2 | Query Parameter Manipulation | Easy | GET |
| 3 | POST Body Object Reference | Medium | POST |
| 4 | Mass Assignment Attack | Medium | POST |
| 5 | Base64 Encoded ID Bypass | Medium | GET |
| 6 | UUID Information Leakage | Medium | GET |
| 7 | Vertical Privilege Escalation | Hard | DELETE |
| 8 | Private Note Access | Easy | GET |
| 9 | API Key Impersonation | Hard | GET |
| 10 | Admin Audit Log Exposure | Medium | GET |

Visit the **/lab-guide** page in the app for detailed challenge descriptions and hints.

## 🌐 Deploy to Vercel

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add the `DATABASE_URL` environment variable in Vercel project settings
4. Deploy!
5. Run the seed script with your production DATABASE_URL: `DATABASE_URL=<your-url> node scripts/seed.js`

## 🛠️ Recommended Tools

- **Browser DevTools** (F12) — Network tab to inspect API calls
- **Burp Suite** — Intercept and modify HTTP requests
- **curl** — Craft custom API requests from the terminal
- **Postman** — GUI for API testing

## ⚠️ Disclaimer

This application is **deliberately insecure** and should only be used in controlled educational environments. It demonstrates common web security vulnerabilities including:

- Insecure Direct Object References (IDOR)
- Missing access controls
- Mass assignment vulnerabilities
- Client-side only authentication
- Plaintext password storage
- Hardcoded secrets

**Never deploy this to a public-facing server.**

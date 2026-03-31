<div align="center">

# 🛡️ Safe_Net

**A developer's security audit toolkit.**  
Scan files for threats, inspect TLS certificates, store secrets with AES-256-GCM encryption — all from one place.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-orange?style=flat-square)]()

</div>

---

## What is Safe_Net?

Safe_Net is a backend-first security toolkit built for developers and sysadmins who want a unified API to handle common security checks and encrypted file storage — without bouncing between five different services.

Instead of manually opening VirusTotal, running `openssl s_client`, and storing files in unencrypted cloud storage separately, Safe_Net exposes clean REST APIs that bundle all of it together.

---

## Features

| Feature | Description |
|---|---|
| **VirusTotal File Scanner** | Submit files or hashes to the VirusTotal API and get a threat report |
| **TLS Certificate Checker** | Inspect TLS/SSL chain, expiry date, and issuer for any domain |
| **Encrypted File Vault** | Upload files encrypted with AES-256-GCM before they ever hit storage |
| **Basic Auth Setup** | Simple authentication layer to protect all API endpoints |

---

## Tech Stack

- **Runtime:** Node.js
- **Encryption:** AES-256-GCM (via Node.js `crypto` module — no third-party crypto libs)
- **External APIs:** VirusTotal v3 API
- **TLS Inspection:** tls-certificate-checker {Personally curated Package register on npm}
- **Auth:** HTTP Basic Auth middleware

---

## Project Structure


---

## Getting Started

### Prerequisites

- Node.js 18+
- A [VirusTotal API key](https://www.virustotal.com/gui/my-apikey) (free tier works)

### Installation

```bash
# Clone the repo
git clone https://github.com/sukritcharredsoul/Safe_Net.git
cd Safe_Net/server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=3000

# VirusTotal
VIRUSTOTAL_API_KEY=your_vt_api_key_here

# Encryption (generate a secure 32-byte key)
ENCRYPTION_KEY=your_32_byte_hex_key_here

# Basic Auth
AUTH_USERNAME=admin
AUTH_PASSWORD=your_secure_password_here
```

> **Tip:** Generate a secure encryption key with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Run the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:3000`

---

## API Reference

### File Scan — VirusTotal

```http
POST /api/scan
Authorization: Basic <base64(username:password)>
Content-Type: multipart/form-data

file: <your file>
```

**Response:**
```json
{
  "status": "ok",
  "malicious": 0,
  "suspicious": 1,
  "harmless": 68,
  "permalink": "https://www.virustotal.com/gui/file/..."
}
```

---

### TLS Certificate Check

```http
GET /api/tls?domain=example.com
Authorization: Basic <base64(username:password)>
```

**Response:**
```json
{
  "domain": "example.com",
  "valid": true,
  "issuer": "Let's Encrypt",
  "expires": "2025-09-14T12:00:00.000Z",
  "daysRemaining": 166
}
```

---


## Roadmap

- [x] VirusTotal API integration
- [x] TLS certificate inspection
- [x] AES-256-GCM encrypted file vault
- [x] Basic Auth middleware
- [ ] React dashboard frontend
- [ ] Hash-based file deduplication
- [ ] Scheduled TLS expiry alerts
- [ ] Docker support
- [ ] Rate limiting per API key

---

## Security Notes

- Never commit your `.env` file — it's in `.gitignore`
- Rotate your `ENCRYPTION_KEY` by re-encrypting stored files — there is no in-place key rotation yet
- This project is **not production-hardened** yet — do not expose it publicly without adding rate limiting and HTTPS termination

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE) © Sukrit Char

---

<div align="center">
Built as a full-stack security toolkit — one API to audit what matters.
</div>

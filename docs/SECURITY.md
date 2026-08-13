# Security Architecture - Hacker House Goa Builder Network

This document details security boundaries, authorization systems, input sanitization, and fraud prevention measures.

## 1. Trust Boundaries and Principles

1. **Client is Untrusted**: The client browser is responsible for visual execution (drawing cards) and user interaction. All metric tallies, connections records, leaderboard scores, and user IDs must be calculated and validated server-side.
2. **Zero PII Exposure**: Personal details like emails, IP addresses, or phone numbers must never be stored in plaintext in QR codes, public URLs, or client-side stores.
3. **No Private Keys in Client**: ImageKit private keys, Database credentials, and Admin passwords must never be exposed to the client bundle (e.g. without the `NEXT_PUBLIC_` prefix).

---

## 2. Specific Security Safeguards

### A. Rate Limiting via Upstash Redis
To prevent bots from spamming connection creation and card generation endpoints:
- **Connection Attempts**: Limit to **20 requests per minute** per session/IP.
- **Card Generation**: Limit to **5 creations per hour** per IP to prevent ImageKit storage exhaustion.
- **ImageKit Auth Endpoint**: Limit to **10 calls per minute**.

### B. Validation & Input Sanitization
- Every HTTP post body is validated against a strict compile-time **Zod schema** before execution.
- Filenames and metadata are sanitized to prevent path traversal or injection attacks.
- Base64 images are verified to start with a valid PNG header payload.

### C. Connection Transaction Safeguards
To secure the `POST /api/connections` transaction:
1. **No Spoofing ID**: The client cannot send the `fromUserId` in the request body. The server determines the initiator directly from the signed session JWT cookie.
2. **Self Connection Blocking**: The backend verifies `sessionUser.id !== targetUser.id`.
3. **Duplicate Prevention**: Connections are created inside a compound unique index key block: `userA` and `userB` are sorted lexicographically so `A+B` and `B+A` result in a database-level duplication crash, protecting metrics integrity.
4. **Token Resolution**: The connection token must match an active builder in MongoDB.
5. **No Database ID Exposure**: We use generated `publicId` values for all URL mappings rather than Mongoose `_id` values, preventing database shape discovery.

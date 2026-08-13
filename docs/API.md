# API Specifications - Hacker House Goa Builder Network

This document defines the Next.js API route endpoints, request schemas, validation rules, and error states.

## 1. Authentication Levels
- **Anonymous**: No active session cookie is required.
- **Session User**: Requires an HTTP-only secure cookie containing a signed JWT matching an active builder profile.
- **Admin**: Requires a custom header (`X-Admin-Secret` or a cookie matching `ADMIN_SECRET`).

---

## 2. API Endpoints

### A. ImageKit Authentication
Allows the client-side canvas engine to upload the finalized image securely.
- **URL**: `/api/imagekit/auth`
- **Method**: `GET`
- **Authentication**: Anonymous
- **Response (200 OK)**:
  ```json
  {
    "token": "a1b2c3d4...",
    "expire": 1699999999,
    "signature": "8ef0a..."
  }
  ```

### B. Builder Operations
- **URL**: `/api/builders`
- **Method**: `POST`
- **Authentication**: Anonymous
- **Request Body (Zod validated)**:
  ```json
  {
    "name": "Alex Sharma",
    "role": "Frontend",
    "stack": "React",
    "xHandle": "alex_codes",
    "github": "alexs",
    "city": "Panaji",
    "cardImage": "data:image/png;base64,iVBORw..."
  }
  ```
- **Response (201 Created)**:
  Sets a secure `session_token` cookie and returns:
  ```json
  {
    "success": true,
    "builder": {
      "publicId": "alex-sharma-5a21",
      "connectionToken": "abc123xyz...",
      "cardUrl": "https://ik.imagekit.io/..."
    }
  }
  ```

- **URL**: `/api/builders/token/[token]`
- **Method**: `GET`
- **Authentication**: Anonymous (Resolves public profile of another builder via scanned QR code)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "builder": {
      "name": "Alex Sharma",
      "role": "Frontend",
      "stack": "React",
      "builderTitle": "Goa React Gladiator",
      "cardUrl": "https://ik.imagekit.io/...",
      "connectionCount": 42
    }
  }
  ```

### C. Connections
- **URL**: `/api/connections`
- **Method**: `POST`
- **Authentication**: Session User
- **Request Body**:
  ```json
  {
    "connectionToken": "target-builder-connection-token"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Connected successfully",
    "target": {
      "name": "Ishpreet Kaur",
      "builderTitle": "Goa AI Sorceress"
    }
  }
  ```
- **Error States**:
  - `400 Bad Request`: Self-connections, token matches the session user.
  - `409 Conflict`: Duplicate connection. Already connected.
  - `429 Too Many Requests`: Rate limit exceeded (~20 attempts per minute).

### D. Recommendations & Leaderboard
- **URL**: `/api/network`
- **Method**: `GET`
- **Authentication**: Session User
- **Response**: List of connections and current network diversity score.

- **URL**: `/api/recommendations`
- **Method**: `GET`
- **Authentication**: Session User
- **Response**: List of 3 builders with complementary stacks/roles not connected yet.

- **URL**: `/api/leaderboard`
- **Method**: `GET`
- **Authentication**: Anonymous
- **Response**: Sorted list of top builders. (Cached for 10 seconds via Redis).

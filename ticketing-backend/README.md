# Stub Backend (Phase B1: Server + DB Setup)

Express + MongoDB API for the Stub ticket resale marketplace.

## What's in Phase B1

- Express server (`server.js` entry point)
- MongoDB connection via Mongoose (`src/config/db.js`)
- Central error handler middleware (`src/middleware/errorHandler.js`)
- One test route: `GET /api/health`

No models, auth, or real endpoints yet — this phase is purely "does the
server boot and talk to the database." Everything else builds on top of this.

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and replace `MONGODB_URI` with your real MongoDB Atlas
   connection string (from Atlas -> Connect -> Drivers), including your
   actual username and password.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run in dev mode (auto-restarts on file changes):
   ```bash
   npm run dev
   ```

## Test it

Once you see `MongoDB connected: ...` and `Server running on http://localhost:5000`
in the terminal, open your browser or Postman/Thunder Client and hit:

```
GET http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Stub API is running",
  "timestamp": "..."
}
```

If you see `MongoDB connection failed`, double check:
- Your `.env` password doesn't have special characters that need URL-encoding
- Your Atlas Network Access allows your IP (or 0.0.0.0/0 for now)
- The database user exists under Atlas -> Database Access

## Folder structure (grows in later phases)

```
ticketing-backend/
├── src/
│   ├── config/db.js          # Mongoose connection
│   ├── middleware/errorHandler.js
│   ├── app.js                 # Express app, middleware, routes mounted here
│   ├── models/                # (Phase B2+)
│   ├── controllers/           # (Phase B2+)
│   ├── routes/                # (Phase B2+)
│   ├── services/               # (Phase B6+)
│   └── utils/                  # (later phases)
├── server.js                  # entry point
├── .env.example
└── package.json
```

## Next: Phase B2

User model + signup/login with JWT auth.

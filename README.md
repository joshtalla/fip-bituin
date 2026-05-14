# fip-bituin

Full-stack application with React + Vite frontend and Node.js + Express backend.

## Project Structure

```
fip-bituin/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
├── server/          # Node.js + Express backend
│   ├── index.js
│   └── package.json
└── package.json     # Root package.json with scripts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Install root dependencies:
   ```bash
   npm install
   ```

2. Install client dependencies:
   ```bash
   cd client && npm install
   ```

3. Install server dependencies:
   ```bash
   cd server && npm install
   ```

### Environment Setup

This project uses different Supabase credentials in the browser and on the server.

Client-side auth in Vite must use the public anon key:

Create `client/.env`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Server-side API access should use the service role key:

Create `server/.env`:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
```

Notes:

- Do not put the service role or secret key in `client/.env`. The frontend must use `VITE_SUPABASE_ANON_KEY`.
- The server prefers `SUPABASE_SERVICE_KEY`, but this repo also supports `SUPABASE_ANON_KEY` or `VITE_SUPABASE_ANON_KEY` as fallbacks in development.
- If the server logs `Missing Supabase credentials`, the backend env is missing or not loaded.
- If browser login fails with `401 Unauthorized` from `/auth/v1/token?grant_type=password`, first verify the client is using the anon key, not the service role key.
- After changing env files, restart both the Vite client and the Express server.

### Running the Application

#### Development Mode

Run both client and server concurrently:
```bash
npm run dev
```

Or run them separately:

**Client only** (React + Vite on http://localhost:5173):
```bash
npm run client
```

**Server only** (Express on http://localhost:3000):
```bash
npm run server
```

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Tech Stack

- **Frontend**: React, Vite, HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Development**: Concurrently for running multiple processes

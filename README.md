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
LIBRETRANSLATE_URL=http://127.0.0.1:5000
```

Notes:

- Do not put the service role or secret key in `client/.env`. The frontend must use `VITE_SUPABASE_ANON_KEY`.
- The server prefers `SUPABASE_SERVICE_KEY`, but this repo also supports `SUPABASE_ANON_KEY` or `VITE_SUPABASE_ANON_KEY` as fallbacks in development.
- If the server logs `Missing Supabase credentials`, the backend env is missing or not loaded.
- If browser login fails with `401 Unauthorized` from `/auth/v1/token?grant_type=password`, first verify the client is using the anon key, not the service role key.
- After changing env files, restart both the Vite client and the Express server.

### LibreTranslate Self-Hosting

The app is configured to use a self-hosted LibreTranslate instance by default instead of the paid public `libretranslate.com` endpoint.

Start LibreTranslate locally with Docker:

```bash
npm run translate
```

This starts a container on `http://127.0.0.1:5000`, which is the default URL used by the server translation service.

The command now waits until the LibreTranslate API is actually reachable before exiting. On the first run this may take a few minutes while models are downloaded.

This repo's bundled LibreTranslate setup has been verified with `en`, `fr`, and `tl`.

Stop it with:

```bash
npm run translate:stop
```

If Docker is already installed and you want the raw compose command, you can also run:

```bash
npm run translate:docker
```

Notes:

- If you host LibreTranslate elsewhere, set `LIBRETRANSLATE_URL` in `server/.env` to that internal or public URL.
- `LIBRETRANSLATE_API_KEY` is optional for self-hosting and should usually be left unset unless you enable API keys on your own instance.
- The first container start may take longer while models are downloaded.
- The included Docker setup is currently intended for `en`, `fr`, and `tl`. If you need more LibreTranslate-supported languages, add them to `LT_LOAD_ONLY` in [docker-compose.libretranslate.yml](docker-compose.libretranslate.yml) and verify they are exposed by `/languages` in your local image.
- On Windows, Docker Desktop is the simplest way to run the included compose file.
- If `npm run translate` says Docker is not installed, install Docker Desktop and reopen your terminal before retrying.
- If `npm run translate` says the Docker engine is not running, open Docker Desktop first and wait for it to finish starting before retrying.
- If you prefer not to use Docker, install Python 3.8+ and run LibreTranslate yourself, then point `LIBRETRANSLATE_URL` at that instance.

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

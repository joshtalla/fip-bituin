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

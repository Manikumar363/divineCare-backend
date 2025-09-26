# DivineCare Backend

A Node.js backend API for DivineCare healthcare website and admin panel.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Update `.env` file with your configuration

4. Start development server:

```bash
npm run dev
```

## API Endpoints

- Health Check: `GET /health`

## Project Structure

```
divineCare-backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers (to be added)
│   ├── models/         # Database models (to be added)
│   ├── routes/         # Express routes
│   ├── middleware/     # Custom middleware
│   └── utils/          # Utility functions (to be added)
├── server.js           # Entry point
└── package.json
```

Server will run on http://localhost:5000

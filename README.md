# Auto-Integrate Hub

A demo automation hub for managing connectors and viewing sync run history. Built with Node.js, Express, and SQLite.

## Features
- Connector directory with status
- Integration run log
- Simple REST API

## Quickstart
```bash
npm install
npm start
```
Open: http://localhost:3002

## API
- `GET /api/connectors`
- `POST /api/connectors` → `{ name, status }`
- `GET /api/runs`
- `POST /api/runs` → `{ connector_id, status, duration_ms }`

## Data Model
`connectors`, `runs`

## Screenshots
_Add screenshots here._

## Notes
- SQLite DB stored at `data/auto-integrate.db`.

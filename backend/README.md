## Live Polling Backend (Express + Socket.io)

- Install: `npm install`
- Dev: `npm run dev`
- Start (prod): `npm start`

Environment variables:
- `PORT` (default 4000)
- `CORS_ORIGIN` (default *)
- `POLL_TIME_LIMIT_DEFAULT` (default 60)
- `DATA_DIR` (default storage)

### API
- `POST /api/polls` → create poll
- `GET /api/polls/:pollId` → poll summary
- `GET /api/polls/:pollId/results` → latest results

Socket.io events documented in `src/sockets/pollSocket.js`.
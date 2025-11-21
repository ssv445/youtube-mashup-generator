# Port Configuration

## Current Ports

- **Frontend (Next.js)**: `3031`
- **Backend (Express)**: `3032`
- **Available for Future**: `3033`, `3034`, etc.

## Configuration Files

### Frontend Port (3031)
- `frontend/package.json` - dev and start scripts use `-p 3031`

### Backend Port (3032)
- `backend/server.js` - `PORT = process.env.PORT || 3032`
- `frontend/components/GenerateButton.tsx` - API calls to `localhost:3032`
- `frontend/.env.local` - `NEXT_PUBLIC_API_URL=http://localhost:3032`

## Access URLs

- Frontend: http://localhost:3031
- Backend API: http://localhost:3032
- Backend Health Check: http://localhost:3032/health
- Backend Status: http://localhost:3032/api/status

## Changing Ports

### Change Frontend Port
Edit `frontend/package.json`:
```json
"dev": "next dev -p YOUR_PORT",
"start": "next start -p YOUR_PORT"
```

### Change Backend Port
Option 1 - Edit `backend/server.js`:
```javascript
const PORT = process.env.PORT || YOUR_PORT;
```

Option 2 - Use environment variable:
```bash
PORT=YOUR_PORT npm run dev:backend
```

Don't forget to update:
- `frontend/components/GenerateButton.tsx`
- `frontend/.env.local`

## Why These Ports?

- Avoids common conflicts with:
  - 3000 (default Next.js, Create React App, etc.)
  - 3001 (common backend port)
  - 8000-8080 (common dev servers)
- Easy to remember: 303X series
- Room for expansion: 3033, 3034 for future services

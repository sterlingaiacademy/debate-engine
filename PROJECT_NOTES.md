# Project Notes: Grace & Force AI (debate-engine)

Voice AI debate platform. Use this file to get a new machine or a new AI session up to speed.

## Repo
- GitHub: `sterlingaiacademy/debate-engine`
- **`main` is the source of truth** (it holds the latest work, commit `d8030e26`, Sep 22 and later).
- Always run `git pull origin main` first. Commit and push at the end of each session.

## Layout
- `frontend/`: Vite + React app (`npm run dev`, `npm run build`)
- `backend/`: Node/Express (`server.js`, local `node server.js`), Postgres via `DATABASE_URL`
- Root `package.json`: `npm run build` installs both packages, builds the frontend and runs the migrations
- `backend/*.js` and `*.cjs`: many one-off ops, deploy and check scripts using `ssh2`

## Setup on a new machine (Windows)
1. Install Git and Node.js LTS.
2. `git clone https://github.com/sterlingaiacademy/debate-engine.git`
3. `cd debate-engine && git checkout main`
4. `npm install --prefix backend && npm install --prefix frontend && npm install`
5. Copy `backend/.env` and `frontend/.env` from the transfer bundle. They are gitignored.
   See `backend/.env.example` for the key names (DATABASE_URL, ELEVENLABS_API_KEY, ...).
6. Run the backend with `cd backend && node server.js`, and the frontend with `cd frontend && npm run dev`.

## Production server
- Host user: `graceandforce`, project dir `/home/graceandforce/debate-engine`
- Node via nvm (`source ~/.nvm/nvm.sh`), process manager is PM2, frontend is served by nginx from the built `dist`
- Deploy: SSH in, then `git pull origin main`, `npm run build --prefix frontend`, copy `dist` to the nginx root, restart PM2.
  The existing scripts in `frontend/` and `backend/` (`deploy_*.js`, `build_and_deploy_*.cjs`) automate this.
- **Lesson learned:** work had lived only on the server's local `main` for weeks. Never leave commits on the server.
  Commit on your laptop, push, then pull on the server.

## Security TODO
- Revoke the old GitHub token (it was embedded in the server git remote). Create a new one and reset the remote:
  `git remote set-url origin https://github.com/sterlingaiacademy/debate-engine.git`
- Many helper scripts may hold hard-coded server credentials. Move them to env vars when possible.

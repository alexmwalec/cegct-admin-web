# CEGCT Dashboard Frontend

React and Tailwind web client for the CEGCT Express/MySQL/Socket.IO backend. See the [repository README](../README.md) for complete database setup and backend API instructions.

## Configure

Install dependencies and set the API URL in `.env`:

```bash
npm install
cp .env.example .env
npm start
```

By default the client calls `http://localhost:5000/api`. Start the API first and create an administrator account using the backend setup instructions. Dashboard login accepts `ADMIN` and `INSPECTOR` accounts only.

## Pages

- `/login` — API-backed dashboard authentication
- `/dashboard` — report counts, map, recent live report feed
- `/reports` — searchable report queue
- `/report/:id` — status and inspector assignment, inspection notes and timeline
- `/analytics` — API-backed reporting and resolution metrics
- `/officers` — inspector directory from MySQL

The Socket.IO client receives new report and report update events using the JWT saved after login. The backend also exposes secured chat endpoints and report chat rooms for mobile or future dashboard chat clients.

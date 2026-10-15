# CEGCT Admin Dashboard

Admin dashboard and HTTP/realtime backend for the Community Environmental Guardian & Cleanliness Tracker. Administrators and inspectors can review and assign citizen reports, change case status, add inspection notes, and view reports as they arrive.

## Repository layout

- `cegct-frontend/` — React 19, React Router, and Tailwind dashboard.
- `backend/` — Express API, MySQL persistence, JWT authentication, and Socket.IO server.
- `backend/sql/schema.sql` — MySQL schema for users, categories, reports, chat, inspections, and announcements.

The API and Socket.IO share port `5000`. The React development server defaults to port `3000`.

## Requirements

- Node.js 18 or later and npm
- MySQL 8.0.16 or later (spatial SRID support is used)

## Configure and initialize MySQL

Create the database schema using a MySQL account that can create a database and tables:

```bash
mysql -u root -p < backend/sql/schema.sql
```

Create a restricted MySQL account for the API and grant it access to the `cegct` database. Copy `backend/.env.example` to `backend/.env` and set the database values, a long random `JWT_SECRET`, and the frontend origin. Do not commit `.env` files.

Create the first administrator or reset the password for an existing admin. The command reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `backend/.env`, hashes the password with bcrypt, and writes that hash to MySQL. Re-running it for an existing `ADMIN` account updates its name and password. It will not promote a citizen or inspector account.

```bash
cd backend
npm install
# Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env first.
npm run create-admin
npm run dev
```

`ADMIN_PASSWORD` must contain at least 12 characters. Add inspector accounts to `users` with `role='INSPECTOR'`; the officers endpoint and assignment picker read from these rows. Citizen accounts use `role='CITIZEN'` and are not permitted to sign in to the dashboard.

## Start the frontend

In another terminal:

```bash
cd cegct-frontend
npm install
cp .env.example .env
npm start
```

For a deployed frontend, set `REACT_APP_API_URL` to the deployed API base URL ending in `/api`. Set `CLIENT_ORIGIN` in the backend to the frontend origin. For multiple clients, `CLIENT_ORIGIN` accepts a comma-separated allowlist.

## API overview

All routes except `GET /api/health` and `POST /api/auth/login` require a bearer token unless noted. Login tokens are JWTs with the account ID and role. Staff-only routes accept `ADMIN` or `INSPECTOR`; announcement creation is admin-only. Citizens can submit reports and read/post messages on their own reports.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API and database readiness |
| `POST` | `/api/auth/login` | Authenticate dashboard user |
| `GET` | `/api/auth/me` | Current authenticated account |
| `GET` | `/api/reports` | List reports; supports status/category/urgency/search/limit filters |
| `POST` | `/api/reports` | Submit a report with longitude/latitude and optional photo URL |
| `GET` | `/api/reports/:id` | Report details |
| `PATCH` | `/api/reports/:id` | Update status, assign inspector, and/or add inspection note |
| `GET` | `/api/reports/:id/timeline` | Inspection history |
| `GET` | `/api/officers` | Inspector directory |
| `GET`, `POST` | `/api/reports/:id/messages` | Read or send case messages |
| `GET` | `/api/analytics?range=7d\|30d\|2m\|1y` | Report, resolution, and category metrics |
| `GET`, `POST` | `/api/announcements` | List announcements; admin can publish |

Socket.IO uses the same origin and requires the same bearer JWT in its `auth.token`. Staff sockets join the `admin_reports` channel automatically. A client joins a case chat with `join_report_room` and only the report owner or staff can join. Events include `admin:new_report`, `report:updated`, `chat:new_message`, and `announcement:new`.

## Database notes

The supplied schema is MySQL rather than Supabase/PostgreSQL. The backend uses MySQL spatial `POINT` values with longitude as X and latitude as Y, and exposes numeric `latitude`/`longitude` values to the map UI. Report status values follow the supplied MySQL enum, including `REOPENED`.

Images and voice notes are represented by URL fields (`photo_url`, `voice_note_url`, and inspection photo URL). This API does not upload binary files; connect an object storage service or add an upload service before accepting media uploads.

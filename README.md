# CEGCT Admin Dashboard

Admin dashboard and HTTP/realtime backend for the Community Environmental Guardian & Cleanliness Tracker. Administrators and inspectors can review citizen reports, change case status, add inspection notes, and view reports as they arrive.

## Repository layout

- `cegct-frontend/` — React 19, React Router, and Tailwind dashboard.
- `backend/` — Express API, MySQL persistence, JWT authentication, and Socket.IO server.
- `backend/sql/schema.sql` — MySQL schema for users, categories, reports, chat, inspections, and announcements.
- `backend/sql/schema_railway.sql` — same schema for the database provisioned by Railway.

The API and Socket.IO share port `5000`. The React development server defaults to port `3000`.

## Requirements

- Node.js 18 or later and npm
- MySQL 8.0.16 or later (spatial SRID support is used)

## Configure and initialize MySQL

Create the local database schema using a MySQL account that can create a database and tables:

```bash
mysql -u root -p < backend/sql/schema.sql
```

Create a restricted MySQL account for the API and grant it access to the `cegct` database. Copy `backend/.env.example` to `backend/.env` and set the database values, a long random `JWT_SECRET`, and the frontend origin. Do not commit `.env` files.

The API creates and backfills the report-ID sequence table automatically at startup. To apply it manually instead:

```bash
mysql -u root -p cegct < backend/sql/migration_report_ids.sql
```

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
## Deploy so it runs while your computer is off

The local computer should only be used to edit and deploy the code. Host the Express/Socket.IO API and MySQL database on Railway, and the React site on Netlify. Railway keeps the API and database running independently of your PC; Netlify serves the built dashboard. Railway MySQL is private by default, so the API should connect over Railway's private network rather than exposing the database publicly.

1. Push this repository to a private GitHub repository. Create a Railway project from that repository and add a **MySQL** service.
2. Add a Railway service for this repository's `backend/` directory. Set its root directory to `/backend`, start command to `npm start`, and add these variables using Railway's variable references (replace `MySQL` with the exact name of your database service):

   ```text
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   DB_NAME=${{MySQL.MYSQLDATABASE}}
   JWT_SECRET=<a long random secret>
   CLIENT_ORIGIN=<your Netlify site URL>
   NODE_ENV=production
   ```

   Railway sets `PORT` for the API. Do not hardcode it. The backend already listens on `process.env.PORT`.
3. Initialize the Railway database by temporarily enabling its TCP Proxy, then import `backend/sql/schema_railway.sql` into the database named by `MYSQLDATABASE` with MySQL Workbench or the MySQL CLI. For example: `mysql -h <proxy-host> -P <proxy-port> -u <MYSQLUSER> -p <MYSQLDATABASE> < backend/sql/schema_railway.sql`. For an existing local database, export its data and import it into Railway before switching either app. Keep regular database backups enabled. The API creates and backfills `report_sequences` automatically on startup for existing databases.
4. Generate a public Railway domain for the API service. Verify `https://<api-domain>/api/health` returns `{"ok":true,"database":"connected"}`. Set `CLIENT_ORIGIN` to the exact Netlify site origin (no `/api` path) and redeploy the API.
5. In Netlify, import this same GitHub repository. The root `netlify.toml` sets the base directory to `cegct-frontend`, builds with `npm run build`, publishes `build`, and routes SPA paths to `index.html`. Add this Netlify environment variable before deploying:

   ```text
   REACT_APP_API_URL=https://<api-domain>/api
   ```

   Redeploy after setting it because Create React App embeds `REACT_APP_*` values at build time. The Netlify URL must also match the API's `CLIENT_ORIGIN` value.
6. Create the first admin in the hosted database. Temporarily enable Railway MySQL TCP Proxy, copy its external host, port, and credentials into a **local, uncommitted** `backend/.env` along with `ADMIN_NAME`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD`, then run `cd backend && npm install && npm run create-admin`. Disable the TCP Proxy after the admin is created. Never put database credentials or `JWT_SECRET` in Netlify or in a `REACT_APP_*` variable.
7. Update the mobile app's API base URL to `https://<api-domain>/api` (not `localhost`, a LAN address, or the Railway MySQL URL). Sign in again if it holds a token from another API/database. Confirm a mobile-created report appears in the dashboard; the dashboard also refreshes from the API every 15 seconds if Socket.IO reconnects or drops.

For a Railway MySQL external connection, Railway requires enabling TCP Proxy and provides a separate external connection URL. Disable that proxy when setup/import is complete; the API uses the database's internal service variables. Check Railway's current pricing, storage, and backup limits for the selected plan before production use.

## API overview

All routes except `GET /api/health`, `POST /api/auth/login`, `POST /api/auth/mobile/login`, and `POST /api/auth/register` require a bearer token unless noted. Login tokens are JWTs with the account ID and role. Staff-only routes accept `ADMIN` or `INSPECTOR`; announcement creation is admin-only. Citizens can submit reports and read/post messages on their own reports.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API and database readiness |
| `POST` | `/api/auth/login` | Authenticate dashboard user |
| `POST` | `/api/auth/register` | Register a citizen; returns a token and citizen profile |
| `POST` | `/api/auth/mobile/login` | Authenticate a citizen mobile account |
| `GET` | `/api/auth/me` | Current authenticated account |
| `GET` | `/api/reports` | List reports; supports status/category/urgency/search/limit filters |
| `POST` | `/api/reports` | Submit a report with GPS coordinates and optional public `photoUrl`/`photo_url` evidence URL |
| `GET` | `/api/reports/:id` | Report details |
| `PATCH` | `/api/reports/:id` | Update status, assign inspector, and/or add inspection note |
| `GET` | `/api/reports/:id/timeline` | Inspection history |
| `GET` | `/api/officers` | Inspector directory |
| `GET`, `POST` | `/api/reports/:id/messages` | Read or send case messages |
| `GET` | `/api/analytics?range=7d\|30d\|2m\|1y` | Report, resolution, and category metrics |
| `GET`, `POST` | `/api/announcements` | List announcements; admin can publish |

Mobile login sends JSON to `/api/auth/mobile/login`:

```json
{ "email": "citizen@example.com", "password": "the-account-password" }
```

A successful response contains `{ "token": "...", "user": { "id": "...", "name": "...", "email": "...", "role": "CITIZEN", "phone": "..." } }`. The mobile app should store the token securely and send it on protected requests as `Authorization: Bearer <token>`. This route only authenticates `CITIZEN` accounts; `/api/auth/login` remains for dashboard staff.

New report IDs use Malawi local date and a daily sequence, formatted like `15-10-2026-ID001`. Socket.IO uses the same origin and requires the same bearer JWT in its `auth.token`. Staff sockets join the `admin_reports` channel automatically. A citizen client joins its own report room with `join_report_room` and receives `report:status_changed` when staff changes the status. Fetch `GET /api/reports/:id` after reconnecting to get the latest status. Events also include `admin:new_report`, `report:updated`, `chat:new_message`, and `announcement:new`.

## Database notes

The supplied schema is MySQL rather than Supabase/PostgreSQL. The backend uses MySQL spatial `POINT` values with longitude as X and latitude as Y, and exposes numeric `latitude`/`longitude` values to the map UI. Report status values follow the supplied MySQL enum, including `REOPENED`.

Images and voice notes are represented by URL fields (`photo_url`, `voice_note_url`, and inspection photo URL). Mobile should upload the image to its configured storage service, then send the resulting web-accessible HTTPS URL as `photoUrl` or `photo_url` with the report. A device-local path such as `file://...` or `content://...` cannot be displayed by the admin dashboard. This API does not upload binary files itself.

### If mobile reports do not appear

Verify both apps use the same deployed API/database. In the mobile app, log the final request URL, HTTP status, response JSON, and sanitized request fields (never log passwords or tokens); expect `POST /api/reports` with a valid citizen bearer token and GPS coordinates. A successful response is HTTP 201 with `data.id`. Then sign in to the dashboard and open `/api/health`; verify the dashboard is using the same API URL. Reports sent by this API appear immediately through Socket.IO and are also fetched on the dashboard's 15-second refresh. Direct database writes should appear on that refresh only if they target the same Railway database and satisfy the schema/required columns.

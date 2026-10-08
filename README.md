# CEGCT Admin Dashboard

**Repository description:** Dashboard for reviewing CEGCT environmental reports, assigning officers, tracking case progress, and viewing regional analytics.

CEGCT (Community Environmental Guardian & Cleanliness Tracker) is a web dashboard concept for administrators and environmental officers. It provides a shared view of citizen-submitted reports and case management workflows.

## Current implementation

This repository contains the frontend application. It currently uses sample report and officer data held in client-side React state. Changes made in the interface are temporary and reset when the page reloads.

The following workflows are available:

- **Login:** sign-in form that opens the dashboard. Firebase authentication and role checks are connected.
- **Overview:** Summary cards, a report location visualization, recent report feed, and regional response metrics.
- **Reports:** Search and filter reports by text, status, and category.
- **Case details:** Change a report status or assigned officer and add progress notes.
- **Analytics:** View  report and resolution charts and choose a reporting period.
- **Officers:** View a regional officer directory.

Firebase database access, authentication, realtime subscriptions, storage media, and server persistence have not been connected. The map and analytics currently use frontend visualizations and sample values.

## Technology

- React 19 with Create React App
- React Router for client-side routes
- Tailwind CSS 3 for styling
- JavaScript and JSX

## Requirements

- Node.js and npm
- Project dependencies installed with `npm install`

The application imports `react-router-dom`. If it is not installed in your environment, add it with:

```bash
npm install react-router-dom
```

## Run locally

```bash
npm install
npm start
```

The development server opens at [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Page |
| --- | --- |
| `/login` | Demo administrator sign-in |
| `/dashboard` | Operational overview |
| `/dashboard/map` | Incident map view |
| `/dashboard/recent` | Recent reports feed |
| `/reports` | Searchable reports queue |
| `/report/:id` | Case details and progress updates |
| `/analytics` | Environmental impact analytics |
| `/officers` | Regional officer directory |


# DR Dispatcher — Frontend

The frontend of the **DR Dispatcher** application is a React-based web application used to authenticate users, display Demand Response (DR) events, filter/search them, and perform DR workflow actions.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [How the Frontend Works](#how-the-frontend-works)
- [Authentication](#authentication)
- [DR Dashboard](#dr-dashboard)
- [Filtering and Search](#filtering-and-search)
- [DR Actions](#dr-actions)
- [API Communication](#api-communication)
- [Environment Configuration](#environment-configuration)
- [Running the Frontend](#running-the-frontend)
- [Important Notes](#important-notes)

## Overview

The frontend is responsible for everything the user sees and interacts with in the browser.

It communicates with the backend through REST APIs and does not directly access MongoDB.

### Basic flow

```text
User
 ↓
React UI
 ↓
Page / Component
 ↓
Frontend Service
 ↓
Axios
 ↓
Backend API
 ↓
Response
 ↓
React State
 ↓
Updated UI
```

## Features

- User signup and login
- Authentication state management
- Session restoration after page refresh
- Protected DR Dispatcher route
- DR event listing
- DR ID search
- 1000 ms debounced search
- Status filtering
- Event type filtering
- Date-range filtering
- Refresh functionality
- Expandable datacenter details
- Opt IN / Opt OUT actions
- Optimized YES / NO actions
- Submitted YES / NO actions
- Loading and disabled states during updates
- Error messages on authentication-related screens

## Technology Stack

| Technology | Version | Purpose |
|---|---:|---|
| React | ^19.2.8 | UI development |
| React DOM | ^19.2.8 | Mounts React application |
| React Router DOM | ^7.18.3 | Client-side routing |
| Axios | ^1.20.0 | HTTP communication |
| Vite | ^8.2.2 | Development server and build tool |
| Node.js | v18+ / v20+ | JavaScript runtime |

## Project Structure

```text
client/
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── App.css
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── assets/
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    ├── components/
    │   ├── DRFilters.css
    │   ├── DRFilters.jsx
    │   ├── DRTable.css
    │   ├── DRTable.jsx
    │   └── ProtectedRoute.jsx
    ├── context/
    │   └── AuthContext.jsx
    ├── pages/
    │   ├── DRDispatcher.css
    │   ├── DRDispatcher.jsx
    │   ├── Login.css
    │   ├── Login.jsx
    │   ├── Signup.css
    │   └── Signup.jsx
    └── services/
        ├── api.js
        ├── authService.js
        └── drService.js
```

## How the Frontend Works

### Entry Point

`src/main.jsx`

This is where the React application starts.

It:

1. Creates the React root.
2. Wraps the application with `AuthProvider`.
3. Enables React `StrictMode`.
4. Loads global CSS.
5. Renders `<App />`.

### Routing

`src/App.jsx`

The application defines these routes:

```text
/login
/signup
/dr-dispatcher
```

The `/dr-dispatcher` route is protected by `ProtectedRoute`.

### Pages

#### `Login.jsx`

Handles user login.

It stores:

- Email
- Password
- Error state
- Submit/loading state

On successful login, the user is redirected to:

```text
/dr-dispatcher
```

#### `Signup.jsx`

Handles new account registration.

It collects:

- Name
- Email
- Password

After successful registration, a success message is displayed.

#### `DRDispatcher.jsx`

This is the main dashboard page.

It manages:

- DR records
- Loading state
- Error state
- Active filters
- Fetching DR data
- Updating DR actions
- Refreshing the table

## Authentication

Authentication is managed mainly through:

```text
AuthContext.jsx
authService.js
api.js
ProtectedRoute.jsx
```

### Login flow

```text
Login.jsx
 ↓
AuthContext.login()
 ↓
authService.login()
 ↓
Axios
 ↓
POST /api/auth/login
 ↓
Backend returns JWT
 ↓
localStorage stores token
 ↓
AuthContext stores user
 ↓
Navigate to /dr-dispatcher
```

### Session restoration

When the application starts:

```text
Check localStorage for token
        ↓
Token exists?
   ↓             ↓
 No             Yes
 ↓               ↓
Logged out    GET /api/auth/me
                  ↓
             Token valid?
              ↓       ↓
             Yes      No
              ↓        ↓
         Restore user  Remove token
```

### Protected Route

`ProtectedRoute.jsx` checks:

1. Whether authentication is still loading.
2. Whether a user is authenticated.

If the user is not authenticated, it redirects to `/login`.

## DR Dashboard

`DRDispatcher.jsx` coordinates the DR dashboard.

The dashboard receives DR records from:

```text
GET /api/dr
```

The returned records are stored in React state and passed to:

```text
DRTable.jsx
```

## Filtering and Search

`DRFilters.jsx` provides:

- Search
- Status
- Event type
- From date
- To date
- Refresh

### Search debounce

Search waits **1000 ms** after the user stops typing before calling the API.

```text
User types
   ↓
searchInput changes
   ↓
Wait 1000 ms
   ↓
Search API request
```

If the user types again before the timer finishes, the previous timer is cancelled.

### Available status filters

```text
Planned
In-progress
Completed
```

### Available event types

```text
DR
EEA
```

### Date filtering

The frontend sends:

```text
fromDate
toDate
```

The backend handles the actual database date range.

## DR Actions

`DRTable.jsx` displays the DR workflow controls.

### Workflow

```text
Planned
   ├── Opt OUT → Completed
   │
   └── Opt IN → In-progress
                    ↓
             Optimized YES/NO
                    ↓
             Submitted YES/NO
                    ↓
                 Completed
```

The frontend disables buttons when an action is not currently available.

For example:

- Optimized is disabled before Opt IN.
- Submitted is disabled before the required previous workflow state.
- Completed actions cannot be selected again.
- Other buttons are disabled while an update is being processed.

The backend remains the final authority for these business rules.

## API Communication

`src/services/api.js`

Creates a shared Axios instance.

Default API base URL:

```text
http://localhost:5001/api
```

or:

```text
VITE_API_URL
```

if that environment variable is configured.

### JWT interceptor

Before sending a request, Axios checks:

```text
localStorage.getItem("token")
```

If a token exists, it adds:

```http
Authorization: Bearer <token>
```

to the request.

### Authentication service

`authService.js`

Provides:

```text
signup()
login()
getCurrentUser()
```

### DR service

`drService.js`

Provides:

```text
getDRs()
updateDRAction()
```

## Environment Configuration

The frontend can use:

```text
VITE_API_URL
```

Example:

```env
VITE_API_URL=http://localhost:5001/api
```

If it is not provided, `api.js` uses:

```text
http://localhost:5001/api
```

## Running the Frontend

From the `client` directory:

```bash
npm install
npm run dev
```

The Vite development server starts the frontend.

For a production build:

```bash
npm run build
```

For linting:

```bash
npm run lint
```

## Important Notes

### Backend connection

The frontend depends on the backend API being available.

### CORS

The current backend configuration expects the frontend origin:

```text
http://localhost:5174
```

If the frontend runs on another port, CORS configuration may need to be changed on the backend.

### Root route

The current routing configuration does not define `/`.

The defined routes are:

```text
/login
/signup
/dr-dispatcher
```

Therefore, opening `/` does not currently map to a page.

### Error handling

Authentication pages display API errors.

The DR update flow currently has a limitation: an update failure can reset the loading state without displaying a useful error message to the operator.

## Summary

The frontend follows a component-based React architecture:

```text
Pages
 ↓
Components
 ↓
Frontend Services
 ↓
Axios
 ↓
Backend API
```

Authentication is handled through React Context and JWT-based sessions. DR data is fetched through the backend API, displayed in an interactive table, and updated through protected API requests.

# DR Dispatcher — Frontend Documentation
## Technical + Simple Language

This document explains the frontend in two ways:
- **Simple language:** what each part does and why it exists.
- **Technical details:** the actual files, React concepts, functions, API calls, and behavior documented in the project analysis.

---

# 1. Frontend in Simple Terms

The frontend is the part of the DR Dispatcher application that the user sees and interacts with in the browser.

It is responsible for:
- Showing Login and Signup pages.
- Keeping track of whether the user is logged in.
- Protecting the DR Dispatcher page from unauthenticated users.
- Showing DR events in a table.
- Searching and filtering DR events.
- Expanding a DR row to see datacenter details.
- Providing Opt IN, Opt OUT, Optimized, and Submitted buttons.
- Sending user actions to the backend.
- Updating the screen after the backend confirms an action.

### Simple frontend flow

**User → React page → Component → Frontend service → Axios → Backend API → Response → React state → Screen update**

The frontend does **not** directly talk to MongoDB. It communicates with the backend API.

---

# 2. Frontend Technology

| Technology | What it does |
|---|---|
| React | Builds the user interface |
| React DOM | Mounts React into the browser |
| React Router DOM | Handles frontend URLs/pages |
| Axios | Sends HTTP requests to the backend |
| Vite | Runs and builds the frontend |
| Context API | Shares authentication state across components |

---

# 3. Frontend Folder Structure

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

---

# 4. What Each Frontend File Does



---

# 5. Important Frontend Concepts in Simple Language

## State

State is information that can change while the application is running.

Examples:
- Login form values.
- Current logged-in user.
- Search text.
- Selected filters.
- DR records.
- Which DR row is expanded.
- Whether a DR row is currently being updated.

React's `useState()` is used for these values.

## Props

Props are values/functions passed from a parent component to a child component.

Example:

```text
DRDispatcher
    ↓
DRFilters
    ↓
filters + onFilterChange + onRefresh
```

and:

```text
DRDispatcher
    ↓
DRTable
    ↓
drs + onDRUpdate
```

## Context

`AuthContext.jsx` provides authentication information to multiple components without manually passing it through every component.

It provides:
- user
- loading
- isAuthenticated
- login()
- signup()
- logout()

## useEffect

`useEffect()` is used when something should happen because a component was loaded or a value changed.

This project uses it for:
- Restoring login session.
- Loading DR data when the dashboard opens.
- Waiting 1000 ms before applying search input.

## useCallback

`useCallback()` is used for functions such as `fetchDRs` and `handleFilterChange` so their references remain stable when passed to child components.

---

# 6. Frontend Authentication in Simple Language

When the user logs in:

1. User enters email and password.
2. `Login.jsx` sends the data to `AuthContext.login()`.
3. `AuthContext` calls `authService.login()`.
4. `authService` calls the backend.
5. Backend returns a JWT token.
6. Frontend stores the token in `localStorage`.
7. User information is stored in React state.
8. User is navigated to `/dr-dispatcher`.

For later API calls, `api.js` reads the token and adds:

```text
Authorization: Bearer <token>
```

The backend then verifies the token.

---

# 7. Session Restoration

If the browser is refreshed:

1. `AuthContext` checks `localStorage`.
2. It looks for `token`.
3. If there is no token, the user is considered logged out.
4. If there is a token, frontend calls `/api/auth/me`.
5. Backend verifies the token.
6. If valid, the returned user is placed into React state.
7. The user remains logged in.
8. If invalid, the token is removed.

This is why the login session can survive a page refresh.

---

# 8. Route Protection

The DR Dispatcher page is protected by:

```text
ProtectedRoute
```

Simple logic:

```text
Is authentication still loading?
        ↓
      Yes → show Loading

        No
        ↓
Is user authenticated?
        ↓
      No → redirect to /login

        Yes
        ↓
Show DR Dispatcher
```

This is frontend protection. The backend still performs its own JWT verification for protected API requests.

---

# 9. DR Dashboard Flow

When `/dr-dispatcher` opens:

```text
DRDispatcher.jsx
      ↓
fetchDRs()
      ↓
drService.getDRs()
      ↓
Axios
      ↓
GET /api/dr
      ↓
Backend
      ↓
DR records returned
      ↓
setDrs()
      ↓
DRTable.jsx
      ↓
Rows displayed
```

---

# 10. Filtering in Simple Language

The user can filter DR events using:

- Search by `drId`.
- Status.
- Event type.
- From date.
- To date.
- Refresh.

### Search

Search has a **1000 ms debounce**.

That means the frontend waits for the user to stop typing for one second before sending the search request.

Example:

```text
User types: D
User types: DR
User types: DR0
User types: DR00
        ↓
Wait 1 second
        ↓
Send search request
```

This avoids sending an API request for every individual keystroke.

### Other filters

Status, event type, and date inputs call the filter handler immediately when changed.

---

# 11. DR Table Actions

The table allows the user to progress a DR event through its workflow.

### Initial state

```text
Planned
```

User can choose:

```text
Opt IN
```

or:

```text
Opt OUT
```

### Opt IN

```text
Planned
   ↓
Opt IN
   ↓
In-progress
```

Then:

```text
Optimized = YES / NO
```

Then:

```text
Submitted = YES / NO
   ↓
Completed
```

### Opt OUT

Opt OUT directly completes the DR:

```text
Planned
   ↓
Opt OUT
   ↓
Completed
```

The backend is the final authority for these rules.

---

# 12. Example: Clicking Opt IN

When the user clicks **Opt IN**:

```text
DRTable.jsx
   ↓
handleAction()
   ↓
DRDispatcher.jsx
   ↓
handleDRUpdate()
   ↓
drService.updateDRAction()
   ↓
Axios PATCH request
   ↓
Backend
   ↓
Database update
   ↓
Updated DR returned
   ↓
DRDispatcher replaces old DR in state
   ↓
React re-renders table
```

While the request is running, `updatingDR` is set to the current DR ID.

This disables concurrent actions on that row.

---

# 13. Frontend and Backend Responsibility

A useful way to understand the application is:

| Frontend | Backend |
|---|---|
| Shows buttons | Decides whether action is valid |
| Disables buttons based on current state | Enforces rules even if frontend is bypassed |
| Collects filter values | Builds database query |
| Sends API request | Processes API request |
| Stores UI state | Stores permanent data |
| Displays errors | Generates API errors |
| Stores JWT in localStorage | Verifies JWT |
| Displays DR records | Reads DR records from MongoDB |

The frontend improves user experience, but the backend must enforce important business rules.

---

# 14. Current Frontend Issues / Quirks

According to the project analysis:

1. `handleDRUpdate` does not catch update errors in `DRDispatcher.jsx`, so an action failure may not show a useful error message.
2. There is no `/` route in `App.jsx`, so opening the root URL can result in a blank page.
3. Axios defaults to `http://localhost:5001/api`.
4. The backend CORS configuration expects the frontend at `http://localhost:5174`.
5. `App.css` is Vite starter boilerplate and is not referenced by `App.jsx`.

---

# 15. Frontend Summary

In simple terms:

**React builds the screen.**

**Pages manage major screens.**

**Components manage individual UI sections.**

**Context manages login state.**

**Services communicate with the backend.**

**Axios sends HTTP requests and attaches the JWT.**

**React state controls what the user sees.**

**The backend remains responsible for authentication verification, database operations, and DR business rules.**

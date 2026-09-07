# DR Dispatcher — Backend

The backend of the **DR Dispatcher** application is a Node.js and Express REST API. It handles authentication, DR event data, business rules, and communication with MongoDB.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [DR Workflow](#dr-workflow)
- [Database Models](#database-models)
- [Filtering](#filtering)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)
- [Running the Backend](#running-the-backend)
- [Important Notes](#important-notes)

## Overview

The backend is responsible for the server-side work of the application.

It:

- Receives requests from the React frontend.
- Authenticates users.
- Creates and verifies JWTs.
- Reads DR events from MongoDB.
- Filters and sorts DR events.
- Validates DR workflow actions.
- Saves changes to MongoDB.
- Returns JSON responses.

### Basic request flow

```text
Frontend
 ↓
Route
 ↓
Authentication Middleware
 ↓
Controller
 ↓
Service
 ↓
Mongoose Model
 ↓
MongoDB
 ↓
Response
 ↓
Frontend
```

## Features

- User registration
- Password hashing with bcryptjs
- User login
- JWT generation
- JWT verification
- Protected API routes
- MongoDB connection through Mongoose
- DR event retrieval
- DR search
- Status filtering
- Event type filtering
- Date-range filtering
- DR action updates
- DR state-machine validation
- HTTP error responses
- Helmet security headers
- CORS configuration
- Health-check endpoint

## Technology Stack

| Technology | Version | Purpose |
|---|---:|---|
| Node.js | v18+ / v20+ | Server runtime |
| Express | ^5.2.1 | REST API framework |
| MongoDB | 6.0+ | Database |
| Mongoose | ^9.9.4 | MongoDB ODM |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| Helmet | ^8.3.0 | Security headers |
| cors | ^2.8.6 | Cross-origin requests |
| nodemon | ^3.1.14 | Development auto-restart |

## Project Structure

```text
server/
├── package.json
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── authController.js
    │   └── drController.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── models/
    │   ├── DR.js
    │   └── User.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── drRoutes.js
    ├── seed/
    │   └── drData.js
    ├── services/
    │   ├── authService.js
    │   └── drService.js
    └── utils/
        └── jwt.js
```

## Architecture

The backend separates responsibilities into layers.

### Route

Routes define API URLs and connect them to middleware/controllers.

Example:

```text
PATCH /api/dr/:drId/action
```

### Middleware

Middleware performs checks before the controller runs.

`authMiddleware.js`:

- Reads the Authorization header.
- Extracts the JWT.
- Verifies the JWT.
- Finds the user.
- Places the user on `req.user`.
- Rejects invalid authentication.

### Controller

Controllers handle HTTP-specific work.

They:

- Read request parameters.
- Read query parameters.
- Read request bodies.
- Call services.
- Return HTTP responses.

### Service

Services contain the main application logic.

Examples:

```text
authService.js
drService.js
```

`drService.js` contains the DR workflow rules.

### Model

Models define the MongoDB document structure using Mongoose.

Models:

```text
User.js
DR.js
```

## Authentication

The backend uses:

- `bcryptjs` for password hashing/checking.
- `jsonwebtoken` for authentication tokens.

### Signup

```text
POST /api/auth/signup
```

Flow:

```text
Request
 ↓
authController.signup()
 ↓
Validate input
 ↓
authService.signup()
 ↓
Normalize email
 ↓
Check existing user
 ↓
Hash password with bcrypt
 ↓
Create User document
 ↓
Return user information
```

The password is stored as a bcrypt hash, not as plain text.

### Login

```text
POST /api/auth/login
```

Flow:

```text
Request
 ↓
Controller
 ↓
Auth Service
 ↓
Find user
 ↓
bcrypt.compare()
 ↓
Generate JWT
 ↓
Return token + user
```

### Protected request

For protected endpoints the client sends:

```http
Authorization: Bearer <token>
```

Then:

```text
Request
 ↓
authMiddleware
 ↓
jwt.verify()
 ↓
Find user
 ↓
req.user = user
 ↓
Controller
```

If the token is missing, invalid, expired, or the user no longer exists, the request is rejected with `401`.

## API Endpoints

### Health

```http
GET /api/health
```

Authentication:

```text
Not required
```

Returns:

```json
{
  "success": true,
  "message": "DR Dispatcher API is running"
}
```

### Signup

```http
POST /api/auth/signup
```

Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Successful response:

```text
201 Created
```

### Login

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Successful response includes:

```text
token
user
```

### Current User

```http
GET /api/auth/me
```

Authentication:

```text
Required
```

The JWT is verified and the current user is returned.

### Get DR Events

```http
GET /api/dr
```

Authentication:

```text
Required
```

Optional query parameters:

```text
search
status
eventType
fromDate
toDate
```

Example:

```text
GET /api/dr?search=DR0022&status=Planned&eventType=DR
```

The service builds a MongoDB query based on the supplied filters and sorts results by date descending.

### Update DR Action

```http
PATCH /api/dr/:drId/action
```

Authentication:

```text
Required
```

Body can contain:

```json
{
  "action": "Opt IN"
}
```

or:

```json
{
  "optimized": "YES"
}
```

or:

```json
{
  "submitted": "YES"
}
```

Successful response:

```text
200 OK
```

and contains the updated DR record.

## DR Workflow

The backend enforces a state machine.

### Initial state

```text
Planned
```

### Opt IN

```text
Planned
 ↓
Opt IN
 ↓
In-progress
```

After Opt IN, optimized can be selected:

```text
Optimized = YES / NO
```

Then submitted can be selected:

```text
Submitted = YES / NO
 ↓
Completed
```

### Opt OUT

```text
Planned
 ↓
Opt OUT
 ↓
Completed
```

For Opt OUT, the service sets:

```text
actions = ["Opt OUT"]
optimized = ["NO"]
submitted = ["NO"]
status = "Completed"
```

### Workflow protections

The service rejects:

- Changing an already completed action.
- Invalid action values.
- Optimized before Opt IN.
- Changing optimized after it has been completed.
- Invalid optimized values.
- Submitted before Opt IN.
- Changing submitted after completion.
- Invalid submitted values.
- Updates after the final submitted state.
- Empty update payloads.

## Database Models

MongoDB contains the main application data.

### User Model

`models/User.js`

Fields:

| Field | Type | Rules |
|---|---|---|
| name | String | Required, 2–50 characters |
| email | String | Required, unique, lowercase |
| password | String | Required, minimum 8 characters |
| createdAt | Date | Automatic |
| updatedAt | Date | Automatic |

### DR Model

`models/DR.js`

Main fields:

| Field | Type | Purpose |
|---|---|---|
| drId | String | DR event identifier |
| eventType | String | `DR` or `EEA` |
| date | Date | Event date |
| startTime | String | Event start time |
| endTime | String | Event end time |
| status | String | `Planned`, `In-progress`, or `Completed` |
| flexCalledMw | Number | Requested flexibility |
| flexAvailableMw | Number | Available flexibility |
| actions | Array | `Opt IN` / `Opt OUT` |
| optimized | Array | `YES` / `NO` |
| submitted | Array | `YES` / `NO` |
| datacenters | Array | Datacenter details |
| createdAt | Date | Automatic |
| updatedAt | Date | Automatic |

The DR model explicitly uses the MongoDB collection:

```text
drs
```

### Datacenter

Each DR can contain datacenter records with:

```text
dcId
flexCalledMw
flexAvailableMw
```

The embedded datacenter schema uses:

```text
_id: false
```

so Mongoose does not create an additional ObjectId for each embedded datacenter.

## Filtering

`drService.getAllDRs()` builds a MongoDB query dynamically.

### Search

Search matches `drId` using a case-insensitive regular expression.

### Status

Filters by:

```text
Planned
In-progress
Completed
```

### Event type

Filters by:

```text
DR
EEA
```

### From date

The selected date becomes the lower bound:

```text
00:00:00.000
```

### To date

The selected date becomes the upper bound:

```text
23:59:59.999
```

Results are sorted:

```javascript
.sort({ date: -1 })
```

so newer events appear first.

## Error Handling

The project currently uses these main HTTP status codes:

| Code | Meaning |
|---:|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid input or invalid DR workflow action |
| 401 | Authentication failure |
| 409 | User already exists |
| 500 | Unhandled server error |

### Current error-handling limitation

There is currently no custom Express error-handling middleware in `app.js`.

Some errors are passed to Express using:

```javascript
next(error)
```

which means Express's default error handler may return HTML/raw error output instead of the application's normal JSON error format.

## Environment Variables

The backend uses environment variables for configuration.

The database connection code expects:

```env
MONGO_URL=your_mongodb_connection_string
```

JWT generation and verification expects:

```env
JWT_SECRET=your_secret
```

The server port can use:

```env
PORT=5001
```

The code falls back to a default port when `PORT` is not provided.

## Running the Backend

From the `server` directory:

```bash
npm install
```

Start the backend:

```bash
npm start
```

For development with automatic restart:

```bash
npm run dev
```

The backend connects to MongoDB before starting the HTTP server.

## Important Notes

### MongoDB environment variable

The backend currently expects:

```text
MONGO_URL
```

The project analysis notes that the README configuration may refer to:

```text
MONGO_URI
```

These names must be made consistent for the database connection to work.

### CORS

The current `app.js` configuration allows:

```text
http://localhost:5174
```

If the frontend runs on another origin/port, the CORS configuration must be updated.

### Seed data

`seed/drData.js` is currently an empty placeholder.

There is no implemented automatic DR seed process in the documented codebase.

### Authorization

Authentication is implemented, but role-based authorization is not.

There is currently no role or permission system for users.

## Backend Summary

The backend follows this structure:

```text
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Models
  ↓
MongoDB
```

This separation keeps HTTP handling, authentication, business rules, and database logic organized.

The most important business logic is in `drService.js`, which controls the DR workflow and prevents invalid state transitions.

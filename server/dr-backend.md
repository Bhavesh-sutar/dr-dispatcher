# DR Dispatcher — Backend Documentation
## Technical + Simple Language

This document explains the backend in two ways:
- **Simple language:** what each backend layer does.
- **Technical details:** the actual files, functions, APIs, database models, authentication flow, and business rules documented in the project analysis.

---

# 1. Backend in Simple Terms

The backend is the part of the application that runs on the server.

Its main jobs are:

- Receive requests from the React frontend.
- Check whether a user is authenticated.
- Register and log users in.
- Create and verify JWT tokens.
- Read DR events from MongoDB.
- Apply search and filters.
- Validate DR workflow actions.
- Save DR changes to MongoDB.
- Send JSON responses back to the frontend.

### Simple backend flow

**Frontend → API Route → Middleware → Controller → Service → Model → MongoDB**

For example, when the frontend updates a DR:

```text
React
  ↓
PATCH /api/dr/DR0022/action
  ↓
Route
  ↓
JWT Middleware
  ↓
Controller
  ↓
DR Service
  ↓
Mongoose Model
  ↓
MongoDB
  ↓
Response
  ↓
Frontend
```

---

# 2. Backend Layers in Simple Language

| Layer | Simple meaning |
|---|---|
| Route | Decides which function should handle a URL |
| Middleware | Performs checks before the main function runs |
| Controller | Handles HTTP request/response details |
| Service | Contains the actual business logic |
| Model | Defines the database structure and talks to MongoDB |
| MongoDB | Permanently stores application data |

### Important rule

Each layer has a responsibility.

For example, a controller should not contain the DR workflow rules, and a route should not directly perform database queries.

---

# 3. Backend Authentication in Simple Language

When a user logs in:

1. Frontend sends email and password.
2. Route receives the request.
3. Controller validates the request.
4. Auth service finds the user.
5. `bcrypt.compare()` checks the password.
6. A JWT is generated.
7. JWT is returned to the frontend.
8. Frontend stores the token.
9. Future protected requests send the token.
10. `authMiddleware` verifies the token before allowing access.

The password itself is not stored as plain text. A bcrypt hash is stored instead.

---

# 4. Authentication vs Authorization

### Authentication

Authentication answers:

> "Who are you?"

This project implements authentication using:
- bcryptjs
- JWT
- `authMiddleware.js`

### Authorization

Authorization answers:

> "What are you allowed to do?"

The current project **does not implement role-based authorization**.

There is no role such as:

```text
ADMIN
DISPATCHER
AUDITOR
```

Therefore, every authenticated user currently has the same access to the protected DR operations.

---

# 5. DR Business Workflow in Simple Language

A DR starts as:

```text
Planned
```

Possible workflow:

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

Once the DR is completed through the submitted state, it becomes locked according to the implemented rules.

The backend checks these rules before saving changes.

---

# 6. Why the Backend Enforces the Rules

The frontend disables buttons to make the UI easy to use.

But a user could potentially bypass the frontend and directly call the API.

Therefore, the backend also checks:

- Action can only be selected once.
- Action must be `Opt IN` or `Opt OUT`.
- Optimized requires `Opt IN`.
- Optimized can only be selected once.
- Submitted requires `Opt IN`.
- Submitted requires optimized to be completed in the frontend workflow.
- Submitted can only be selected once.
- Completed/submitted records cannot be changed.
- Invalid values are rejected.

This is why `drService.js` is one of the most important backend files.

---

# 7. Backend Database in Simple Language

MongoDB stores two main types of data:

### Users

Stores:

```text
name
email
password hash
createdAt
updatedAt
```

### DR events

Stores:

```text
drId
eventType
date
startTime
endTime
status
flexCalledMw
flexAvailableMw
actions
optimized
submitted
datacenters
createdAt
updatedAt
```

Each DR can also contain multiple datacenters.

---

# 8. Backend Summary

In simple terms:

**Routes receive URLs.**

**Middleware checks authentication.**

**Controllers handle HTTP details.**

**Services contain business logic.**

**Models define database data.**

**MongoDB stores the actual data.**

**JWT identifies authenticated users.**

**bcrypt protects stored passwords.**

**The DR service enforces the DR workflow.**

---



This document contains the backend-specific portions of the original project analysis, separated from frontend implementation details.

## 1. Project Overview

  ### Main Features
  • User Authentication: Registration, login, password hashing with salt rounds, and JWT-driven sessions.
  • Session Persistence: Automatic token discovery in localStorage with a /api/auth/me verification handshake on
  application mount.
  • Route Protection: Client-side auth gating guarding operational pages from unauthenticated access.
  • Event Filtering & Search:
      • Sub-second debounced text search (1000ms delay) matching drId.
      • Event status filtering (Planned, In-progress, Completed).
      • Event type filtering (DR, EEA).
      • Bounded date-range filtering (start of fromDate to 23:59:59.999 of toDate).
  • Interactive Data Table:
      • Collapsible/expandable nested rows displaying per-datacenter breakdown (dcId, flexCalledMw, flexAvailableMw).
      • In-place state-machine action triggers (Opt IN, Opt OUT, Optimized YES/NO, Submitted YES/NO).
      • Optimistic locking UI states (updatingDR spinner disabling concurrent clicks).

  ### Technology Stack
   Layer                | Technology         | Version           | Purpose in this Project
  ----------------------|--------------------|-------------------|----------------------------------------------------
   Frontend Framework   | React              | ^19.2.8           | Client-side reactive UI rendering
   DOM Renderer         | React DOM          | ^19.2.8           | Mounts virtual DOM to browser root
   Client Routing       | React Router DOM   | ^7.18.3           | Client-side routing, route guard, redirects
   HTTP Client          | Axios              | ^1.20.0           | Promise-based HTTP client with request interceptor
   Build Tool           | Vite               | ^8.2.2            | Hot module replacement & production bundler
   Runtime Environment  | Node.js            | v18+ / v20+       | Backend JavaScript execution
   Server Framework     | Express            | ^5.2.1            | REST API routing and middleware pipeline
   Database Engine      | MongoDB            | 6.0+              | Document database storing users and DR events
   ODM                  | Mongoose           | ^9.9.4            | Data modeling, validation, and schema definitions
   Security Headers     | Helmet             | ^8.3.0            | Secures HTTP headers on Express
   CORS                 | cors               | ^2.8.6            | Cross-Origin Resource Sharing configuration
   Password Hashing     | bcryptjs           | ^3.0.3            | Password hashing with 12 salt rounds
   Token Authentication | jsonwebtoken       | ^9.0.3            | Signing and verifying JWT bearer tokens
   Dev Process Tool     | nodemon            | ^3.1.14           | Auto-restarts backend server on file changes
  ──────

  ## 2. Complete Folder Structure
    dr-dispatcher/
    ├── Readme.md
    ├── client/
    │   ├── eslint.config.js
    │   ├── index.html
    │   ├── package.json
    │   ├── vite.config.js
    │   ├── public/
    │   │   ├── favicon.svg
    │   │   └── icons.svg
    │   └── src/
    │       ├── App.css
    │       ├── App.jsx
    │       ├── index.css
    │       ├── main.jsx
    │       ├── assets/
    │       │   ├── hero.png
    │       │   ├── react.svg
    │       │   └── vite.svg
    │       ├── components/
    │       │   ├── DRFilters.css
    │       │   ├── DRFilters.jsx
    │       │   ├── DRTable.css
    │       │   ├── DRTable.jsx
    │       │   └── ProtectedRoute.jsx
    │       ├── context/
    │       │   └── AuthContext.jsx
    │       ├── pages/
    │       │   ├── DRDispatcher.css
    │       │   ├── DRDispatcher.jsx
    │       │   ├── Login.css
    │       │   ├── Login.jsx
    │       │   ├── Signup.css
    │       │   └── Signup.jsx
    │       └── services/
    │           ├── api.js
    │           ├── authService.js
    │           └── drService.js
    └── server/
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

  ### Detailed Purpose of Every File & Directory
   Path                                     | Category     | Purpose & Responsibility
  ------------------------------------------|--------------|----------------------------------------------------------
   client/package.json                      | Config       | Defines client dependencies (react 19, react-router-dom
                                            |              | 7, axios, vite 8) and run scripts (dev, build, lint).
   client/vite.config.js                    | Config       | Vite configuration configuring the @vitejs/plugin-react
                                            |              | plugin.
   client/index.html                        | Entry        | Host HTML page containing #root div and bootstrapping
                                            |              | /src/main.jsx.
   client/src/main.jsx                      | Client Entry | Initializes React 19 root with StrictMode, wraps <App />
                                            |              | with <AuthProvider>, and loads index.css.
   client/src/App.jsx                       | Router       | Declares BrowserRouter and maps /login, /signup, and
                                            |              | protected /dr-dispatcher.
   client/src/index.css                     | Styles       | Global CSS reset, font variables, and root layout
                                            |              | structure.
   client/src/App.css                       | Styles       | Vite starter boilerplate stylesheet (unreferenced by
                                            |              | App.jsx).
   client/src/context/AuthContext.jsx       | State        | Central React context managing user, loading,
                                            |              | isAuthenticated, login, signup, and logout. Restores
                                            |              | session on mount.
   client/src/components/ProtectedRoute.jsx | Component    | Higher-order wrapper checking isAuthenticated. Renders
                                            |              | children or redirects to /login.
   client/src/components/DRFilters.jsx      | Component    | Search input with 1000ms debounce, date pickers,
                                            |              | dropdown selects for status/type, and refresh trigger.
   client/src/components/DRFilters.css      | Styles       | Scoped flexbox styling for filter controls.
   client/src/components/DRTable.jsx        | Component    | Renders the primary tabular grid, handles
                                            |              | expand/collapse for data centers, and binds action
                                            |              | buttons.
   client/src/components/DRTable.css        | Styles       | Table formatting, status badges, disabled states, and
                                            |              | nested row tree styles.
   client/src/pages/Login.jsx               | Page         | Controlled form capturing email and password; calls
                                            |              | authService.login.
   client/src/pages/Login.css               | Styles       | Styled card container, input focus states, error
                                            |              | messages, and spinners for Login.
   client/src/pages/Signup.jsx              | Page         | Controlled form capturing name, email, and password;
                                            |              | calls authService.signup.
   client/src/pages/Signup.css              | Styles       | Visual styling matching Login.css with success
                                            |              | notification banner.
   client/src/pages/DRDispatcher.jsx        | Page         | Operational dashboard container holding drs and filters
                                            |              | state, coordinating API calls via drService.
   client/src/pages/DRDispatcher.css        | Styles       | Top-level grid page shell and layout constraining table
                                            |              | view to 1440px max-width.
   client/src/services/api.js               | Networking   | Configured Axios instance with baseURL
                                            |              | (`import.meta.env.VITE_API_URL
   client/src/services/authService.js       | Service      | Client auth calls: signup(), login(), and
                                            |              | getCurrentUser().
   client/src/services/drService.js         | Service      | Client DR calls: getDRs() with query params and
                                            |              | updateDRAction() with payload.
   server/package.json                      | Config       | Backend dependencies (express 5, mongoose 9, bcryptjs,
                                            |              | jsonwebtoken, cors, helmet) and scripts (start, dev).
   server/src/server.js                     | Server Entry | Loads dotenv, connects to MongoDB via connectDB(), and
                                            |              | starts Express listening on PORT (5000/5001).
   server/src/app.js                        | App Setup    | Instantiates Express app, mounts helmet, cors,
                                            |              | express.json(), /api/auth, /api/dr, and /api/health.
   server/src/config/db.js                  | Database     | Establishes MongoDB connection via
                                            |              | mongoose.connect(process.env.MONGO_URL).
   server/src/utils/jwt.js                  | Utility      | Exports generateToken(userId) creating a JWT signed with
                                            |              | process.env.JWT_SECRET expiring in 1d.
   server/src/models/User.js                | Model        | Mongoose schema and model for users: name, email
                                            |              | (unique), password, with timestamps.
   server/src/models/DR.js                  | Model        | Mongoose schema for DR events and embedded
                                            |              | datacenterSchema. Collection explicitly mapped to "drs".
   server/src/middleware/authMiddleware.js  | Middleware   | Extracts Bearer <token>, verifies JWT, finds user via
                                            |              | User.findById(decoded.userId).select("-password"), and
                                            |              | attaches req.user.
   server/src/routes/authRoutes.js          | Router       | Maps /signup to signup, /login to login, and /me (with
                                            |              | authMiddleware) to user profile response.
   server/src/routes/drRoutes.js            | Router       | Applies authMiddleware to GET / (getAllDRs) and PATCH
                                            |              | /:drId/action (updateDRAction).
   server/src/controllers/authController.js | Controller   | Validates input formats via regex, orchestrates
                                            |              | authService.signup and login, and formats HTTP
                                            |              | responses.
   server/src/controllers/drController.js   | Controller   | Extracts query parameters and body payloads, invokes
                                            |              | drService, and sends JSON responses.
   server/src/services/authService.js       | Service      | Hashes password (salt 12), creates user documents,
                                            |              | verifies passwords with bcrypt.compare, and returns JWT.
   server/src/services/drService.js         | Service      | Core business engine: builds Mongo filter queries and
                                            |              | strictly enforces the DR state machine transitions.
   server/src/seed/drData.js                | Seed Data    | Empty placeholder file (0 bytes) in the repository
                                            |              | intended for database seed documents.
  ──────

  ## 3. Architecture & Request Pipeline
  ### The 10-Layer Request Flow
    flowchart TD
        A["1. React UI Event (User click/input in DRTable.jsx)"] --> B["2. Page Component State Handler (DRDispatcher.
  jsx: handleDRUpdate)"]
        B --> C["3. Client Service Layer (drService.js: updateDRAction)"]
        C --> D["4. Axios HTTP Client & Interceptor (api.js: attaches Bearer Token)"]
        D --> E["5. Express HTTP Route Dispatcher (drRoutes.js: PATCH /api/dr/:drId/action)"]
        E --> F["6. Authentication Middleware (authMiddleware.js: verifies JWT, sets req.user)"]
        F --> G["7. Express Controller (drController.js: updateDRAction extracts params/body)"]
        G --> H["8. Backend Domain Service (drService.js: updateDRAction validates state machine)"]
        H --> I["9. Mongoose ODM Layer (DR.js model schema validation & dr.save())"]
        I --> J["10. MongoDB Engine (drs collection document update)"]

  ### Purpose and Justification of Each Layer

  1. React UI Components (DRTable, DRFilters): Own presentation, local component state (expand row, loading spinners),
  and capture DOM events.
  2. Page Containers (DRDispatcher, Login, Signup): Own state synchronization across child components, manage top-
  level page errors, and invoke client services.
  3. Frontend Services (drService, authService): Decouple React components from networking details. If an API path or
  query structure changes, components remain untouched.
  4. Axios Client & Interceptor (api.js): Single choke point for HTTP communication. Injects the Authorization: Bearer
  <token> header automatically without requiring manual token handling in every API call.
  5. Express Routes (authRoutes, drRoutes): Declare RESTful endpoint paths and map HTTP verbs (GET, POST, PATCH) to
  their respective middleware and controller pipelines.
  6. Express Middleware (authMiddleware): Gatekeeping layer. Validates security tokens and hydrates request context
  (req.user) before controllers execute. Rejects unauthenticated requests early.
  7. Express Controllers (drController, authController): HTTP-specific orchestrators. Parse request headers, route
  params, query strings, and body payloads; validate HTTP inputs; call domain services; and format HTTP status codes
  (200, 201, 400, 401, 409).
  8. Backend Domain Services (drService, authService): Encapsulate pure business logic, database queries, password
  hashing, and business validation rules (e.g., state machine transitions). Does not touch req or res.
  9. Mongoose Models (User, DR): Define schemas, field constraints, defaults, types, and schema-level validation rules
  for MongoDB.
  10. MongoDB Storage (users, drs collections): Persists document data on disk.
  ──────

  ## 4. File-by-File Analysis
## Backend Files

  #### 1. server/src/server.js
  • Purpose: Bootstraps the Node application, loads environment variables, establishes the database connection, and
  starts the HTTP server.
  • Imports: dotenv (invoked immediately), app.js, db.js.
  • Functions:
      • startServer():
          • Who calls it: Invoked directly at the bottom of the file on line 21.
          • Arguments: None.
          • What it does: Awaits connectDB(), then executes app.listen(PORT) to begin accepting connections.
          • Calls: connectDB(), app.listen().
          • Returns: Promise<void>.
          • On Success: Prints "Server running on http://localhost:${PORT}" to stdout.
          • On Failure: Catches error, prints "Failed to start server: " + error.message to stderr, and invokes
          process.exit(1).

  • Important Variables: PORT (defaults to process.env.PORT || 5000).
  #### 2. server/src/app.js
  • Purpose: Express application factory configuring top-level middleware, security headers, CORS permissions, route
  mounting, and health checks.
  • Imports: express, cors, helmet, authRoutes.js, drRoutes.js.
  • Middleware Registered:
      • helmet(): Security header injection.
      • cors({ origin: "http://localhost:5174", credentials: true }): Restricts browser cross-origin requests.
      • express.json(): Parses incoming JSON payloads into req.body.
  • Routes Mounted:
      • /api/auth -> authRoutes
      • /api/dr -> drRoutes
      • GET /api/health -> Inline handler returning { success: true, message: "DR Dispatcher API is running" }.
  • Exports: The configured app instance.

  #### 3. server/src/config/db.js
  • Purpose: Connects Mongoose to the MongoDB cluster.
  • Imports: mongoose.
  • Functions:
      • connectDB():
          • Who calls it: startServer() in server.js:10.
          • Arguments: None.
          • What it does: Executes mongoose.connect(process.env.MONGO_URL).
          • Calls: mongoose.connect().
          • Returns: Promise<void>.
          • On Success: Logs "MongoDB connected successfully".
          • On Failure: Logs "MongoDB connection failed: " + error.message and re-throws the error to crash the
          startup routine.



  #### 4. server/src/utils/jwt.js
  • Purpose: Token factory utility.
  • Imports: jsonwebtoken.
  • Functions:
      • generateToken(userId):
          • Who calls it: authService.login in authService.js:68.
          • Arguments: userId (Mongoose ObjectId / String).
          • What it does: Calls jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" }).
          • Returns: Signed JWT string valid for 24 hours.
  #### 5. server/src/models/User.js
  • Purpose: Mongoose schema and model definition for the users collection.
  • Fields:
      • name: String, required: true, trim: true, minlength: 2, maxlength: 50.
      • email: String, required: true, unique: true, lowercase: true, trim: true.
      • password: String, required: true, minlength: 8 (holds bcrypt hash).
      • timestamps: Automatically adds createdAt and updatedAt.
  • Exports: mongoose.model("User", userSchema).

  #### 6. server/src/models/DR.js
  • Purpose: Mongoose schema and model definition for Demand Response events and sub-documents.
  • Schemas:
      • datacenterSchema: Subdocument with { _id: false }. Fields: dcId (String, required), flexCalledMw (Number,
      required, min: 0), flexAvailableMw (Number, required, min: 0).
      • drSchema: Root schema.
          • drId: String, required: true, unique: true, trim: true.
          • eventType: String, required: true, enum: ["DR", "EEA"].
          • date: Date, required: true.
          • startTime: String, required: true (e.g. "14:00").
          • endTime: String, required: true (e.g. "18:00").
          • status: String, required: true, enum: ["Planned", "In-progress", "Completed"].
          • flexCalledMw: Number, required: true, min: 0.
          • flexAvailableMw: Number, required: true, min: 0.
          • actions: [String], default: [] (holds ["Opt IN"] or ["Opt OUT"]).
          • optimized: [String], default: [] (holds ["YES"] or ["NO"]).
          • submitted: [String], default: [] (holds ["YES"] or ["NO"]).
          • datacenters: [datacenterSchema], default: [].
          • timestamps: true.
  • Exports: mongoose.model("DR", drSchema, "drs") (explicit collection name "drs").

  #### 7. server/src/middleware/authMiddleware.js

  • Purpose: Authenticates incoming HTTP requests by verifying JWT bearer tokens and attaching the user document to
  req.user.
  • Imports: jsonwebtoken, User.js.
  • Functions:
      • authMiddleware(req, res, next):
          • Who calls it: Express router pipeline on /api/auth/me, /api/dr/, and /api/dr/:drId/action.
          • Arguments: req (Express Request), res (Express Response), next (Express NextFunction).
          • What it does:
              1. Inspects req.headers.authorization.
              2. If missing or doesn't start with "Bearer ", responds 401 { success: false, message: "Authentication
              required" }.
              3. Splits header to extract raw token string.
              4. Verifies token via jwt.verify(token, process.env.JWT_SECRET).
              5. Executes User.findById(decoded.userId).select("-password").
              6. If user record does not exist in DB, responds 401 { success: false, message: "User no longer exists"
              }.
              7. Sets req.user = user.
              8. Calls next().
          • On Failure (JWT Expired/Tampered): Catches error and returns 401 { success: false, message: "Invalid or
          expired token" }.

  #### 8. server/src/routes/authRoutes.js
  • Purpose: Route definitions for /api/auth.
  • Imports: express.Router, authController.js, authMiddleware.js.
  • Routes:
      • POST /signup -> authController.signup
      • POST /login -> authController.login
      • GET /me -> authMiddleware, inline handler returning 200 { success: true, user: req.user }.
  #### 9. server/src/controllers/authController.js

  • Purpose: Input validation and HTTP response formatting for user registration and authentication.
  • Imports: authService.js.
  • Functions:
      • signup(req, res, next):
          • Validations:
              • Checks existence of name, email, password. If missing -> 400 { success: false, message: "Name, email
              and password are required" }.
              • Regex /^[a-zA-Z\s]{2,50}$/ on name.trim(). If invalid -> 400 { success: false, message: "Name must be
              between 2 and 50 characters and contain only letters and spaces" }.
              • Regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/ on email.trim(). If invalid -> 400 { success: false, message:
              "Invalid email format" }.
              • Regex /^.{8,}$/ on password. If invalid -> 400 { success: false, message: "Password must be at least 8
              characters long" }.
          • Service Call: Awaits authService.signup({ name, email, password }).
          • Response: 201 { success: true, message: "Account created successfully", user }.
          • On Failure: Calls next(error).
      • login(req, res, next):
          • Validations: Checks existence of email and password. If missing -> 400 { success: false, message: "Email
          and password are required" }.
          • Service Call: Awaits authService.login({ email, password }).
          • Response: 200 { success: true, message: "Login successful", ...loginResult } (unpacks token and user).
          • On Failure: Calls next(error).



  #### 10. server/src/services/authService.js
  • Purpose: Core authentication database operations, bcrypt hashing, and credential validation.
  • Imports: bcryptjs, User.js, jwt.js.
  • Functions:
      • signup({ name, email, password }):
          • Normalizes email: email.toLowerCase().trim().
          • Checks duplicate: User.findOne({ email: normalizedEmail }).
          • If found: Throws Error("User already exists") with error.statusCode = 409.
          • Hashes password: await bcrypt.hash(password, 12).
          • Persists: await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword }).
          • Returns: { id: user._id, name: user.name, email: user.email }. (Note: Signup does not return a token).
      • login({ email, password }):
          • Normalizes email: email.toLowerCase().trim().
          • Queries user: await User.findOne({ email: normalizedEmail }).
          • If user not found: Throws Error("Invalid email or password") with error.statusCode = 401.
          • Compares password: await bcrypt.compare(password, user.password).
          • If mismatch: Throws Error("Invalid email or password") with error.statusCode = 401.
          • Generates token: const token = generateToken(user._id).
          • Returns: { token, user: { id: user._id, name: user.name, email: user.email } }.

  #### 11. server/src/routes/drRoutes.js

  • Purpose: Route definitions for /api/dr.
  • Imports: express.Router, drController.js, authMiddleware.js.
  • Routes:
      • GET / -> authMiddleware, drController.getAllDRs
      • PATCH /:drId/action -> authMiddleware, drController.updateDRAction
  #### 12. server/src/controllers/drController.js

  • Purpose: Handles HTTP translation for fetching and updating Demand Response events.
  • Imports: drService.js.
  • Functions:
      • getAllDRs(req, res, next):
          • Extracts req.query: search, status, eventType, fromDate, toDate.
          • Calls: await drService.getAllDRs(search, status, eventType, fromDate, toDate).
          • Responds: 200 { success: true, data: drs }.
          • On Error: Calls next(error).
      • updateDRAction(req, res, next):
          • Extracts req.params.drId and req.body (action, optimized, submitted).
          • Calls: await drService.updateDRAction(drId, action, optimized, submitted).
          • Responds: 200 { success: true, message: "DR action updated successfully", data: dr }.
          • On Error: Explicitly catches and returns 400 { success: false, message: error.message }.

  #### 13. server/src/services/drService.js
  • Purpose: Business rule validation for DR queries and state machine workflow transitions.
  • Imports: DR.js.
  • Functions:
      • getAllDRs(search, status, eventType, fromDate, toDate):
          • Builds dynamic Mongoose query object:
              • if (search): query.drId = { $regex: search, $options: "i" }
              • if (status): query.status = status
              • if (eventType): query.eventType = eventType
              • if (fromDate || toDate): query.date = {}
                  • if (fromDate): query.date.$gte = new Date(fromDate)
                  • if (toDate): creates endDate = new Date(toDate), sets hours endDate.setHours(23, 59, 59, 999),
                  sets query.date.$lte = endDate.

          • Queries DB: await DR.find(query).sort({ date: -1 }).
          • Returns: Array of DR documents.
      • updateDRAction(drId, action, optimized, submitted):
          • Finds target: await DR.findOne({ drId }). Throws "DR not found" if missing.
          • Final State Guard: If dr.submitted && dr.submitted.length > 0, throws "Submitted is already completed. DR
          cannot be changed.".
          • Action Logic (action !== undefined):
              • If dr.actions && dr.actions.length > 0, throws "Action is already completed and cannot be changed.".
              • If action !== "Opt IN" && action !== "Opt OUT", throws "Invalid action".
              • If action === "Opt OUT": sets dr.actions = ["Opt OUT"], dr.optimized = ["NO"], dr.submitted = ["NO"],
              dr.status = "Completed".
              • If action === "Opt IN": sets dr.actions = ["Opt IN"], dr.status = "In-progress".
          • Optimized Logic (optimized !== undefined):
              • If !dr.actions || dr.actions[0] !== "Opt IN", throws "Action must be Opt IN before updating Optimized.
              ".
              • If dr.optimized && dr.optimized.length > 0, throws "Optimized is already completed and cannot be
              changed.".
              • If optimized !== "YES" && optimized !== "NO", throws "Optimized must be YES or NO".
              • Sets dr.optimized = [optimized], dr.status = "In-progress".
          • Submitted Logic (submitted !== undefined):
              • If !dr.actions || dr.actions[0] !== "Opt IN", throws "Action must be Opt IN before updating Submitted.
              ".
              • If dr.submitted && dr.submitted.length > 0, throws "Submitted is already completed and cannot be
              changed.".
              • If submitted !== "YES" && submitted !== "NO", throws "Submitted must be YES or NO".
              • Sets dr.submitted = [submitted], dr.status = "Completed".
          • Empty Payload Guard: If action, optimized, and submitted are all undefined, throws "No update data
          provided".
          • Persists: await dr.save().
          • Returns: Updated dr document.


  ──────
  ## 6. Backend Dive

  ### Layer Architecture: Route vs Middleware vs Controller vs Service vs Model

    classDiagram
        class Route {
            <<HTTP Layer>>
            drRoutes.js
            +GET /
            +PATCH /:drId/action
        }
        class Middleware {
            <<Guard Layer>>
            authMiddleware.js
            +verifyToken()
            +attachReqUser()
        }
        class Controller {
            <<Transport Layer>>
            drController.js
            +getAllDRs(req, res, next)
            +updateDRAction(req, res, next)
        }
        class Service {
            <<Domain Logic>>
            drService.js
            +getAllDRs(filters)
            +updateDRAction(drId, payload)
        }
        class Model {
            <<Data Layer>>
            DR.js
            +drSchema
            +datacenterSchema
        }

        Route --> Middleware : triggers before
        Middleware --> Controller : calls next()
        Controller --> Service : delegates domain logic
        Service --> Model : performs queries & mutations

   Layer      | File Example      | What it Knows About                     | What it MUST NOT Do
  ------------|-------------------|-----------------------------------------|-----------------------------------------
   Route      | drRoutes.js       | Endpoint URIs, HTTP methods, route-     | Must not perform request validation or
              |                   | level middleware ordering.              | database queries.
   Middleware | authMiddleware.js | HTTP Headers (Authorization), token     | Must not format final domain response
              |                   | parsing, early 401 rejections.          | data or execute business workflow
              |                   |                                         | logic.
   Controller | drController.js   | Express req and res, query strings,     | Must not contain database queries
              |                   | status codes (200, 400).                | (DR.find) or state machine business
              |                   |                                         | logic.
   Service    | drService.js      | Business rules, state transition        | Must not reference req, res, next, or
              |                   | invariants, MongoDB queries via         | HTTP headers.
              |                   | Mongoose.                               |
   Model      | DR.js, User.js    | Document structure, data types,         | Must not handle HTTP requests or manage
              |                   | database collection names, Mongoose     | application workflow sequences.
              |                   | schema constraints.                     |
  ──────

  ## 7. API Endpoints Reference

   Method | Endpoint | Purpose  | Auth Re… | Request… | Controller Function | Service… | Database… | Response Payload
  --------|----------|----------|----------|----------|---------------------|----------|-----------|------------------
   GET    | /api/hea | Service  | No       | None     | Inline in app.js:27 | None     | None      | 200 { success:
          | lth      | health   |          |          |                     |          |           | true, message:
          |          | status   |          |          |                     |          |           | "DR Dispatcher
          |          |          |          |          |                     |          |           | API is running"
          |          |          |          |          |                     |          |           | }
   POST   | /api/aut | Register | No       | Body: {  | authController.sign | authServ | User.find | 201 { success:
          | h/signup | new user |          | name,    | up                  | ice.sign | One,      | true, message:
          |          | account  |          | email,   |                     | up       | User.crea | "Account created
          |          |          |          | password |                     |          | te        | successfully",
          |          |          |          | }        |                     |          |           | user: { id,
          |          |          |          |          |                     |          |           | name, email } }
   POST   | /api/aut | Authenti | No       | Body: {  | authController.logi | authServ | User.find | 200 { success:
          | h/login  | cate     |          | email,   | n                   | ice.logi | One       | true, message:
          |          | user &   |          | password |                     | n        |           | "Login
          |          | issue    |          | }        |                     |          |           | successful",
          |          | JWT      |          |          |                     |          |           | token, user: {
          |          |          |          |          |                     |          |           | id, name, email
          |          |          |          |          |                     |          |           | } }
   GET    | /api/aut | Fetch    | Yes      | Headers: | Inline in           | None     | User.find | 200 { success:
          | h/me     | authenti | (Bearer  | Authoriz | authRoutes.js:14    |          | ById (via | true, user: {
          |          | cated    | <token>) | ation:   |                     |          | authMiddl | _id, name,
          |          | user     |          | Bearer   |                     |          | eware)    | email,
          |          | session  |          | <token>  |                     |          |           | createdAt,
          |          |          |          |          |                     |          |           | updatedAt } }
   GET    | /api/dr  | Fetch    | Yes      | Query    | drController.getAll | drServic | DR.find(q | 200 { success:
          |          | list of  | (Bearer  | params:  | DRs                 | e.getAll | uery).sor | true, data: [
          |          | DR       | <token>) | search,  |                     | DRs      | t({ date: | ...drs ] }
          |          | events   |          | status,  |                     |          | -1 })     |
          |          | with     |          | eventTyp |                     |          |           |
          |          | filters  |          | e,       |                     |          |           |
          |          |          |          | fromDate |                     |          |           |
          |          |          |          | , toDate |                     |          |           |
   PATCH  | /api/dr/ | Advance  | Yes      | URL      | drController.update | drServic | DR.findOn | 200 { success:
          | :drId/ac | DR event | (Bearer  | param:   | DRAction            | e.update | e({ drId  | true, message:
          | tion     | workflow | <token>) | drIdBody |                     | DRAction | }),       | "DR action
          |          | state    |          | : {      |                     |          | dr.save() | updated
          |          |          |          | action?, |                     |          |           | successfully",
          |          |          |          | optimize |                     |          |           | data: dr }
          |          |          |          | d?,      |                     |          |           |
          |          |          |          | submitte |                     |          |           |
          |          |          |          | d? }     |                     |          |           |
  ──────
  ## 8. Authentication & Authorization Lifecycle

    sequenceDiagram
        autonumber
        actor User
        participant Browser as React App (Login.jsx)
        participant AuthContext as AuthContext.jsx
        participant Axios as Axios (api.js)
        participant Server as Express (authRoutes.js)
        participant Controller as authController.js
        participant Service as authService.js
        participant DB as MongoDB (users)

        Note over User, DB: LOGIN FLOW
        User->>Browser: Enters email & password, clicks "Sign in"
        Browser->>AuthContext: login({ email, password })
        AuthContext->>Axios: api.post("/auth/login", credentials)
        Axios->>Server: POST /api/auth/login
        Server->>Controller: login(req, res, next)
        Controller->>Service: login({ email, password })
        Service->>DB: User.findOne({ email: normalizedEmail })
        DB-->>Service: User document with password hash
        Service->>Service: bcrypt.compare(password, user.password)
        Service->>Service: jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' })
        Service-->>Controller: { token, user: { id, name, email } }
        Controller-->>Server: HTTP 200 JSON
        Server-->>Axios: HTTP 200 Response
        Axios-->>AuthContext: Returns data
        AuthContext->>Browser: localStorage.setItem("token", data.token)
        AuthContext->>AuthContext: setUser(data.user)
        AuthContext-->>Browser: navigate("/dr-dispatcher")

        Note over User, DB: AUTHENTICATED REQUEST (GET /api/dr)
        Browser->>Axios: api.get("/dr")
        Axios->>Axios: Interceptor reads localStorage.getItem("token")
        Axios->>Server: GET /api/dr (Header: Authorization: Bearer <token>)
        Server->>Server: authMiddleware: jwt.verify(token, JWT_SECRET)
        Server->>DB: User.findById(decoded.userId).select("-password")
        DB-->>Server: User record found
        Server->>Server: req.user = user, next()
        Server->>Controller: getAllDRs(req, res, next)
        Controller-->>Browser: HTTP 200 with DR records

  ### Authentication vs Authorization in this Codebase

  • Authentication (Implemented):
      • Verifies who you are.
      • Handled via bcryptjs password comparison and jsonwebtoken issuance.
      • Validated on protected endpoints by authMiddleware.js.
  • Authorization (Not Implemented):
      • Dictates what you are allowed to do (e.g. Roles: ADMIN, DISPATCHER, AUDITOR).
      • In this codebase, there are no role fields on User.js and no permission checks on any route. Every
      authenticated user has identical, unrestricted privileges to read all DRs and mutate any DR state.

  ──────
  ## 9. Demand Response (DR) Workflow Engine

  ### State Machine Definition

    stateDiagram-v2
        [*] --> Planned

        Planned --> In_progress : Action = "Opt IN"
        Planned --> Completed : Action = "Opt OUT"\n(optimized = ["NO"], submitted = ["NO"])

        In_progress --> In_progress : Optimized = "YES" or "NO"
        In_progress --> Completed : Submitted = "YES" or "NO"

        Completed --> [*] : Permanent Final State (Locked)

  ### Trace of a Concrete Example: User Clicks "Opt IN" on DR0022

  Here is the exact step-by-step chain of execution when an operator clicks the Opt IN button on row DR0022:

    1. [User Interaction]
       Operator clicks the <button> "Opt IN" on the DR0022 row in DRTable.jsx.

    2. [DRTable.jsx: Line 149-156]
       The onClick handler invokes:
       handleAction("DR0022", "Opt IN", undefined, undefined)

    3. [DRTable.jsx: Line 20-38]
       handleAction sets local React state: setUpdatingDR("DR0022").
       This immediately sets the row CSS to .dr-row-updating and disables all action buttons on this row.
       It then awaits the prop function:
       await onDRUpdate("DR0022", "Opt IN", undefined, undefined)

    4. [DRDispatcher.jsx: Line 62-80]
       The parent handleDRUpdate function executes:
       const response = await drService.updateDRAction("DR0022", "Opt IN", undefined, undefined)

    5. [client/src/services/drService.js: Line 25-38]
       updateDRAction invokes Axios:
       api.patch("/dr/DR0022/action", { action: "Opt IN", optimized: undefined, submitted: undefined })

    6. [client/src/services/api.js: Line 10-23]
       Axios request interceptor triggers before transmission.
       It reads localStorage.getItem("token") and sets:
       config.headers.Authorization = "Bearer eyJhbGciOi..."
       The HTTP request is dispatched across the network to http://localhost:5001/api/dr/DR0022/action.

    7. [server/src/app.js & server/src/routes/drRoutes.js: Line 11]
       Express routes the request matching PATCH /api/dr/:drId/action.
       It passes control to authMiddleware.

    8. [server/src/middleware/authMiddleware.js: Line 5-46]
       authMiddleware reads req.headers.authorization, verifies the token with jwt.verify(), queries
       User.findById(decoded.userId).select("-password"), assigns req.user = user, and invokes next().

    9. [server/src/controllers/drController.js: Line 4-28]
       drController.updateDRAction extracts:
       const drId = req.params.drId; // "DR0022"
       const { action, optimized, submitted } = req.body; // action = "Opt IN"
       It calls: await drService.updateDRAction("DR0022", "Opt IN", undefined, undefined)

    10. [server/src/services/drService.js: Line 4-131]
        drService executes domain validation:
        a. Queries database: const dr = await DR.findOne({ drId: "DR0022" }).
        b. Final State Guard: Checks if dr.submitted.length > 0. False (currently empty).
        c. Action Guard: Checks if dr.actions.length > 0. False (currently empty).
        d. Checks if action === "Opt IN" or "Opt OUT". Valid ("Opt IN").
        e. Applies mutations:
           dr.actions = ["Opt IN"];
           dr.status = "In-progress";
        f. Optimized & Submitted blocks are skipped because they are undefined.
        g. Saves to database: await dr.save().
        h. Returns the updated Mongoose document.

    11. [server/src/controllers/drController.js: Line 17-21]
        Sends HTTP response:
        res.status(200).json({
          success: true,
          message: "DR action updated successfully",
          data: dr
        });

    12. [client/src/pages/DRDispatcher.jsx: Line 75-79]
        drService returns response.data to handleDRUpdate.
        DRDispatcher executes state updater:
        setDrs(currentDRs => currentDRs.map(dr => dr.drId === "DR0022" ? response.data : dr));

    13. [client/src/components/DRTable.jsx: Line 35-37]
        The await onDRUpdate promise resolves.
        The finally block runs: setUpdatingDR(null).

    14. [React Re-render & DOM Reconciliation]
        React re-renders DRDispatcher and DRTable with updated drs state:
        - DR0022 status badge renders "In-progress" (.dr-badge-in-progress).
        - "Opt IN" button gets class .dr-btn-selected and is disabled.
        - "Opt OUT" button is disabled (actionCompleted is true).
        - "Optimized YES" and "Optimized NO" buttons become ENABLED (!isOptIn is false, optimizedCompleted is false).
        - "Submitted YES" and "Submitted NO" buttons remain DISABLED (!optimizedCompleted is true).

  ### Where Every Business Rule is Enforced

   Business Rule                        | Frontend Enforcement (DRTable.jsx)   | Backend Enforcement (drService.js)
  --------------------------------------|--------------------------------------|--------------------------------------
   Cannot change anything once          | Buttons disabled: submittedCompleted | Throws "Submitted is already
   Submitted                            | check (L248)                         | completed. DR cannot be changed."
                                        |                                      | (L17-19)
   Action can only be selected once     | Buttons disabled: actionCompleted    | Throws "Action is already completed
                                        | check (L147, L167)                   | and cannot be changed." (L27-29)
   Action must be "Opt IN" or "Opt OUT" | Only buttons for Opt IN / Opt OUT    | Throws "Invalid action" (L32-34)
                                        | exist                                |
   Opt OUT automatically completes DR   | UI updates on state arrival          | Sets dr.optimized = ["NO"],
                                        |                                      | dr.submitted = ["NO"], dr.status =
                                        |                                      | "Completed" (L41-45)
   Must Opt IN before Optimized         | Buttons disabled: !isOptIn check     | Throws "Action must be Opt IN before
                                        | (L193, L217)                         | updating Optimized." (L65-67)
   Optimized can only be selected once  | Buttons disabled: optimizedCompleted | Throws "Optimized is already
                                        | check (L194, L218)                   | completed and cannot be changed."
                                        |                                      | (L70-74)
   Optimized must be YES or NO          | Only buttons for YES / NO exist      | Throws "Optimized must be YES or NO"
                                        |                                      | (L77-79)
   Must Opt IN & Complete Optimized     | Buttons disabled: !isOptIn ||        | Throws "Action must be Opt IN before
   before Submitted                     | !optimizedCompleted (L246-247)       | updating Submitted." (L93-95)
   Submitted can only be selected once  | Buttons disabled: submittedCompleted | Throws "Submitted is already
                                        | check (L248)                         | completed and cannot be changed."
                                        |                                      | (L98-102)
   Submitted completes DR               | UI reflects dr.status ===            | Sets dr.status = "Completed" (L112)
                                        | "Completed" badge                    |
  ──────

  ## 10. Database Schema Analysis

  ### 1. User Schema (User.js)

   Field     | BSON T… | Req… | Un… | Constraints & Defaults       | Purpose & Usage in Code
  -----------|---------|------|-----|------------------------------|--------------------------------------------------
   name      | String  | Yes  | No  | trim: true, minlength: 2,    | User's full name. Validated via regex in
             |         |      |     | maxlength: 50                | authController.signup. Displayed in client
             |         |      |     |                              | session.
   email     | String  | Yes  | Yes | unique: true, lowercase:     | Primary login identifier. Normalized and queried
             |         |      |     | true, trim: true             | in authService.login and signup.
   password  | String  | Yes  | No  | minlength: 8                 | Stores bcrypt salt-hashed password string. Never
             |         |      |     |                              | returned in /me (select("-password")).
   createdAt | Date    | Auto | No  | Managed by timestamps: true  | Audit timestamp of registration.
   updatedAt | Date    | Auto | No  | Managed by timestamps: true  | Audit timestamp of last user record
             |         |      |     |                              | modification.

  ### 2. Embedded datacenterSchema (DR.js:3-23)

   Field           | BSON Type | Required | Constraints | Purpose & Usage in Code
  -----------------|-----------|----------|-------------|-------------------------------------------------------------
   dcId            | String    | Yes      | None        | Unique facility identifier (e.g. "DC-EAST-01"). Rendered in
                   |           |          |             | expanded child table row.
   flexCalledMw    | Number    | Yes      | min: 0      | Curtailment power demand requested for this specific
                   |           |          |             | facility in Megawatts.
   flexAvailableMw | Number    | Yes      | min: 0      | Actual available power curtailment headroom at this
                   |           |          |             | facility in Megawatts.

  │ Important
  │ datacenterSchema is configured with { _id: false }. Mongoose does not create synthetic ObjectId fields for
  embedded
  │ data center subdocuments, keeping documents compact and avoiding unnecessary index overhead.

  ### 3. Root DR Schema (DR.js:25-96)

   Field                 | BSON Type          | Required | Enum / Defaults         | Purpose & Usage in Code
  -----------------------|--------------------|----------|-------------------------|----------------------------------
   drId                  | String             | Yes      | unique: true, trim:     | Human-readable event ID (e.g.,
                         |                    |          | true                    | "DR-9021"). Used as lookup key
                         |                    |          |                         | in updateDRAction and search
                         |                    |          |                         | regex.
   eventType             | String             | Yes      | enum: ["DR", "EEA"]     | Event classification: Demand
                         |                    |          |                         | Response standard curtailment vs
                         |                    |          |                         | Energy Emergency Alert.
                         |                    |          |                         | Filterable via UI.
   date                  | Date               | Yes      | None                    | Date of the grid event.
                         |                    |          |                         | Formatted via
                         |                    |          |                         | toLocaleDateString(). Sorted
                         |                    |          |                         | descending in getAllDRs.
   startTime             | String             | Yes      | None                    | Start time of event window (e.g.
                         |                    |          |                         | "14:00"). Displayed in table
                         |                    |          |                         | column.
   endTime               | String             | Yes      | None                    | End time of event window (e.g.
                         |                    |          |                         | "18:00"). Displayed in table
                         |                    |          |                         | column.
   status                | String             | Yes      | enum: ["Planned", "In-  | Current workflow state of the
                         |                    |          | progress", "Completed"] | event. Controls row badge
                         |                    |          |                         | coloring.
   flexCalledMw          | Number             | Yes      | min: 0                  | Total requested curtailment
                         |                    |          |                         | across all participating data
                         |                    |          |                         | centers.
   flexAvailableMw       | Number             | Yes      | min: 0                  | Total available curtailment
                         |                    |          |                         | across all participating data
                         |                    |          |                         | centers.
   actions               | [String]           | No       | default: []             | Stores array holding ["Opt IN"]
                         |                    |          |                         | or ["Opt OUT"].
   optimized             | [String]           | No       | default: []             | Stores array holding ["YES"] or
                         |                    |          |                         | ["NO"].
   submitted             | [String]           | No       | default: []             | Stores array holding ["YES"] or
                         |                    |          |                         | ["NO"].
   datacenters           | [datacenterSchema] | No       | default: []             | Embedded array of data center
                         |                    |          |                         | sub-documents.
   createdAt / updatedAt | Date               | Auto     | Managed by timestamps:  | Audit timestamps.
                         |                    |          | true                    |
  ──────
  ## Backend-Related Error Handling & Known Quirks

  ### Current Error Handling Implementation

    graph TD
        subgraph Client Layer
            A1["Axios Request Error"] --> A2["catch block in Login / Signup / DRDispatcher"]
            A2 --> A3["Reads error.response?.data?.message"]
            A3 --> A4["Sets React state error string, displays UI banner"]
        end
        subgraph Backend Controller Layer
            B1["drController.updateDRAction"] -->|try / catch| B2["Explicit res.status(400).json({ success: false,
  message: error.message })"]
            B3["drController.getAllDRs & authController"] -->|try / catch| B4["next(error)"]
        end
        subgraph Express Default Error Handler
            B4 --> C1["No custom error middleware in app.js!"]
            C1 --> C2["Express default HTML/500 handler returns stack/text to client"]
        end

  ### HTTP Status Codes Used

   Code               | Meaning in this Codebase            | Triggering Conditions
  --------------------|-------------------------------------|---------------------------------------------------------
   200 OK             | Request succeeded                   | Successful login, user retrieval via /me, DR list
                      |                                     | fetch, DR action update.
   201 Created        | Resource created                    | Successful user registration in authController.signup.
   400 Bad Request    | Input validation failure / State    | Missing name/email/password; regex validation failure;
                      | violation                           | invalid DR action/optimized/submitted values; violating
                      |                                     | state machine sequence in updateDRAction.
   401 Unauthorized   | Authentication failure              | Missing/malformed Authorization header; expired or
                      |                                     | invalid JWT token; incorrect password on login; non-
                      |                                     | existent user on /me.
   409 Conflict       | Resource collision                  | Attempting to signup with an email that already exists
                      |                                     | (authService.signup).
   500 Internal Error | Unhandled exception                 | Express default error handler when database connection
                      |                                     | drops or unhandled service errors trigger next(error).

  ### Known Quirks & Architectural Observations (Documented As-Is)

  1. Missing Custom Express Error Middleware:
  In server/src/app.js, there is no app.use((err, req, res, next) => ...) registered.
      • In authController.js and drController.getAllDRs, errors are passed to next(error).
      • In authService.js, errors are given error.statusCode = 409 or 401. Express's default error handler catches
      this, but sends an HTML or raw text response instead of a structured JSON payload ({ success: false, message }).
      • Conversely, drController.updateDRAction handles errors with an explicit try / catch that returns JSON: res.
      status(400).json({ success: false, message: error.message }).
  2. Missing try / catch in handleDRUpdate (DRDispatcher.jsx:62-80):
  If drService.updateDRAction throws an error (e.g., 400 Bad Request), handleDRUpdate does not catch it. The unhandled
  promise rejection bubbles up to DRTable.jsx:handleAction. In DRTable.jsx, it hits the finally block to reset
  updatingDR = null, but no error message is displayed on screen to inform the operator why the action failed.
  3. Environment Variable Naming Mismatch:
      • server/src/config/db.js expects process.env.MONGO_URL.
      • Readme.md instructs developers to set MONGO_URI. If a developer uses MONGO_URI, Mongoose will fail to connect
      with undefined.
  4. CORS Port Configuration:
      • server/src/app.js hardcodes CORS origin to "http://localhost:5174".
      • Standard Vite projects default to port 5173. If client runs on 5173, all browser requests will be blocked by
      CORS unless client is forced onto 5174.
  5. Missing Root Route /:
  client/src/App.jsx defines routes for /login, /signup, and /dr-dispatcher. If a user navigates to
  http://localhost:5173/, nothing matches, resulting in a blank page.
  6. Empty Seed File:
  server/src/seed/drData.js is 0 bytes. Database initialization must currently be performed manually or via external
  scripts.
  ──────


This document contains the backend-specific portions of the original project analysis, separated from frontend implementation details.

## 1. Project Overview

  ### Main Features
  • User Authentication: Registration, login, password hashing with salt rounds, and JWT-driven sessions.
  • Session Persistence: Automatic token discovery in localStorage with a /api/auth/me verification handshake on
  application mount.
  • Route Protection: Client-side auth gating guarding operational pages from unauthenticated access.
  • Event Filtering & Search:
      • Sub-second debounced text search (1000ms delay) matching drId.
      • Event status filtering (Planned, In-progress, Completed).
      • Event type filtering (DR, EEA).
      • Bounded date-range filtering (start of fromDate to 23:59:59.999 of toDate).
  • Interactive Data Table:
      • Collapsible/expandable nested rows displaying per-datacenter breakdown (dcId, flexCalledMw, flexAvailableMw).
      • In-place state-machine action triggers (Opt IN, Opt OUT, Optimized YES/NO, Submitted YES/NO).
      • Optimistic locking UI states (updatingDR spinner disabling concurrent clicks).

  ### Technology Stack
   Layer                | Technology         | Version           | Purpose in this Project
  ----------------------|--------------------|-------------------|----------------------------------------------------
   Frontend Framework   | React              | ^19.2.8           | Client-side reactive UI rendering
   DOM Renderer         | React DOM          | ^19.2.8           | Mounts virtual DOM to browser root
   Client Routing       | React Router DOM   | ^7.18.3           | Client-side routing, route guard, redirects
   HTTP Client          | Axios              | ^1.20.0           | Promise-based HTTP client with request interceptor
   Build Tool           | Vite               | ^8.2.2            | Hot module replacement & production bundler
   Runtime Environment  | Node.js            | v18+ / v20+       | Backend JavaScript execution
   Server Framework     | Express            | ^5.2.1            | REST API routing and middleware pipeline
   Database Engine      | MongoDB            | 6.0+              | Document database storing users and DR events
   ODM                  | Mongoose           | ^9.9.4            | Data modeling, validation, and schema definitions
   Security Headers     | Helmet             | ^8.3.0            | Secures HTTP headers on Express
   CORS                 | cors               | ^2.8.6            | Cross-Origin Resource Sharing configuration
   Password Hashing     | bcryptjs           | ^3.0.3            | Password hashing with 12 salt rounds
   Token Authentication | jsonwebtoken       | ^9.0.3            | Signing and verifying JWT bearer tokens
   Dev Process Tool     | nodemon            | ^3.1.14           | Auto-restarts backend server on file changes
  ──────

  ## 2. Complete Folder Structure
    dr-dispatcher/
    ├── Readme.md
    ├── client/
    │   ├── eslint.config.js
    │   ├── index.html
    │   ├── package.json
    │   ├── vite.config.js
    │   ├── public/
    │   │   ├── favicon.svg
    │   │   └── icons.svg
    │   └── src/
    │       ├── App.css
    │       ├── App.jsx
    │       ├── index.css
    │       ├── main.jsx
    │       ├── assets/
    │       │   ├── hero.png
    │       │   ├── react.svg
    │       │   └── vite.svg
    │       ├── components/
    │       │   ├── DRFilters.css
    │       │   ├── DRFilters.jsx
    │       │   ├── DRTable.css
    │       │   ├── DRTable.jsx
    │       │   └── ProtectedRoute.jsx
    │       ├── context/
    │       │   └── AuthContext.jsx
    │       ├── pages/
    │       │   ├── DRDispatcher.css
    │       │   ├── DRDispatcher.jsx
    │       │   ├── Login.css
    │       │   ├── Login.jsx
    │       │   ├── Signup.css
    │       │   └── Signup.jsx
    │       └── services/
    │           ├── api.js
    │           ├── authService.js
    │           └── drService.js
    └── server/
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

  ### Detailed Purpose of Every File & Directory
   Path                                     | Category     | Purpose & Responsibility
  ------------------------------------------|--------------|----------------------------------------------------------
   client/package.json                      | Config       | Defines client dependencies (react 19, react-router-dom
                                            |              | 7, axios, vite 8) and run scripts (dev, build, lint).
   client/vite.config.js                    | Config       | Vite configuration configuring the @vitejs/plugin-react
                                            |              | plugin.
   client/index.html                        | Entry        | Host HTML page containing #root div and bootstrapping
                                            |              | /src/main.jsx.
   client/src/main.jsx                      | Client Entry | Initializes React 19 root with StrictMode, wraps <App />
                                            |              | with <AuthProvider>, and loads index.css.
   client/src/App.jsx                       | Router       | Declares BrowserRouter and maps /login, /signup, and
                                            |              | protected /dr-dispatcher.
   client/src/index.css                     | Styles       | Global CSS reset, font variables, and root layout
                                            |              | structure.
   client/src/App.css                       | Styles       | Vite starter boilerplate stylesheet (unreferenced by
                                            |              | App.jsx).
   client/src/context/AuthContext.jsx       | State        | Central React context managing user, loading,
                                            |              | isAuthenticated, login, signup, and logout. Restores
                                            |              | session on mount.
   client/src/components/ProtectedRoute.jsx | Component    | Higher-order wrapper checking isAuthenticated. Renders
                                            |              | children or redirects to /login.
   client/src/components/DRFilters.jsx      | Component    | Search input with 1000ms debounce, date pickers,
                                            |              | dropdown selects for status/type, and refresh trigger.
   client/src/components/DRFilters.css      | Styles       | Scoped flexbox styling for filter controls.
   client/src/components/DRTable.jsx        | Component    | Renders the primary tabular grid, handles
                                            |              | expand/collapse for data centers, and binds action
                                            |              | buttons.
   client/src/components/DRTable.css        | Styles       | Table formatting, status badges, disabled states, and
                                            |              | nested row tree styles.
   client/src/pages/Login.jsx               | Page         | Controlled form capturing email and password; calls
                                            |              | authService.login.
   client/src/pages/Login.css               | Styles       | Styled card container, input focus states, error
                                            |              | messages, and spinners for Login.
   client/src/pages/Signup.jsx              | Page         | Controlled form capturing name, email, and password;
                                            |              | calls authService.signup.
   client/src/pages/Signup.css              | Styles       | Visual styling matching Login.css with success
                                            |              | notification banner.
   client/src/pages/DRDispatcher.jsx        | Page         | Operational dashboard container holding drs and filters
                                            |              | state, coordinating API calls via drService.
   client/src/pages/DRDispatcher.css        | Styles       | Top-level grid page shell and layout constraining table
                                            |              | view to 1440px max-width.
   client/src/services/api.js               | Networking   | Configured Axios instance with baseURL
                                            |              | (`import.meta.env.VITE_API_URL
   client/src/services/authService.js       | Service      | Client auth calls: signup(), login(), and
                                            |              | getCurrentUser().
   client/src/services/drService.js         | Service      | Client DR calls: getDRs() with query params and
                                            |              | updateDRAction() with payload.
   server/package.json                      | Config       | Backend dependencies (express 5, mongoose 9, bcryptjs,
                                            |              | jsonwebtoken, cors, helmet) and scripts (start, dev).
   server/src/server.js                     | Server Entry | Loads dotenv, connects to MongoDB via connectDB(), and
                                            |              | starts Express listening on PORT (5000/5001).
   server/src/app.js                        | App Setup    | Instantiates Express app, mounts helmet, cors,
                                            |              | express.json(), /api/auth, /api/dr, and /api/health.
   server/src/config/db.js                  | Database     | Establishes MongoDB connection via
                                            |              | mongoose.connect(process.env.MONGO_URL).
   server/src/utils/jwt.js                  | Utility      | Exports generateToken(userId) creating a JWT signed with
                                            |              | process.env.JWT_SECRET expiring in 1d.
   server/src/models/User.js                | Model        | Mongoose schema and model for users: name, email
                                            |              | (unique), password, with timestamps.
   server/src/models/DR.js                  | Model        | Mongoose schema for DR events and embedded
                                            |              | datacenterSchema. Collection explicitly mapped to "drs".
   server/src/middleware/authMiddleware.js  | Middleware   | Extracts Bearer <token>, verifies JWT, finds user via
                                            |              | User.findById(decoded.userId).select("-password"), and
                                            |              | attaches req.user.
   server/src/routes/authRoutes.js          | Router       | Maps /signup to signup, /login to login, and /me (with
                                            |              | authMiddleware) to user profile response.
   server/src/routes/drRoutes.js            | Router       | Applies authMiddleware to GET / (getAllDRs) and PATCH
                                            |              | /:drId/action (updateDRAction).
   server/src/controllers/authController.js | Controller   | Validates input formats via regex, orchestrates
                                            |              | authService.signup and login, and formats HTTP
                                            |              | responses.
   server/src/controllers/drController.js   | Controller   | Extracts query parameters and body payloads, invokes
                                            |              | drService, and sends JSON responses.
   server/src/services/authService.js       | Service      | Hashes password (salt 12), creates user documents,
                                            |              | verifies passwords with bcrypt.compare, and returns JWT.
   server/src/services/drService.js         | Service      | Core business engine: builds Mongo filter queries and
                                            |              | strictly enforces the DR state machine transitions.
   server/src/seed/drData.js                | Seed Data    | Empty placeholder file (0 bytes) in the repository
                                            |              | intended for database seed documents.
  ──────

  ## 3. Architecture & Request Pipeline
  ### The 10-Layer Request Flow
    flowchart TD
        A["1. React UI Event (User click/input in DRTable.jsx)"] --> B["2. Page Component State Handler (DRDispatcher.
  jsx: handleDRUpdate)"]
        B --> C["3. Client Service Layer (drService.js: updateDRAction)"]
        C --> D["4. Axios HTTP Client & Interceptor (api.js: attaches Bearer Token)"]
        D --> E["5. Express HTTP Route Dispatcher (drRoutes.js: PATCH /api/dr/:drId/action)"]
        E --> F["6. Authentication Middleware (authMiddleware.js: verifies JWT, sets req.user)"]
        F --> G["7. Express Controller (drController.js: updateDRAction extracts params/body)"]
        G --> H["8. Backend Domain Service (drService.js: updateDRAction validates state machine)"]
        H --> I["9. Mongoose ODM Layer (DR.js model schema validation & dr.save())"]
        I --> J["10. MongoDB Engine (drs collection document update)"]

  ### Purpose and Justification of Each Layer

  1. React UI Components (DRTable, DRFilters): Own presentation, local component state (expand row, loading spinners),
  and capture DOM events.
  2. Page Containers (DRDispatcher, Login, Signup): Own state synchronization across child components, manage top-
  level page errors, and invoke client services.
  3. Frontend Services (drService, authService): Decouple React components from networking details. If an API path or
  query structure changes, components remain untouched.
  4. Axios Client & Interceptor (api.js): Single choke point for HTTP communication. Injects the Authorization: Bearer
  <token> header automatically without requiring manual token handling in every API call.
  5. Express Routes (authRoutes, drRoutes): Declare RESTful endpoint paths and map HTTP verbs (GET, POST, PATCH) to
  their respective middleware and controller pipelines.
  6. Express Middleware (authMiddleware): Gatekeeping layer. Validates security tokens and hydrates request context
  (req.user) before controllers execute. Rejects unauthenticated requests early.
  7. Express Controllers (drController, authController): HTTP-specific orchestrators. Parse request headers, route
  params, query strings, and body payloads; validate HTTP inputs; call domain services; and format HTTP status codes
  (200, 201, 400, 401, 409).
  8. Backend Domain Services (drService, authService): Encapsulate pure business logic, database queries, password
  hashing, and business validation rules (e.g., state machine transitions). Does not touch req or res.
  9. Mongoose Models (User, DR): Define schemas, field constraints, defaults, types, and schema-level validation rules
  for MongoDB.
  10. MongoDB Storage (users, drs collections): Persists document data on disk.
  ──────

  ## 4. File-by-File Analysis
## Backend Files

  #### 1. server/src/server.js
  • Purpose: Bootstraps the Node application, loads environment variables, establishes the database connection, and
  starts the HTTP server.
  • Imports: dotenv (invoked immediately), app.js, db.js.
  • Functions:
      • startServer():
          • Who calls it: Invoked directly at the bottom of the file on line 21.
          • Arguments: None.
          • What it does: Awaits connectDB(), then executes app.listen(PORT) to begin accepting connections.
          • Calls: connectDB(), app.listen().
          • Returns: Promise<void>.
          • On Success: Prints "Server running on http://localhost:${PORT}" to stdout.
          • On Failure: Catches error, prints "Failed to start server: " + error.message to stderr, and invokes
          process.exit(1).

  • Important Variables: PORT (defaults to process.env.PORT || 5000).
  #### 2. server/src/app.js
  • Purpose: Express application factory configuring top-level middleware, security headers, CORS permissions, route
  mounting, and health checks.
  • Imports: express, cors, helmet, authRoutes.js, drRoutes.js.
  • Middleware Registered:
      • helmet(): Security header injection.
      • cors({ origin: "http://localhost:5174", credentials: true }): Restricts browser cross-origin requests.
      • express.json(): Parses incoming JSON payloads into req.body.
  • Routes Mounted:
      • /api/auth -> authRoutes
      • /api/dr -> drRoutes
      • GET /api/health -> Inline handler returning { success: true, message: "DR Dispatcher API is running" }.
  • Exports: The configured app instance.

  #### 3. server/src/config/db.js
  • Purpose: Connects Mongoose to the MongoDB cluster.
  • Imports: mongoose.
  • Functions:
      • connectDB():
          • Who calls it: startServer() in server.js:10.
          • Arguments: None.
          • What it does: Executes mongoose.connect(process.env.MONGO_URL).
          • Calls: mongoose.connect().
          • Returns: Promise<void>.
          • On Success: Logs "MongoDB connected successfully".
          • On Failure: Logs "MongoDB connection failed: " + error.message and re-throws the error to crash the
          startup routine.



  #### 4. server/src/utils/jwt.js
  • Purpose: Token factory utility.
  • Imports: jsonwebtoken.
  • Functions:
      • generateToken(userId):
          • Who calls it: authService.login in authService.js:68.
          • Arguments: userId (Mongoose ObjectId / String).
          • What it does: Calls jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" }).
          • Returns: Signed JWT string valid for 24 hours.
  #### 5. server/src/models/User.js
  • Purpose: Mongoose schema and model definition for the users collection.
  • Fields:
      • name: String, required: true, trim: true, minlength: 2, maxlength: 50.
      • email: String, required: true, unique: true, lowercase: true, trim: true.
      • password: String, required: true, minlength: 8 (holds bcrypt hash).
      • timestamps: Automatically adds createdAt and updatedAt.
  • Exports: mongoose.model("User", userSchema).

  #### 6. server/src/models/DR.js
  • Purpose: Mongoose schema and model definition for Demand Response events and sub-documents.
  • Schemas:
      • datacenterSchema: Subdocument with { _id: false }. Fields: dcId (String, required), flexCalledMw (Number,
      required, min: 0), flexAvailableMw (Number, required, min: 0).
      • drSchema: Root schema.
          • drId: String, required: true, unique: true, trim: true.
          • eventType: String, required: true, enum: ["DR", "EEA"].
          • date: Date, required: true.
          • startTime: String, required: true (e.g. "14:00").
          • endTime: String, required: true (e.g. "18:00").
          • status: String, required: true, enum: ["Planned", "In-progress", "Completed"].
          • flexCalledMw: Number, required: true, min: 0.
          • flexAvailableMw: Number, required: true, min: 0.
          • actions: [String], default: [] (holds ["Opt IN"] or ["Opt OUT"]).
          • optimized: [String], default: [] (holds ["YES"] or ["NO"]).
          • submitted: [String], default: [] (holds ["YES"] or ["NO"]).
          • datacenters: [datacenterSchema], default: [].
          • timestamps: true.
  • Exports: mongoose.model("DR", drSchema, "drs") (explicit collection name "drs").

  #### 7. server/src/middleware/authMiddleware.js

  • Purpose: Authenticates incoming HTTP requests by verifying JWT bearer tokens and attaching the user document to
  req.user.
  • Imports: jsonwebtoken, User.js.
  • Functions:
      • authMiddleware(req, res, next):
          • Who calls it: Express router pipeline on /api/auth/me, /api/dr/, and /api/dr/:drId/action.
          • Arguments: req (Express Request), res (Express Response), next (Express NextFunction).
          • What it does:
              1. Inspects req.headers.authorization.
              2. If missing or doesn't start with "Bearer ", responds 401 { success: false, message: "Authentication
              required" }.
              3. Splits header to extract raw token string.
              4. Verifies token via jwt.verify(token, process.env.JWT_SECRET).
              5. Executes User.findById(decoded.userId).select("-password").
              6. If user record does not exist in DB, responds 401 { success: false, message: "User no longer exists"
              }.
              7. Sets req.user = user.
              8. Calls next().
          • On Failure (JWT Expired/Tampered): Catches error and returns 401 { success: false, message: "Invalid or
          expired token" }.

  #### 8. server/src/routes/authRoutes.js
  • Purpose: Route definitions for /api/auth.
  • Imports: express.Router, authController.js, authMiddleware.js.
  • Routes:
      • POST /signup -> authController.signup
      • POST /login -> authController.login
      • GET /me -> authMiddleware, inline handler returning 200 { success: true, user: req.user }.
  #### 9. server/src/controllers/authController.js

  • Purpose: Input validation and HTTP response formatting for user registration and authentication.
  • Imports: authService.js.
  • Functions:
      • signup(req, res, next):
          • Validations:
              • Checks existence of name, email, password. If missing -> 400 { success: false, message: "Name, email
              and password are required" }.
              • Regex /^[a-zA-Z\s]{2,50}$/ on name.trim(). If invalid -> 400 { success: false, message: "Name must be
              between 2 and 50 characters and contain only letters and spaces" }.
              • Regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/ on email.trim(). If invalid -> 400 { success: false, message:
              "Invalid email format" }.
              • Regex /^.{8,}$/ on password. If invalid -> 400 { success: false, message: "Password must be at least 8
              characters long" }.
          • Service Call: Awaits authService.signup({ name, email, password }).
          • Response: 201 { success: true, message: "Account created successfully", user }.
          • On Failure: Calls next(error).
      • login(req, res, next):
          • Validations: Checks existence of email and password. If missing -> 400 { success: false, message: "Email
          and password are required" }.
          • Service Call: Awaits authService.login({ email, password }).
          • Response: 200 { success: true, message: "Login successful", ...loginResult } (unpacks token and user).
          • On Failure: Calls next(error).



  #### 10. server/src/services/authService.js
  • Purpose: Core authentication database operations, bcrypt hashing, and credential validation.
  • Imports: bcryptjs, User.js, jwt.js.
  • Functions:
      • signup({ name, email, password }):
          • Normalizes email: email.toLowerCase().trim().
          • Checks duplicate: User.findOne({ email: normalizedEmail }).
          • If found: Throws Error("User already exists") with error.statusCode = 409.
          • Hashes password: await bcrypt.hash(password, 12).
          • Persists: await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword }).
          • Returns: { id: user._id, name: user.name, email: user.email }. (Note: Signup does not return a token).
      • login({ email, password }):
          • Normalizes email: email.toLowerCase().trim().
          • Queries user: await User.findOne({ email: normalizedEmail }).
          • If user not found: Throws Error("Invalid email or password") with error.statusCode = 401.
          • Compares password: await bcrypt.compare(password, user.password).
          • If mismatch: Throws Error("Invalid email or password") with error.statusCode = 401.
          • Generates token: const token = generateToken(user._id).
          • Returns: { token, user: { id: user._id, name: user.name, email: user.email } }.

  #### 11. server/src/routes/drRoutes.js

  • Purpose: Route definitions for /api/dr.
  • Imports: express.Router, drController.js, authMiddleware.js.
  • Routes:
      • GET / -> authMiddleware, drController.getAllDRs
      • PATCH /:drId/action -> authMiddleware, drController.updateDRAction
  #### 12. server/src/controllers/drController.js

  • Purpose: Handles HTTP translation for fetching and updating Demand Response events.
  • Imports: drService.js.
  • Functions:
      • getAllDRs(req, res, next):
          • Extracts req.query: search, status, eventType, fromDate, toDate.
          • Calls: await drService.getAllDRs(search, status, eventType, fromDate, toDate).
          • Responds: 200 { success: true, data: drs }.
          • On Error: Calls next(error).
      • updateDRAction(req, res, next):
          • Extracts req.params.drId and req.body (action, optimized, submitted).
          • Calls: await drService.updateDRAction(drId, action, optimized, submitted).
          • Responds: 200 { success: true, message: "DR action updated successfully", data: dr }.
          • On Error: Explicitly catches and returns 400 { success: false, message: error.message }.

  #### 13. server/src/services/drService.js
  • Purpose: Business rule validation for DR queries and state machine workflow transitions.
  • Imports: DR.js.
  • Functions:
      • getAllDRs(search, status, eventType, fromDate, toDate):
          • Builds dynamic Mongoose query object:
              • if (search): query.drId = { $regex: search, $options: "i" }
              • if (status): query.status = status
              • if (eventType): query.eventType = eventType
              • if (fromDate || toDate): query.date = {}
                  • if (fromDate): query.date.$gte = new Date(fromDate)
                  • if (toDate): creates endDate = new Date(toDate), sets hours endDate.setHours(23, 59, 59, 999),
                  sets query.date.$lte = endDate.

          • Queries DB: await DR.find(query).sort({ date: -1 }).
          • Returns: Array of DR documents.
      • updateDRAction(drId, action, optimized, submitted):
          • Finds target: await DR.findOne({ drId }). Throws "DR not found" if missing.
          • Final State Guard: If dr.submitted && dr.submitted.length > 0, throws "Submitted is already completed. DR
          cannot be changed.".
          • Action Logic (action !== undefined):
              • If dr.actions && dr.actions.length > 0, throws "Action is already completed and cannot be changed.".
              • If action !== "Opt IN" && action !== "Opt OUT", throws "Invalid action".
              • If action === "Opt OUT": sets dr.actions = ["Opt OUT"], dr.optimized = ["NO"], dr.submitted = ["NO"],
              dr.status = "Completed".
              • If action === "Opt IN": sets dr.actions = ["Opt IN"], dr.status = "In-progress".
          • Optimized Logic (optimized !== undefined):
              • If !dr.actions || dr.actions[0] !== "Opt IN", throws "Action must be Opt IN before updating Optimized.
              ".
              • If dr.optimized && dr.optimized.length > 0, throws "Optimized is already completed and cannot be
              changed.".
              • If optimized !== "YES" && optimized !== "NO", throws "Optimized must be YES or NO".
              • Sets dr.optimized = [optimized], dr.status = "In-progress".
          • Submitted Logic (submitted !== undefined):
              • If !dr.actions || dr.actions[0] !== "Opt IN", throws "Action must be Opt IN before updating Submitted.
              ".
              • If dr.submitted && dr.submitted.length > 0, throws "Submitted is already completed and cannot be
              changed.".
              • If submitted !== "YES" && submitted !== "NO", throws "Submitted must be YES or NO".
              • Sets dr.submitted = [submitted], dr.status = "Completed".
          • Empty Payload Guard: If action, optimized, and submitted are all undefined, throws "No update data
          provided".
          • Persists: await dr.save().
          • Returns: Updated dr document.


  ──────
  ## 6. Backend Dive

  ### Layer Architecture: Route vs Middleware vs Controller vs Service vs Model

    classDiagram
        class Route {
            <<HTTP Layer>>
            drRoutes.js
            +GET /
            +PATCH /:drId/action
        }
        class Middleware {
            <<Guard Layer>>
            authMiddleware.js
            +verifyToken()
            +attachReqUser()
        }
        class Controller {
            <<Transport Layer>>
            drController.js
            +getAllDRs(req, res, next)
            +updateDRAction(req, res, next)
        }
        class Service {
            <<Domain Logic>>
            drService.js
            +getAllDRs(filters)
            +updateDRAction(drId, payload)
        }
        class Model {
            <<Data Layer>>
            DR.js
            +drSchema
            +datacenterSchema
        }

        Route --> Middleware : triggers before
        Middleware --> Controller : calls next()
        Controller --> Service : delegates domain logic
        Service --> Model : performs queries & mutations

   Layer      | File Example      | What it Knows About                     | What it MUST NOT Do
  ------------|-------------------|-----------------------------------------|-----------------------------------------
   Route      | drRoutes.js       | Endpoint URIs, HTTP methods, route-     | Must not perform request validation or
              |                   | level middleware ordering.              | database queries.
   Middleware | authMiddleware.js | HTTP Headers (Authorization), token     | Must not format final domain response
              |                   | parsing, early 401 rejections.          | data or execute business workflow
              |                   |                                         | logic.
   Controller | drController.js   | Express req and res, query strings,     | Must not contain database queries
              |                   | status codes (200, 400).                | (DR.find) or state machine business
              |                   |                                         | logic.
   Service    | drService.js      | Business rules, state transition        | Must not reference req, res, next, or
              |                   | invariants, MongoDB queries via         | HTTP headers.
              |                   | Mongoose.                               |
   Model      | DR.js, User.js    | Document structure, data types,         | Must not handle HTTP requests or manage
              |                   | database collection names, Mongoose     | application workflow sequences.
              |                   | schema constraints.                     |
  ──────

  ## 7. API Endpoints Reference

   Method | Endpoint | Purpose  | Auth Re… | Request… | Controller Function | Service… | Database… | Response Payload
  --------|----------|----------|----------|----------|---------------------|----------|-----------|------------------
   GET    | /api/hea | Service  | No       | None     | Inline in app.js:27 | None     | None      | 200 { success:
          | lth      | health   |          |          |                     |          |           | true, message:
          |          | status   |          |          |                     |          |           | "DR Dispatcher
          |          |          |          |          |                     |          |           | API is running"
          |          |          |          |          |                     |          |           | }
   POST   | /api/aut | Register | No       | Body: {  | authController.sign | authServ | User.find | 201 { success:
          | h/signup | new user |          | name,    | up                  | ice.sign | One,      | true, message:
          |          | account  |          | email,   |                     | up       | User.crea | "Account created
          |          |          |          | password |                     |          | te        | successfully",
          |          |          |          | }        |                     |          |           | user: { id,
          |          |          |          |          |                     |          |           | name, email } }
   POST   | /api/aut | Authenti | No       | Body: {  | authController.logi | authServ | User.find | 200 { success:
          | h/login  | cate     |          | email,   | n                   | ice.logi | One       | true, message:
          |          | user &   |          | password |                     | n        |           | "Login
          |          | issue    |          | }        |                     |          |           | successful",
          |          | JWT      |          |          |                     |          |           | token, user: {
          |          |          |          |          |                     |          |           | id, name, email
          |          |          |          |          |                     |          |           | } }
   GET    | /api/aut | Fetch    | Yes      | Headers: | Inline in           | None     | User.find | 200 { success:
          | h/me     | authenti | (Bearer  | Authoriz | authRoutes.js:14    |          | ById (via | true, user: {
          |          | cated    | <token>) | ation:   |                     |          | authMiddl | _id, name,
          |          | user     |          | Bearer   |                     |          | eware)    | email,
          |          | session  |          | <token>  |                     |          |           | createdAt,
          |          |          |          |          |                     |          |           | updatedAt } }
   GET    | /api/dr  | Fetch    | Yes      | Query    | drController.getAll | drServic | DR.find(q | 200 { success:
          |          | list of  | (Bearer  | params:  | DRs                 | e.getAll | uery).sor | true, data: [
          |          | DR       | <token>) | search,  |                     | DRs      | t({ date: | ...drs ] }
          |          | events   |          | status,  |                     |          | -1 })     |
          |          | with     |          | eventTyp |                     |          |           |
          |          | filters  |          | e,       |                     |          |           |
          |          |          |          | fromDate |                     |          |           |
          |          |          |          | , toDate |                     |          |           |
   PATCH  | /api/dr/ | Advance  | Yes      | URL      | drController.update | drServic | DR.findOn | 200 { success:
          | :drId/ac | DR event | (Bearer  | param:   | DRAction            | e.update | e({ drId  | true, message:
          | tion     | workflow | <token>) | drIdBody |                     | DRAction | }),       | "DR action
          |          | state    |          | : {      |                     |          | dr.save() | updated
          |          |          |          | action?, |                     |          |           | successfully",
          |          |          |          | optimize |                     |          |           | data: dr }
          |          |          |          | d?,      |                     |          |           |
          |          |          |          | submitte |                     |          |           |
          |          |          |          | d? }     |                     |          |           |
  ──────
  ## 8. Authentication & Authorization Lifecycle

    sequenceDiagram
        autonumber
        actor User
        participant Browser as React App (Login.jsx)
        participant AuthContext as AuthContext.jsx
        participant Axios as Axios (api.js)
        participant Server as Express (authRoutes.js)
        participant Controller as authController.js
        participant Service as authService.js
        participant DB as MongoDB (users)

        Note over User, DB: LOGIN FLOW
        User->>Browser: Enters email & password, clicks "Sign in"
        Browser->>AuthContext: login({ email, password })
        AuthContext->>Axios: api.post("/auth/login", credentials)
        Axios->>Server: POST /api/auth/login
        Server->>Controller: login(req, res, next)
        Controller->>Service: login({ email, password })
        Service->>DB: User.findOne({ email: normalizedEmail })
        DB-->>Service: User document with password hash
        Service->>Service: bcrypt.compare(password, user.password)
        Service->>Service: jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' })
        Service-->>Controller: { token, user: { id, name, email } }
        Controller-->>Server: HTTP 200 JSON
        Server-->>Axios: HTTP 200 Response
        Axios-->>AuthContext: Returns data
        AuthContext->>Browser: localStorage.setItem("token", data.token)
        AuthContext->>AuthContext: setUser(data.user)
        AuthContext-->>Browser: navigate("/dr-dispatcher")

        Note over User, DB: AUTHENTICATED REQUEST (GET /api/dr)
        Browser->>Axios: api.get("/dr")
        Axios->>Axios: Interceptor reads localStorage.getItem("token")
        Axios->>Server: GET /api/dr (Header: Authorization: Bearer <token>)
        Server->>Server: authMiddleware: jwt.verify(token, JWT_SECRET)
        Server->>DB: User.findById(decoded.userId).select("-password")
        DB-->>Server: User record found
        Server->>Server: req.user = user, next()
        Server->>Controller: getAllDRs(req, res, next)
        Controller-->>Browser: HTTP 200 with DR records

  ### Authentication vs Authorization in this Codebase

  • Authentication (Implemented):
      • Verifies who you are.
      • Handled via bcryptjs password comparison and jsonwebtoken issuance.
      • Validated on protected endpoints by authMiddleware.js.
  • Authorization (Not Implemented):
      • Dictates what you are allowed to do (e.g. Roles: ADMIN, DISPATCHER, AUDITOR).
      • In this codebase, there are no role fields on User.js and no permission checks on any route. Every
      authenticated user has identical, unrestricted privileges to read all DRs and mutate any DR state.

  ──────
  ## 9. Demand Response (DR) Workflow Engine

  ### State Machine Definition

    stateDiagram-v2
        [*] --> Planned

        Planned --> In_progress : Action = "Opt IN"
        Planned --> Completed : Action = "Opt OUT"\n(optimized = ["NO"], submitted = ["NO"])

        In_progress --> In_progress : Optimized = "YES" or "NO"
        In_progress --> Completed : Submitted = "YES" or "NO"

        Completed --> [*] : Permanent Final State (Locked)

  ### Trace of a Concrete Example: User Clicks "Opt IN" on DR0022

  Here is the exact step-by-step chain of execution when an operator clicks the Opt IN button on row DR0022:

    1. [User Interaction]
       Operator clicks the <button> "Opt IN" on the DR0022 row in DRTable.jsx.

    2. [DRTable.jsx: Line 149-156]
       The onClick handler invokes:
       handleAction("DR0022", "Opt IN", undefined, undefined)

    3. [DRTable.jsx: Line 20-38]
       handleAction sets local React state: setUpdatingDR("DR0022").
       This immediately sets the row CSS to .dr-row-updating and disables all action buttons on this row.
       It then awaits the prop function:
       await onDRUpdate("DR0022", "Opt IN", undefined, undefined)

    4. [DRDispatcher.jsx: Line 62-80]
       The parent handleDRUpdate function executes:
       const response = await drService.updateDRAction("DR0022", "Opt IN", undefined, undefined)

    5. [client/src/services/drService.js: Line 25-38]
       updateDRAction invokes Axios:
       api.patch("/dr/DR0022/action", { action: "Opt IN", optimized: undefined, submitted: undefined })

    6. [client/src/services/api.js: Line 10-23]
       Axios request interceptor triggers before transmission.
       It reads localStorage.getItem("token") and sets:
       config.headers.Authorization = "Bearer eyJhbGciOi..."
       The HTTP request is dispatched across the network to http://localhost:5001/api/dr/DR0022/action.

    7. [server/src/app.js & server/src/routes/drRoutes.js: Line 11]
       Express routes the request matching PATCH /api/dr/:drId/action.
       It passes control to authMiddleware.

    8. [server/src/middleware/authMiddleware.js: Line 5-46]
       authMiddleware reads req.headers.authorization, verifies the token with jwt.verify(), queries
       User.findById(decoded.userId).select("-password"), assigns req.user = user, and invokes next().

    9. [server/src/controllers/drController.js: Line 4-28]
       drController.updateDRAction extracts:
       const drId = req.params.drId; // "DR0022"
       const { action, optimized, submitted } = req.body; // action = "Opt IN"
       It calls: await drService.updateDRAction("DR0022", "Opt IN", undefined, undefined)

    10. [server/src/services/drService.js: Line 4-131]
        drService executes domain validation:
        a. Queries database: const dr = await DR.findOne({ drId: "DR0022" }).
        b. Final State Guard: Checks if dr.submitted.length > 0. False (currently empty).
        c. Action Guard: Checks if dr.actions.length > 0. False (currently empty).
        d. Checks if action === "Opt IN" or "Opt OUT". Valid ("Opt IN").
        e. Applies mutations:
           dr.actions = ["Opt IN"];
           dr.status = "In-progress";
        f. Optimized & Submitted blocks are skipped because they are undefined.
        g. Saves to database: await dr.save().
        h. Returns the updated Mongoose document.

    11. [server/src/controllers/drController.js: Line 17-21]
        Sends HTTP response:
        res.status(200).json({
          success: true,
          message: "DR action updated successfully",
          data: dr
        });

    12. [client/src/pages/DRDispatcher.jsx: Line 75-79]
        drService returns response.data to handleDRUpdate.
        DRDispatcher executes state updater:
        setDrs(currentDRs => currentDRs.map(dr => dr.drId === "DR0022" ? response.data : dr));

    13. [client/src/components/DRTable.jsx: Line 35-37]
        The await onDRUpdate promise resolves.
        The finally block runs: setUpdatingDR(null).

    14. [React Re-render & DOM Reconciliation]
        React re-renders DRDispatcher and DRTable with updated drs state:
        - DR0022 status badge renders "In-progress" (.dr-badge-in-progress).
        - "Opt IN" button gets class .dr-btn-selected and is disabled.
        - "Opt OUT" button is disabled (actionCompleted is true).
        - "Optimized YES" and "Optimized NO" buttons become ENABLED (!isOptIn is false, optimizedCompleted is false).
        - "Submitted YES" and "Submitted NO" buttons remain DISABLED (!optimizedCompleted is true).

  ### Where Every Business Rule is Enforced

   Business Rule                        | Frontend Enforcement (DRTable.jsx)   | Backend Enforcement (drService.js)
  --------------------------------------|--------------------------------------|--------------------------------------
   Cannot change anything once          | Buttons disabled: submittedCompleted | Throws "Submitted is already
   Submitted                            | check (L248)                         | completed. DR cannot be changed."
                                        |                                      | (L17-19)
   Action can only be selected once     | Buttons disabled: actionCompleted    | Throws "Action is already completed
                                        | check (L147, L167)                   | and cannot be changed." (L27-29)
   Action must be "Opt IN" or "Opt OUT" | Only buttons for Opt IN / Opt OUT    | Throws "Invalid action" (L32-34)
                                        | exist                                |
   Opt OUT automatically completes DR   | UI updates on state arrival          | Sets dr.optimized = ["NO"],
                                        |                                      | dr.submitted = ["NO"], dr.status =
                                        |                                      | "Completed" (L41-45)
   Must Opt IN before Optimized         | Buttons disabled: !isOptIn check     | Throws "Action must be Opt IN before
                                        | (L193, L217)                         | updating Optimized." (L65-67)
   Optimized can only be selected once  | Buttons disabled: optimizedCompleted | Throws "Optimized is already
                                        | check (L194, L218)                   | completed and cannot be changed."
                                        |                                      | (L70-74)
   Optimized must be YES or NO          | Only buttons for YES / NO exist      | Throws "Optimized must be YES or NO"
                                        |                                      | (L77-79)
   Must Opt IN & Complete Optimized     | Buttons disabled: !isOptIn ||        | Throws "Action must be Opt IN before
   before Submitted                     | !optimizedCompleted (L246-247)       | updating Submitted." (L93-95)
   Submitted can only be selected once  | Buttons disabled: submittedCompleted | Throws "Submitted is already
                                        | check (L248)                         | completed and cannot be changed."
                                        |                                      | (L98-102)
   Submitted completes DR               | UI reflects dr.status ===            | Sets dr.status = "Completed" (L112)
                                        | "Completed" badge                    |
  ──────

  ## 10. Database Schema Analysis

  ### 1. User Schema (User.js)

   Field     | BSON T… | Req… | Un… | Constraints & Defaults       | Purpose & Usage in Code
  -----------|---------|------|-----|------------------------------|--------------------------------------------------
   name      | String  | Yes  | No  | trim: true, minlength: 2,    | User's full name. Validated via regex in
             |         |      |     | maxlength: 50                | authController.signup. Displayed in client
             |         |      |     |                              | session.
   email     | String  | Yes  | Yes | unique: true, lowercase:     | Primary login identifier. Normalized and queried
             |         |      |     | true, trim: true             | in authService.login and signup.
   password  | String  | Yes  | No  | minlength: 8                 | Stores bcrypt salt-hashed password string. Never
             |         |      |     |                              | returned in /me (select("-password")).
   createdAt | Date    | Auto | No  | Managed by timestamps: true  | Audit timestamp of registration.
   updatedAt | Date    | Auto | No  | Managed by timestamps: true  | Audit timestamp of last user record
             |         |      |     |                              | modification.

  ### 2. Embedded datacenterSchema (DR.js:3-23)

   Field           | BSON Type | Required | Constraints | Purpose & Usage in Code
  -----------------|-----------|----------|-------------|-------------------------------------------------------------
   dcId            | String    | Yes      | None        | Unique facility identifier (e.g. "DC-EAST-01"). Rendered in
                   |           |          |             | expanded child table row.
   flexCalledMw    | Number    | Yes      | min: 0      | Curtailment power demand requested for this specific
                   |           |          |             | facility in Megawatts.
   flexAvailableMw | Number    | Yes      | min: 0      | Actual available power curtailment headroom at this
                   |           |          |             | facility in Megawatts.

  │ Important
  │ datacenterSchema is configured with { _id: false }. Mongoose does not create synthetic ObjectId fields for
  embedded
  │ data center subdocuments, keeping documents compact and avoiding unnecessary index overhead.

  ### 3. Root DR Schema (DR.js:25-96)

   Field                 | BSON Type          | Required | Enum / Defaults         | Purpose & Usage in Code
  -----------------------|--------------------|----------|-------------------------|----------------------------------
   drId                  | String             | Yes      | unique: true, trim:     | Human-readable event ID (e.g.,
                         |                    |          | true                    | "DR-9021"). Used as lookup key
                         |                    |          |                         | in updateDRAction and search
                         |                    |          |                         | regex.
   eventType             | String             | Yes      | enum: ["DR", "EEA"]     | Event classification: Demand
                         |                    |          |                         | Response standard curtailment vs
                         |                    |          |                         | Energy Emergency Alert.
                         |                    |          |                         | Filterable via UI.
   date                  | Date               | Yes      | None                    | Date of the grid event.
                         |                    |          |                         | Formatted via
                         |                    |          |                         | toLocaleDateString(). Sorted
                         |                    |          |                         | descending in getAllDRs.
   startTime             | String             | Yes      | None                    | Start time of event window (e.g.
                         |                    |          |                         | "14:00"). Displayed in table
                         |                    |          |                         | column.
   endTime               | String             | Yes      | None                    | End time of event window (e.g.
                         |                    |          |                         | "18:00"). Displayed in table
                         |                    |          |                         | column.
   status                | String             | Yes      | enum: ["Planned", "In-  | Current workflow state of the
                         |                    |          | progress", "Completed"] | event. Controls row badge
                         |                    |          |                         | coloring.
   flexCalledMw          | Number             | Yes      | min: 0                  | Total requested curtailment
                         |                    |          |                         | across all participating data
                         |                    |          |                         | centers.
   flexAvailableMw       | Number             | Yes      | min: 0                  | Total available curtailment
                         |                    |          |                         | across all participating data
                         |                    |          |                         | centers.
   actions               | [String]           | No       | default: []             | Stores array holding ["Opt IN"]
                         |                    |          |                         | or ["Opt OUT"].
   optimized             | [String]           | No       | default: []             | Stores array holding ["YES"] or
                         |                    |          |                         | ["NO"].
   submitted             | [String]           | No       | default: []             | Stores array holding ["YES"] or
                         |                    |          |                         | ["NO"].
   datacenters           | [datacenterSchema] | No       | default: []             | Embedded array of data center
                         |                    |          |                         | sub-documents.
   createdAt / updatedAt | Date               | Auto     | Managed by timestamps:  | Audit timestamps.
                         |                    |          | true                    |
  ──────
  ## Backend-Related Error Handling & Known Quirks

  ### Current Error Handling Implementation

    graph TD
        subgraph Client Layer
            A1["Axios Request Error"] --> A2["catch block in Login / Signup / DRDispatcher"]
            A2 --> A3["Reads error.response?.data?.message"]
            A3 --> A4["Sets React state error string, displays UI banner"]
        end
        subgraph Backend Controller Layer
            B1["drController.updateDRAction"] -->|try / catch| B2["Explicit res.status(400).json({ success: false,
  message: error.message })"]
            B3["drController.getAllDRs & authController"] -->|try / catch| B4["next(error)"]
        end
        subgraph Express Default Error Handler
            B4 --> C1["No custom error middleware in app.js!"]
            C1 --> C2["Express default HTML/500 handler returns stack/text to client"]
        end

  ### HTTP Status Codes Used

   Code               | Meaning in this Codebase            | Triggering Conditions
  --------------------|-------------------------------------|---------------------------------------------------------
   200 OK             | Request succeeded                   | Successful login, user retrieval via /me, DR list
                      |                                     | fetch, DR action update.
   201 Created        | Resource created                    | Successful user registration in authController.signup.
   400 Bad Request    | Input validation failure / State    | Missing name/email/password; regex validation failure;
                      | violation                           | invalid DR action/optimized/submitted values; violating
                      |                                     | state machine sequence in updateDRAction.
   401 Unauthorized   | Authentication failure              | Missing/malformed Authorization header; expired or
                      |                                     | invalid JWT token; incorrect password on login; non-
                      |                                     | existent user on /me.
   409 Conflict       | Resource collision                  | Attempting to signup with an email that already exists
                      |                                     | (authService.signup).
   500 Internal Error | Unhandled exception                 | Express default error handler when database connection
                      |                                     | drops or unhandled service errors trigger next(error).

  ### Known Quirks & Architectural Observations (Documented As-Is)

  1. Missing Custom Express Error Middleware:
  In server/src/app.js, there is no app.use((err, req, res, next) => ...) registered.
      • In authController.js and drController.getAllDRs, errors are passed to next(error).
      • In authService.js, errors are given error.statusCode = 409 or 401. Express's default error handler catches
      this, but sends an HTML or raw text response instead of a structured JSON payload ({ success: false, message }).
      • Conversely, drController.updateDRAction handles errors with an explicit try / catch that returns JSON: res.
      status(400).json({ success: false, message: error.message }).
  2. Missing try / catch in handleDRUpdate (DRDispatcher.jsx:62-80):
  If drService.updateDRAction throws an error (e.g., 400 Bad Request), handleDRUpdate does not catch it. The unhandled
  promise rejection bubbles up to DRTable.jsx:handleAction. In DRTable.jsx, it hits the finally block to reset
  updatingDR = null, but no error message is displayed on screen to inform the operator why the action failed.
  3. Environment Variable Naming Mismatch:
      • server/src/config/db.js expects process.env.MONGO_URL.
      • Readme.md instructs developers to set MONGO_URI. If a developer uses MONGO_URI, Mongoose will fail to connect
      with undefined.
  4. CORS Port Configuration:
      • server/src/app.js hardcodes CORS origin to "http://localhost:5174".
      • Standard Vite projects default to port 5173. If client runs on 5173, all browser requests will be blocked by
      CORS unless client is forced onto 5174.
  5. Missing Root Route /:
  client/src/App.jsx defines routes for /login, /signup, and /dr-dispatcher. If a user navigates to
  http://localhost:5173/, nothing matches, resulting in a blank page.
  6. Empty Seed File:
  server/src/seed/drData.js is 0 bytes. Database initialization must currently be performed manually or via external
  scripts.
  ──────

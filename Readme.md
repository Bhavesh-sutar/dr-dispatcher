### `README.md`

````markdown
# DR Dispatcher

A full-stack DR (Demand Response) Dispatcher application built with React, Node.js, Express, and MongoDB.

The application provides authenticated users with a dashboard to view, search, filter, and manage Demand Response (DR) events and their associated Data Centers.

## Tech Stack

### Frontend
- React
- Vite
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## Project Structure

```text
dr-dispatcher/
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── server/                 # Node.js / Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── seed/
│   │   └── utils/
│   └── package.json
│
└── README.md
````

## Current Features

* User signup and login
* JWT-based authentication
* Protected application routes
* Persistent authentication across page refreshes
* DR event listing
* Search by DR ID
* Filter by:

  * Date range
  * Status
  * Event Type
* Refresh DR data without resetting filters
* Expandable Data Center details
* Display of DR flex called and flex available capacity
* DR workflow management through the backend API

## DR Event Information

Each DR event can contain:

* DR ID
* Event Type
* Date
* Start Time
* End Time
* Status
* Flex Called (MW)
* Flex Available (MW)
* Associated Data Centers

Each Data Center contains:

* Data Center ID
* Flex Called (MW)
* Flex Available (MW)

## DR Workflow

The application supports the following workflow:

```text
Planned
   │
   ├── Opt IN
   │      │
   │      ↓
   │   In-progress
   │      │
   │      ├── Optimized YES/NO
   │      │
   │      ↓
   │   Submitted YES/NO
   │      │
   │      ↓
   │   Completed
   │
   └── Opt OUT
          │
          ↓
       Completed
```

The backend is responsible for validating the workflow and maintaining the DR status.

## API

The backend runs on:

```text
http://localhost:5001
```

Main API prefix:

```text
/api
```

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### DR

```text
GET   /api/dr
PATCH /api/dr/:drId/action
```

The DR API supports filtering by search, status, event type, and date range.

## Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit `.env` files or secrets to GitHub.

## Installation

Clone the repository:

```bash
git clone https://github.com/Bhavesh-sutar/dr-dispatcher.git
cd dr-dispatcher
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

## Running the Application

### Start Backend

From the `server` directory:

```bash
npm run dev
```

### Start Frontend

From the `client` directory:

```bash
npm run dev
```

The frontend and backend will run on their configured local development ports.

## Authentication

The application uses JWT-based authentication.

After successful login, the frontend stores the authentication token and sends it with authenticated API requests using an Axios request interceptor.

Protected backend routes verify the token through authentication middleware.

## Development Status

The project is currently under active development.

The core authentication, DR APIs, filtering, DR listing, Data Center display, and backend workflow functionality are implemented. Additional frontend workflow controls, UI improvements, testing, and final polishing are being completed.

## Author

**Bhavesh Sutar**

````

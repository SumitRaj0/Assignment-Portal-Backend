# Assignment Portal - Backend

Node.js backend API for the assignment management system. Handles authentication, assignments, and submissions.

## Setup

Install Node.js (v14+) and MongoDB.

Install dependencies:
```
npm install
```

Create a `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/assignment-app
JWT_SECRET=your_secret_key_here
```

For MongoDB Atlas, use your connection string instead.

Start the server:
```
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Auth
- POST `/api/auth/login` - Login

### Teacher Routes (need auth + teacher role)
- GET `/api/assignments` - Get assignments (query: status, page, limit)
- GET `/api/assignments/analytics` - Get dashboard stats
- GET `/api/assignments/:id` - Get single assignment
- POST `/api/assignments` - Create assignment
- PUT `/api/assignments/:id` - Update assignment (Draft only)
- DELETE `/api/assignments/:id` - Delete assignment (Draft only)
- POST `/api/assignments/:id/publish` - Publish assignment
- POST `/api/assignments/:id/complete` - Mark as completed
- GET `/api/assignments/:id/submissions` - Get submissions

### Student Routes (need auth + student role)
- GET `/api/submissions/assignments` - Get published assignments
- POST `/api/submissions` - Submit answer
- GET `/api/submissions/assignment/:assignmentId` - Get my submission

## Authentication

Include JWT token in requests:
```
Authorization: Bearer <token>
```

## Project Structure

```
config/          - Database connection
controllers/     - Business logic
middleware/      - Auth and role checks
models/          - Mongoose schemas
routes/          - API routes
server.js        - Entry point
```

## Workflow

Assignments have three states:
- Draft: Can edit/delete, not visible to students
- Published: Visible to students, can't edit/delete
- Completed: Locked, can only view submissions

Students can only submit to Published assignments, and only once per assignment. Submissions are blocked after the due date.

## Tech Used

- Node.js
- Express
- MongoDB with Mongoose
- JWT for auth
- bcryptjs for password hashing

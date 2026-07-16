# Ticketing Backend - Simple Explanation

This README explains every important part of the backend in a simple and easy way.

## 1. What is this project?

This project is the backend for a ticket resale marketplace. Its job is to handle users, authentication, and future ticket-related actions such as creating listings, buying tickets, and managing sellers and buyers.

## 2. What is already implemented?

### A. Server setup

The server is created using Express.js. The main entry file is server.js. Its role is to start the backend and make it listen on a port.

### B. Database connection

The project connects to MongoDB using Mongoose. The file src/config/db.js is responsible for connecting the app to the database before the server starts handling requests.

### C. Express app setup

The file src/app.js contains the main Express app. It sets up:

- CORS so the frontend can talk to the backend
- JSON body parsing so incoming data can be read
- Logging for requests
- The health route and auth routes

### D. Health check route

The route GET /api/health is used to confirm that the server is running. It returns a success response if everything is working.

### E. User authentication system

The backend has a basic authentication system. It includes a user model, signup/login logic, password hashing, and JWT-based authentication.

### F. Signup API

The signup API is available at POST /api/auth/signup. When a user signs up, the backend checks if the required fields are present, verifies whether the email already exists, and creates a new user if everything is valid.

### G. Login API

The login API is available at POST /api/auth/login. When a user logs in, the backend checks the email and password. If they match, it creates a JWT token and sends it back to the client.

### H. JWT token system

JWT stands for JSON Web Token. It is used to identify a logged-in user. After login, the backend generates a token, and that token is used for protected routes.

### I. Protected routes

The file src/middleware/auth.js contains the protect middleware. It reads the token from the request header, verifies it, and allows the user to access protected endpoints only if the token is valid.

### J. Role-based access

The auth middleware also supports roles like buyer, seller, and admin. This helps restrict some actions to only certain users.

### K. Error handling

The file src/middleware/errorHandler.js handles errors in one central place. If something goes wrong, the backend returns a clean error response instead of crashing.

### L. Events API

The backend supports event management for ticket listings:

- POST /api/events: protected route to create a new event with `bannerImage` upload. Requires `title`, `description`, `category`, `venue`, `city`, `eventDate`, and `bannerImage`.
- GET /api/events: public route to list all events. Supports optional query filters `city` and `category`.
- GET /api/events/:id: public route to fetch details for a single event.
- PUT /api/events/:id: protected route to update an event. Only the event creator or an admin can update it.
- DELETE /api/events/:id: protected route to delete an event. Only the event creator or an admin can delete it.

The file src/routes/eventRoutes.js defines these endpoints, and src/controllers/eventController.js contains the business logic.

## 3. Main files and what they do

- server.js: starts the backend server
- src/app.js: creates the Express app and mounts routes
- src/config/db.js: connects the app to MongoDB
- src/controllers/authController.js: contains signup, login, and user profile logic
- src/controllers/eventController.js: contains event creation, reading, updating, and deletion logic
- src/routes/authRoute.js: defines authentication routes
- src/routes/eventRoutes.js: defines event listing and ticketing routes
- src/models/User.js: defines the User schema and password hashing logic
- src/middleware/auth.js: checks JWT tokens and protects routes
- src/middleware/errorHandler.js: handles errors neatly
- src/utils/generateToken.js: creates JWT tokens

## 4. Project folder structure

`	ext
ticketing-backend/
+-- server.js
+-- src/
�   +-- app.js
�   +-- config/
�   �   +-- db.js
�   +-- controllers/
�   �   +-- authController.js
�   �   +-- eventController.js
�   +-- middleware/
�   �   +-- auth.js
�   �   +-- errorHandler.js
�   +-- models/
�   �   +-- User.js
   +-- routes/
�   �   +-- authRoute.js
�   �   +-- eventRoutes.js
�   +-- utils/
�       +-- generateToken.js
`

## 5. Setup instructions

1. Create the environment file:
   `ash
cp .env.example .env
`

2. Add your environment values in .env:
   - MONGODB_URI
   - JWT_SECRET
   - JWT_EXPIRES_IN (optional)

3. Install dependencies:
   `ash
npm install
`

4. Start the backend:
   `ash
npm run dev
`

## 6. How to test the backend

Open the browser or use Postman/Thunder Client and try the examples below. Replace `:PORT` with the port your server uses (default `5000`).

Health check

`bash
GET http://localhost:5000/api/health
`

Expected response:

```json
{
  "success": true,
  "message": "Stub API is running",
  "timestamp": "<ISO timestamp>"
}
```

Authentication examples (Postman or curl)

- Signup (create user)

```bash
curl -X POST http://localhost:5000/api/auth/signup \
   -H "Content-Type: application/json" \
   -d '{"name":"Alice","email":"alice@example.com","password":"password123","role":"seller"}'
```

Sample successful response:

```json
{
  "success": true,
  "user": {
    "_id": "<userId>",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "seller"
  },
  "token": "<jwt-token>"
}
```

- Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"alice@example.com","password":"password123"}'
```

Sample successful response:

```json
{
  "success": true,
  "user": {
    "_id": "<userId>",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "seller"
  },
  "token": "<jwt-token>"
}
```

Events API examples

- List events (public, optional filters)

```bash
curl "http://localhost:5000/api/events?city=Karachi&category=Music"
```

Sample response:

```json
{
  "success": true,
  "events": [
    /* array of event objects */
  ]
}
```

- Get event by id

```bash
curl http://localhost:5000/api/events/<eventId>
```

- Create event (protected, multipart form-data upload for `bannerImage`)

```bash
curl -X POST http://localhost:5000/api/events \
   -H "Authorization: Bearer <jwt-token>" \
   -F "title=My Concert" \
   -F "description=An evening of music" \
   -F "category=Music" \
   -F "venue=Hall 1" \
   -F "city=Karachi" \
   -F "eventDate=2026-08-01T19:00:00.000Z" \
   -F "bannerImage=@/path/to/banner.jpg"
```

Sample successful response:

```json
{
  "success": true,
  "event": {
    /* created event object */
  },
  "token": "<jwt-token>" /* token returned by createEvent */
}
```

- Update event (protected)

```bash
curl -X PUT http://localhost:5000/api/events/<eventId> \
   -H "Authorization: Bearer <jwt-token>" \
   -F "title=Updated Title" \
   -F "bannerImage=@/path/to/new-banner.jpg"
```

- Delete event (protected)

```bash
curl -X DELETE http://localhost:5000/api/events/<eventId> \
   -H "Authorization: Bearer <jwt-token>"
```

Notes

- Use the `Authorization: Bearer <token>` header for protected routes. You get the token from the login/signup responses.
- For Postman, set the request body to `form-data` for file uploads and `raw JSON` for JSON bodies.
- If you want, I can add Postman collection export examples to this repo.

## 7. What comes next

## 7. What comes next

The current backend is the foundation. The next step is to add more real marketplace features such as:

- creating ticket listings
- buying and selling tickets
- seller and buyer dashboards
- payment integration
- admin controls

## 8. Simple summary

In short, the backend currently:

- starts the server
- connects to MongoDB
- handles signup and login
- creates JWT tokens
- protects routes
- handles errors properly

That is the complete backend flow for the project so far.

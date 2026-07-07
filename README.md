# Railyatri

Railyatri is a train booking and status platform built with a React frontend and an Express/MongoDB backend. It supports user authentication, train search, ticket booking, live status tracking, booking management, admin train management, and downloadable ticket PDFs.

## Live Demo


## Features

- User registration and login
- User profile view and update
- Search trains and view train details
- Book tickets and manage user bookings
- Download ticket PDF for confirmed bookings
- Live train status lookup
- Admin access to create, update, and delete trains
- Admin analytics and booking management

## Tech Stack

- Frontend: React, Tailwind CSS, CRACO, React Router
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JSON Web Tokens (JWT)
- Utilities: Axios, pdfkit, qrcode, nodemailer

## Prerequisites

- Node.js LTS
- npm or Yarn
- MongoDB instance
- Optional: a local `.env` file for backend configuration

## Repository Structure

- `backend/` — backend wrapper commands
- `backend/express_app/` — Express server, routes, controllers, models
- `frontend/` — React application and UI components

## Setup

### Backend

1. Open a terminal and navigate to the backend folder:

```bash
cd backend/express_app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in `backend/express_app/` with values similar to:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/railyatri
JWT_SECRET=your_jwt_secret
RAILRADAR_API_KEY=your_api_key
```

4. Start the backend server in development mode:

```bash
npm run dev
```

The backend API should be available at `http://localhost:3000` by default.

### Frontend

1. Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure the frontend environment by creating or updating `frontend/.env`:

```env
PORT=3001
REACT_APP_BACKEND_URL=http://localhost:3000
```

4. Start the frontend development server:

```bash
npm run dev
```

The frontend application should then run at `http://localhost:3001`.

## Scripts

### Backend

- `npm run dev` — start backend with file watching
- `npm start` — start backend normally

### Frontend

- `yarn dev` or `yarn start` — start frontend development server
- `yarn build` — build production frontend bundle
- `yarn test` — run frontend tests

## API Endpoints

### Auth

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login and receive a JWT
- `GET /api/auth/profile` — get current user profile
- `PUT /api/auth/profile` — update current user profile

### Trains

- `GET /api/trains` — list available trains
- `POST /api/trains` — create a train (admin only)
- `GET /api/trains/:id` — get train details
- `PUT /api/trains/:id` — update train details (admin only)
- `DELETE /api/trains/:id` — delete a train (admin only)
- `GET /api/trains/analytics` — get train analytics (admin only)
- `GET /api/trains/:id/bookings` — get bookings for a train (admin only)

### Bookings

- `GET /api/bookings` — get current user bookings
- `POST /api/bookings` — create a booking
- `GET /api/bookings/:id` — get booking details
- `PUT /api/bookings/:id/cancel` — cancel a booking
- `GET /api/bookings/:id/ticket-pdf` — download ticket PDF
- `GET /api/bookings/live-status/:trainNumber` — check live status by train number
- `GET /api/bookings/all` — get all bookings (admin only)

## Notes

- The frontend reads the backend URL from `REACT_APP_BACKEND_URL`.
- The backend uses `dotenv` and expects environment variables in `backend/express_app/.env`.

## Contributing

If you want to contribute, create a feature branch, add meaningful commits, and open a pull request. For bug fixes or improvements, include a short description of the change and how to test it.

## License

This project is currently private and does not specify a license.

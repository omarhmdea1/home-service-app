# Home Service App

A full-stack application for booking home services, connecting customers with service providers.

## Project Structure

- **Client**: React frontend (port 3000)
- **Server**: Express.js backend with MongoDB integration (port 5001)

## Features

- User authentication with Firebase
- Role-based access control (customer/provider)
- Service browsing and booking
- Provider dashboard for managing services and bookings
- MongoDB database integration for persistent storage
- Customer–provider messaging (chat available on the Booking Detail page)

## Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Firebase Authentication

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Firebase Admin SDK for authentication

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Firebase project

### Environment Setup

1. **Clone the repository**
   ```
   git clone https://github.com/omarhmdea1/home-service-app.git
   cd home-service-app
   ```

2. **Set up environment variables**

   Create a `.env` file in the server directory using the provided `.env.example` as a template:
   ```
   cd server
   cp .env.example .env
   ```

   Update the `.env` file with your MongoDB Atlas connection string and Firebase project ID.

3. **Set up Firebase Admin SDK**

   Download your Firebase Admin SDK service account key and save it as `firebase-service-account.json` in the server directory.

### Installation

1. **Install server dependencies**
   ```
   cd server
   npm install
   ```

2. **Install client dependencies**
   ```
   cd ../client
   npm install
   ```

### Database Seeding

To seed the database with initial data:

```
cd server
node seeder.js
```

To clear the database:

```
cd server
node seeder.js -d
```

## Running the Application

1. **Start the server**
   ```
   cd server
   npm start
   ```

2. **Start the client**
   ```
   cd client
   npm start
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## API Endpoints

### Authentication
- All protected routes require a Firebase ID token in the Authorization header

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `POST /api/users/provider-registration` - Register as a provider

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create a service (provider only)
- `PUT /api/services/:id` - Update a service (provider only)
- `DELETE /api/services/:id` - Delete a service (provider only)

### Bookings
- `GET /api/bookings` - Get bookings (filtered by user or provider)
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create a booking
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete a booking

### Messages
- `POST /api/messages` - Send a message
- `GET /api/messages/booking/:bookingId` - Get messages for a booking
- `GET /api/messages/unread` - Get unread message count
- `PUT /api/messages/:id/read` - Mark a message as read

## Client-Server Integration

The client now uses the backend API for all data operations instead of directly accessing Firebase Firestore. Authentication is still handled by Firebase, but the authentication token is passed to the backend for authorization.

## License

MIT

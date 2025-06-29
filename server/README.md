# Home Service App - Server

This is the backend server for the Home Service App, built with Express.js and MongoDB.

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account or sign in
2. Create a new project
3. Build a new cluster (the free tier is sufficient for development)
4. Once your cluster is created, click on "Connect"
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `<username>`, `<password>`, and `<dbname>` with your MongoDB Atlas username, password, and database name

### 2. Environment Variables

Create a `.env` file in the server directory with the following variables:

```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
FIREBASE_PROJECT_ID=home-serve-d3d4a
```

### 3. Firebase Admin SDK Setup

For Firebase authentication to work on the server side:

1. Go to your Firebase project console
2. Navigate to Project Settings > Service Accounts
3. Click "Generate new private key"
4. Save the JSON file securely
5. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to this file:

```
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-project-firebase-adminsdk-xxxxx-xxxxxxxxxx.json"
```

### 4. Install Dependencies

```
npm install
```

### 5. Run the Server

```
npm run dev
```

The server will run on port 5001 by default.

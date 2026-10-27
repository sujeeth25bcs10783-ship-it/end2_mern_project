# Social Media Application (MERN Stack)

A full-stack social media application built using the MERN stack (MongoDB, Express, React, Node.js) with real-time updates via Socket.IO, JWT authentication, and media storage via Cloudinary.

---

## 🌐 Live Deployment Links

- **Live Application (Frontend on Vercel)**: [https://end2-mern-projects.vercel.app](https://end2-mern-projects.vercel.app)
- **API Server (Backend on Render)**: [https://end2-mern-project.onrender.com](https://end2-mern-project.onrender.com)
- **Health Check Endpoint**: [https://end2-mern-project.onrender.com/health](https://end2-mern-project.onrender.com/health)

---

## 🎥 Project Demo Video

- **Demo Video Link**: [Watch Full Project Demo on Google Drive](https://drive.google.com/file/d/1LGjUDvaqNF9bT7zLhpoRGeKlk3zXuxZP/view?usp=drivesdk)

---

## Features

- **Authentication & Authorization**: Secure signup, login, and logout using JWT stored in `httpOnly` cookies.
- **User Profiles**: View and edit user profiles with profile pictures, bio, and follower/following stats.
- **Posts & Feeds**: Create posts with text and image uploads, view timeline feeds.
- **Reels & Stories**: Short-form video reels and ephemeral stories support.
- **Interactions**: Like, comment, and engage with posts in real-time.
- **Real-Time Notifications & Presence**: Socket.IO integration for live online status and notifications.
- **Responsive UI**: Built with React, Tailwind CSS, and Redux Toolkit for state management.

---

## Tech Stack

- **Frontend**: React 19, Vite, Redux Toolkit, React Router, Tailwind CSS, Socket.IO Client, Axios
- **Backend**: Node.js, Express 5, Socket.IO, Mongoose, Multer, Cloudinary, Cookie-parser, Bcrypt
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## Project Structure

```text
├── backend/
│   ├── controllers/      # Express route controllers
│   ├── middlewares/      # Auth, error handling, file uploads
│   ├── models/           # Mongoose schemas (User, Post, Reel, Story, etc.)
│   ├── routes/           # API route definitions
│   ├── utils/            # JWT token generation, Cloudinary helpers
│   ├── .env.example      # Backend environment template
│   ├── index.js          # Express app & Socket.IO server entrypoint
│   └── package.json
│
├── frontend/
│   └── vite-project/
│       ├── public/       # Static assets and icons
│       ├── src/
│       │   ├── axiosCalls/   # Configured Axios instance
│       │   ├── components/   # Reusable UI components
│       │   ├── context/      # Auth context provider
│       │   ├── pages/        # Route pages (Home, Login, SignUp, Profile, etc.)
│       │   ├── redux/        # Redux Toolkit slices and store
│       │   ├── socket.js     # Socket.IO client instance
│       │   ├── App.jsx       # Main application routing
│       │   └── main.jsx      # React root rendering
│       ├── .env.example      # Frontend environment template
│       ├── vercel.json       # SPA routing configuration
│       └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB installed locally or a free MongoDB Atlas connection string
- (Optional) Free Cloudinary account for media uploads

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure the following in `backend/.env`:
   ```env
   PORT=8084
   CLIENT_URL=https://end2-mern-projects.vercel.app
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   dbURL=mongodb://127.0.0.1:27017/social_media_app
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   Server will start at `http://localhost:8084`. Verify health check at `http://localhost:8084/health`.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/vite-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in `frontend/vite-project/`:
   ```env
   VITE_API_URL=https://end2-mern-project.onrender.com
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint |
| `POST` | `/users/register` | Register a new user |
| `POST` | `/users/login` | Login user and issue JWT cookie |
| `POST` | `/users/logout` | Logout user and clear cookie |
| `GET` | `/users/me` | Fetch authenticated user |
| `GET` | `/users/suggested` | Fetch suggested users to follow |
| `GET` | `/users/search` | Search users by name/username |
| `GET` | `/users/profile/:username` | Fetch user profile |
| `POST` | `/users/:id/follow` | Follow a user |
| `DELETE` | `/users/:id/follow` | Unfollow a user |
| `POST` | `/post/create` | Create a post with image upload |
| `GET` | `/post` | Fetch timeline feed posts |
| `DELETE` | `/post/:id` | Delete a post |
| `POST` | `/post/likes/:id` | Like / Unlike a post |
| `POST` | `/reel/createReel` | Upload a short-form video reel |
| `POST` | `/story/create` | Create a 24-hour story |
| `POST` | `/comment/create` | Add a comment to a post/reel |

---

## Deployment Configuration

- **Backend**: Deployed on Render (`https://end2-mern-project.onrender.com`)
- **Frontend**: Deployed on Vercel (`https://end2-mern-projects.vercel.app`) with SPA rewrite rules in `vercel.json`

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import dns from "node:dns";
import path from "node:path";
import { fileURLToPath } from "node:url";
import User from "./models/user.model.js";

import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import reelRoutes from "./routes/reel.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import storyRoutes from "./routes/story.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (_) {}

const app = express();

const server = http.createServer(app);

const port = process.env.PORT || 8084;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  },
});

// userId -> Set of socket IDs
const onlineUsers = new Map();

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";

    const cookies = cookie.parse(cookieHeader);

    const token = cookies.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("User not found"));
    }

    // Store verified identity on the socket
    socket.data.userId = user._id.toString();

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId;

  // Retrieve this user's existing socket connections
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  // Add this socket to the user's connections
  onlineUsers.get(userId).add(socket.id);

  console.log("User connected:", userId);
  console.log("Socket ID:", socket.id);

  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(userId);

    if (userSockets) {
      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
      }
    }

    console.log("User disconnected:", userId);
  });
});

if (process.env.dbURL) {
  mongoose.connect(process.env.dbURL)
    .then(() => {
      console.log("DB Connected successfully to MongoDB Atlas!");
    })
    .catch((err) => {
      console.log("MongoDB connection error:", err);
    });
} else {
  console.warn("Notice: dbURL is not defined in environment variables. Add dbURL in backend/.env to connect to MongoDB.");
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running"
  });
});

app.use("/users", userRoutes);
app.use("/post", postRoutes);
app.use("/reel", reelRoutes);
app.use("/comment", commentRoutes);
app.use('/story', storyRoutes);

app.use(errorMiddleware);

server.listen(port, "0.0.0.0", () => {
  console.log(`Server Started at ${port}`);
});

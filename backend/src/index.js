import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import { initializeSocket } from "./lib/socket.js";
import cron from "node-cron";
import fs from "fs";

import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import songRoutes from "./routes/songs.route.js";
import albumRoutes from "./routes/albums.route.js";
import statRoutes from "./routes/stats.route.js";
import { connectDB } from "./lib/db.js";
import { createServer } from "http";

dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 9000;

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json()); // to parse req.body
app.use(clerkMiddleware()); // add auth to req obj => req.auth
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPaths: true,
    limits: {
      fileSize: 10 * 1024, // 10MB maximum file size
    },
  })
);

//crons jobs (automated job)
//delete files in every single hour/minute/second or what ever
const tempDir = path.join(process.cwd(), "tmp");
// delete files in temp folder every hour
cron.schedule("0 * * * *", () => {
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.error(err);
        return;
      }
      for (const file of files) {
        fs.unlink(path.join(tempDir, file), (err) => {});
      }
    });
  }
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

//run only in production.
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}

//error handle
app.use((error, req, res, next) => {
  res.status(500).json({
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error",
  });
});

httpServer.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
});

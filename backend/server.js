import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import safeZoneRoutes from "./routes/safeZoneRoutes.js";
import waterLogRoutes from "./routes/waterLogRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS allow-list from the environment, comma-separated, e.g.
// CORS_ORIGINS=https://app.example.com,https://www.app.example.com
const DEV_CORS_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];

const getCorsOrigins = () => {
  const origins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  if (origins.includes("*")) {
    throw new Error("CORS_ORIGINS must list explicit origins; '*' is not allowed");
  }
  if (origins.length > 0) return origins;

  if (NODE_ENV === 'production') {
    // Fail closed: no cross-origin access until origins are configured
    console.warn("CORS_ORIGINS is not set; all cross-origin requests will be rejected");
    return [];
  }
  // Development: allow the local Vite frontend
  return DEV_CORS_ORIGINS;
};

// Security headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, etc.)
app.use(helmet());
// Auth uses the Authorization header, not cookies, so credentials are not enabled
app.use(cors({ origin: getCorsOrigins() }));
// Explicit body-size cap; all request bodies are small JSON forms (no file uploads)
app.use(express.json({ limit: "10kb" }));

// Auth routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is healthy" });
});

// Report routes
app.use("/api/reports", reportRoutes);

// Task routes
app.use("/api/tasks", taskRoutes);

// Safe Zone routes
app.use("/api/safe-zones", safeZoneRoutes);

// Water Log routes
app.use("/api/logs", waterLogRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connection established Successfully");

    app.listen(PORT, () => {
      console.log("Server is running on port " + PORT);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

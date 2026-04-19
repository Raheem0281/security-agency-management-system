// server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import cors from "cors";

// 1️⃣ Load environment variables
dotenv.config();

// 2️⃣ Connect to MongoDB
connectDB();

// 3️⃣ Initialize Express app
const app = express();

// 4️⃣ Middleware
app.use(express.json());       // JSON body parser
app.use(cors());               // Allow cross-origin requests

// 5️⃣ Routes
app.use("/api/auth", authRoutes);  // Auth routes

// 6️⃣ Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// 7️⃣ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
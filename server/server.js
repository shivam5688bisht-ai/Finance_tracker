import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import budgetRoutes from "./routes/budgets.js";
import categoryRoutes from "./routes/categories.js";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Missing MONGO_URI or JWT_SECRET in server/.env");
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API running on port ${PORT}`)))
  .catch((err) => { console.error("MongoDB connection failed:", err.message); process.exit(1); });

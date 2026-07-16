import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

process.on("unhandledRejection", (reason, promise) => {
  console.error("🔴 Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("🔴 Uncaught Exception:", error);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
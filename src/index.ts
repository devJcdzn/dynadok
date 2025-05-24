import express from "express";
import { clientRoutes } from "./interfaces/routes/clientRoutes";
import { connectToDatabase } from "./infra/db/mongodb/connection";
import { config } from "dotenv";

config();

const app = express();

app.use(express.json());
app.use(clientRoutes);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/clients";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

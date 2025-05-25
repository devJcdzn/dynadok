import express from "express";
import { clientRoutes } from "./interfaces/routes/clientRoutes";
import { connectToDatabase } from "./infra/db/mongodb/connection";
import { config } from "dotenv";
import { ClientEventsConsumer } from "./infra/messaging/consumers/clientEventsConsumer";
import { EventBus } from "./infra/messaging/eventBus";
import { errorHandler } from "./shared/middlewares/errorHandler";

config();

const app = express();

app.use(express.json());
app.use(clientRoutes);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    errorHandler(err, req, res, next);
  }
);

const PORT = process.env.PORT || 3000;

const eventBus = new EventBus();

async function startServer() {
  try {
    await connectToDatabase();

    const consumer = new ClientEventsConsumer(eventBus);
    await consumer.start();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

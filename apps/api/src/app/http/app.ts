import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import router from "../../routes";

// Infrastructure composition (HTTP).
export function createHttpApp(): Express {
  const app: Express = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use("/api", router);

  return app;
}


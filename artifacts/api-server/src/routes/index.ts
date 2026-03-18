import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import scansRouter from "./scans";
import analysisRouter from "./analysis";
import statsRouter from "./stats";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/scans", scansRouter);
router.use("/analysis", analysisRouter);
router.use("/stats", statsRouter);
router.use("/notifications", notificationsRouter);

export default router;

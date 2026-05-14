import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import scansRouter from "./scans";
import analysisRouter from "./analysis";
import statsRouter from "./stats";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import doctorNotesRouter from "./doctor-notes";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
// Alias to match requested casing: /api/Auth/*
router.use("/Auth", authRouter);
router.use("/users", usersRouter);
router.use("/scans", scansRouter);
router.use("/analysis", analysisRouter);
router.use("/stats", statsRouter);
router.use("/notifications", notificationsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/doctor-notes", doctorNotesRouter);
router.use("/chat", chatRouter);

export default router;

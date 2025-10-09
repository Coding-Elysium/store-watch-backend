import express from "express";
import { getActivityLogs } from "../controllers/activitylog.controllers.js";
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/read", protectedRoute, getActivityLogs);

export default router;

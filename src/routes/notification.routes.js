import express from "express";
import { getNotifications } from "../controllers/notification.controllers.js";
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/read", protectedRoute, getNotifications);

export default router;

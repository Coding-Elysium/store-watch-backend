import express from "express";
import protectedRoute from "../middleware/protectedRoute.js";
import {
  addSchedule,
  getSchedulesByDate,
} from "../controllers/schedule.controllers.js";

const router = express.Router();

router.post("/add/:storeId", protectedRoute, addSchedule);
router.get("/read", protectedRoute, getSchedulesByDate);

export default router;

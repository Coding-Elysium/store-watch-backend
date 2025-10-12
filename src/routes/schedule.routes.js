import express from "express";
import protectedRoute from "../middleware/protectedRoute.js";
import {
  addSchedule,
  deleteScheduleUser,
  getSchedulesByDate,
  takeOverSchedule,
  updateScheduleUser,
} from "../controllers/schedule.controllers.js";

const router = express.Router();

router.post("/add/:storeId", protectedRoute, addSchedule);
router.get("/read", protectedRoute, getSchedulesByDate);
router.patch("/update/:scheduleId", protectedRoute, updateScheduleUser);
router.delete("/delete/:scheduleId", protectedRoute, deleteScheduleUser);
router.post("/takeover/:scheduleId", protectedRoute, takeOverSchedule);

export default router;

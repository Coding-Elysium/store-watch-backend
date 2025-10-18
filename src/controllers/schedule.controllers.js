import { paginate } from "../lib/paginate.js";
import ActivityLog from "../model/activitylog.model.js";
import Schedule from "../model/schedule.model.js";
import moment from "moment";

export const addSchedule = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { users, days } = req.body;

    if (!storeId || !days?.length || !users?.length) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const schedules = [];

    for (const userId of users) {
      const schedule = new Schedule({
        store: storeId,
        user: userId,
        days,
      });
      await schedule.save();
      schedules.push(schedule);
    }

    const { id } = req.user;

    await ActivityLog.create({
      actor: id,
      activity: "Created Schedule",
      description: `You have created new schedules for multiple users`,
    });

    res.status(200).json({
      message: "Schedules added successfully",
      schedules,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getSchedulesByDate = async (req, res) => {
  try {
    const { date, page = 1, limit = 10 } = req.query;

    const inputDate = new Date(date);
    if (!date || isNaN(inputDate)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing date parameter" });
    }

    const weekday = moment(date, "YYYY-MM-DD").format("dddd").toLowerCase();
    const startOfDay = moment(inputDate).startOf("day").toDate();
    const endOfDay = moment(inputDate).endOf("day").toDate();

    const today = new Date();
    const isToday = moment(today).isSame(moment(inputDate), "day");

    const query = {
      days: weekday,
      startDate: { $lte: endOfDay },
      $or: [{ endDate: null }, { endDate: { $gte: startOfDay } }],
    };

    if (isToday) {
      query.isActive = false;
    }

    // 🧩 Use your paginate utility instead of find()
    const {
      data: schedules,
      total,
      totalPages,
      currentPage,
    } = await paginate(Schedule, {
      filter: query,
      page,
      limit,
      sort: { createdAt: -1 },
      select: "",
    });

    // 🧠 Transform schedules
    const result = await Promise.all(
      schedules.map(async (sched) => {
        await sched.populate([
          { path: "user", select: "name role profilePicture" },
          { path: "takenOverBy", select: "name role profilePicture" },
          { path: "store", select: "name storeImage" },
        ]);

        const takenOverStart = sched.takenOverStart
          ? new Date(sched.takenOverStart)
          : null;
        const takenOverUntil = sched.takenOverUntil
          ? new Date(sched.takenOverUntil)
          : null;

        const isTakenOverActive =
          sched.takenOverBy &&
          takenOverStart &&
          takenOverUntil &&
          endOfDay >= takenOverStart &&
          startOfDay <= takenOverUntil;

        const obj = sched.toObject();

        if (!isTakenOverActive) {
          obj.takenOverBy = null;
          obj.takenOverStart = null;
          obj.takenOverUntil = null;
          obj.activeUser = obj.user;
        } else {
          obj.activeUser = obj.takenOverBy;
        }

        return obj;
      })
    );

    res.status(200).json({
      message: "Schedules fetched successfully",
      day: weekday,
      total,
      totalPages,
      currentPage,
      schedules: result,
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateScheduleUser = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { days } = req.body;
    const { id } = req.user;

    if (!scheduleId || !days?.length) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingSchedule = await Schedule.findById(scheduleId);
    if (!existingSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    existingSchedule.endDate = new Date();
    await existingSchedule.save();

    const newSchedule = await Schedule.create({
      user: existingSchedule.user,
      days,
      startDate: new Date(),
      endDate: null,
    });

    await ActivityLog.create({
      actor: id,
      activity: "Updated Schedule",
      description: `You have updated schedule for user ${existingSchedule.user}`,
    });

    res.status(200).json({
      message: "Schedule updated successfully",
      result: newSchedule,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteScheduleUser = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    if (!scheduleId) {
      return res.status(400).json({ message: "ScheduleID is required" });
    }

    const scheduleData = await Schedule.findById(scheduleId);
    if (!scheduleData) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { $set: { endDate: Date.now() } },
      { new: true }
    );

    const result = await schedule.save();

    const { id } = req.user;
    await ActivityLog.create({
      actor: id,
      activity: "Deleted Schedule",
      description: `You have deleted schedule for user ${scheduleData.users}`,
    });

    res.status(200).json({
      message: "Schedule deleted successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const takeOverSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { takenOverBy, takenOverStart, takenOverUntil } = req.body;

    if (!takenOverBy || !takenOverStart || !takenOverUntil) {
      return res.status(400).json({
        message: "takenOverBy, takenOverStart, and takenOverUntil are required",
      });
    }

    if (new Date(takenOverStart) >= new Date(takenOverUntil)) {
      return res
        .status(400)
        .json({ message: "takenOverStart must be before takenOverUntil" });
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    schedule.takenOverBy = takenOverBy;
    schedule.takenOverStart = new Date(takenOverStart);
    schedule.takenOverUntil = new Date(takenOverUntil);

    await schedule.save();

    const updated = await Schedule.findById(scheduleId)
      .populate("user", "name role profilePicture")
      .populate("takenOverBy", "name role profilePicture")
      .populate("store", "name storeImage");

    res.status(200).json({
      message: "Schedule takeover successfully applied",
      schedule: updated,
    });
  } catch (error) {
    console.error("Error in takeOverSchedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
    const { date } = req.query;

    const inputDate = new Date(date);
    if (!date || isNaN(inputDate)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing date parameter" });
    }

    const weekday = moment(date, "YYYY-MM-DD").format("dddd").toLowerCase();

    const schedules = await Schedule.find({
      days: weekday,
      startDate: { $lte: inputDate },
      $or: [{ endDate: null }, { endDate: { $gte: inputDate } }],
    })
      .populate("user", "name role profilePicture")
      .populate("takenOverBy", "name role profilePicture")
      .populate("store", "name storeImage");

    // Filter takeover visibility dynamically
    const result = schedules.map((sched) => {
      const isTakenOverActive =
        sched.takenOverBy &&
        sched.takenOverStart &&
        sched.takenOverUntil &&
        inputDate >= sched.takenOverStart &&
        inputDate <= sched.takenOverUntil;

      return {
        ...sched.toObject(),
        activeUser: isTakenOverActive ? sched.takenOverBy : sched.user,
      };
    });

    res.status(200).json({
      message: "Schedules fetched",
      day: weekday,
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

    if (!scheduleId || !days?.length) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { $set: { days, endDate: Date.now() } },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const { id } = req.user;
    await ActivityLog.create({
      actor: id,
      activity: "Updated Schedule",
      description: `You have updated schedule for user ${schedule.user}`,
    });

    res.status(200).json({
      message: "Schedule updated successfully",
      result: schedule,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteScheduleUser = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    if (!scheduleId) {
      return res.status(400).json({ message: "Schedule ID is required" });
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

import ActivityLog from "../model/activitylog.model.js";
import Schedule from "../model/schedule.model.js";
import moment from "moment";

export const addSchedule = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { users, days } = req.body;

    if (
      !storeId ||
      !days ||
      !users ||
      days.length === 0 ||
      users.length === 0
    ) {
      return res.status(400).json({ message: "All Fields are required" });
    }

    const schedule = new Schedule({
      store: storeId,
      users,
      days,
    });

    await schedule.save();

    const { id } = req.user;

    await ActivityLog.create({
      actor: id,
      activity: "Created Schedule",
      description: `You have created a new schedule`,
    });

    res.status(200).json({ message: "Schedule added successfully", schedule });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getSchedulesByDate = async (req, res) => {
  try {
    const { date } = req.query;

    // ✅ Validate and parse date
    const inputDate = new Date(date);
    if (!date || isNaN(inputDate)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing date parameter" });
    }

    // ✅ Convert to weekday name (e.g. Monday)
    const weekday = moment(date, "YYYY-MM-DD").format("dddd");

    // ✅ Find all schedules where:
    // - The weekday matches
    // - The schedule has started
    // - The schedule has no end date or hasn't ended yet
    const schedules = await Schedule.find({
      days: "monday",
      startDate: { $lte: inputDate },
      $or: [{ endDate: null }, { endDate: { $gte: inputDate } }],
    })
      .populate("users.user", "name role profilePicture")
      .populate("store", "name storeImage");

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

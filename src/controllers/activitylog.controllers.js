import { paginate } from "../lib/paginate.js";
import ActivityLog from "../model/activitylog.model.js";

export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { id } = req.user;

    const result = await paginate(ActivityLog, {
      filter: { _id: id },
      page,
      limit,
      sort: { createdAt: -1 },
    });

    res.status(200).json({
      message: "Activity logs fetched successfully",
      data: result,
    });
  } catch (error) {
    console.log("Error in getActivityLogs controller:", error);
    res
      .status(500)
      .json({ message: "Error fetching activity logs", error: error.message });
  }
};

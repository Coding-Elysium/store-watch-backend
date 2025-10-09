import { paginate } from "../lib/paginate.js";
import Notification from "../model/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { id } = req.user;

    const result = await paginate(Notification, {
      filter: { _id: id },
      page,
      limit,
      sort: { createdAt: -1 },
    });

    res.status(200).json({ message: "Notifications fetched", data: result });
  } catch (error) {
    console.log("Error in getNotifications controller:", error);
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: error.message });
  }
};

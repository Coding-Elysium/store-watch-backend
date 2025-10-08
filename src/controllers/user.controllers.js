import { paginate } from "../lib/paginate.js";
import ActivityLog from "../model/activitylog.mode.js";
import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";
import bcrypt from "bcrypt";

export const addUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, role } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    if(password.length < 6){
      return res.status(400).json({ message: "Password must be 6 characters and above" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    const { id, role: roles } = req.user;

    await ActivityLog.create({
      actor: id,
      activity: "Created User",
      description: `You have created a new user`
    });

    const findAllAdmin = await User.find({role: "admin"});

    //!TODO DONT NOTIF TO THE REQ.USER

    const notificationsData =  findAllAdmin.map((admin) => ({
      recipient: id,
      heading: "New User Added",
      isRead: false,
      message: `Submitted a user`,
      type: "add",
      title: "Added New User",
    }));

    await Notification.insertMany(notificationsData);

    const data = await newUser.save();

    res.status(200).json({ message: "Successfully added a user", data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getUsers = async(req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const { id } = req.user;

    const filter = {}

    if(role){
      filter.role = role;
    }

    filter._id = { $ne: id };

    const result = await paginate(User, {
      filter,
      page,
      limit,
      select: "-password",
    });

    res.status(200).json({
      message: "Successfully fetched users",
      ...result
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

export const getUsersById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById({ _id: id }).select("-password");

    res.status(200).json({ message: "Successfully fetch data", data: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try { 
    const { id } = req.params;
 
    const { ...otherUpdates } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedFields = ["firstName", "lastName", "email", "role"];
    const requestFields = Object.keys(otherUpdates);

    const invalidFields = requestFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid update field(s): ${invalidFields.join(", ")}`,
      });
    }

    const updates = {};

    allowedFields.forEach((field) => {
      if (otherUpdates[field] !== undefined) {
        updates[field] = otherUpdates[field];
      }
    });

    Object.assign(user, updates);
    await user.save();

    const { id: currentUserId } = req.user;

    await ActivityLog.create({
      actor: currentUserId,
      activity: "Updated User",
      description: "Successfully Updated a User",
      // description: password ? `Updated user ${user.email} and changed password` : `Updated user ${user.email}`,
    });

    res.status(200).json({ message: "Successfully updated data", data: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isDeleted) {
      return res.status(400).json({ message: "User already deleted" });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    const { id: actorId } = req.user;

    await ActivityLog.create({
      actor: actorId,
      activity: "Deleted User",
      description: `Soft deleted user ${user.email}`,
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

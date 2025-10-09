import { paginate } from "../lib/paginate.js";
import ActivityLog from "../model/activitylog.mode.js";
import Notification from "../model/notification.model.js";
import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/email.js";
import cloudinary from "../config/cloudinary.js";

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

    let profilePicture = null;
    let profilePublicId = null;

    if (req.file) {
      profilePicture = req.file.path;
      profilePublicId = req.file.filename || req.file.public_id || null;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      profilePicture,
      profilePublicId
    });

    const { id } = req.user;

    await ActivityLog.create({
      actor: id,
      activity: "Created User",
      description: `You have created a new user`
    });

    const findAllAdmin = await User.find({role: "admin"});

    const notificationsData = findAllAdmin
      .filter((admin) => admin._id.toString() !== id.toString())
      .map((admin) => ({
        recipient: admin._id,
        heading: "New User Added",
        isRead: false,
        message: `${req.user.firstName} ${req.user.lastName} has added a new user (${firstName} ${lastName}).`,
        type: "add",
        title: "Added New User",
      }));

    if (notificationsData.length > 0) {
      await Notification.insertMany(notificationsData);
    }

    await sendEmail({
      to: email,
      subject: "Welcome to the System",
      html: `
        <h3>Welcome, ${firstName}!</h3>
        <p>Your account has been successfully created.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Role:</strong> ${role}</p>
        <br/>
        <p>Thank you for joining us.</p>
      `,
    });

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

    if(role){
      filter.role = role;
    }

    const filter = {
      _id: { $ne: id },
      isDeleted: false, 
    };

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
    const { removeProfilePicture, ...otherUpdates } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedFields = ["profilePicture", "firstName", "lastName", "email", "role"];
    const requestFields = Object.keys(otherUpdates);

    const invalidFields = requestFields.filter((field) => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid update field(s): ${invalidFields.join(", ")}`,
      });
    }

    if (removeProfilePicture === "true" || removeProfilePicture === true) {
      if (user.profilePublicId) {
        try {
          await cloudinary.uploader.destroy(user.profilePublicId);
        } catch (error) {
          console.warn("Failed to delete old profile picture:", error.message);
        }
      }

      user.profilePicture = null;
      user.profilePublicId = null;
    }

    if (req.file) {
      if (user.profilePublicId) {
        try {
          await cloudinary.uploader.destroy(user.profilePublicId);
        } catch (error) {
          console.warn("Failed to delete old profile picture:", error.message);
        }
      }
  
      user.profilePicture = req.file.path; 
      user.profilePublicId = req.file.filename || req.file.public_id || null;
    }

    allowedFields.forEach((field) => {
      if (otherUpdates[field] !== undefined && field !== "profilePicture") {
        user[field] = otherUpdates[field];
      }
    });

    await user.save();

    const { id: currentUserId } = req.user;
    await ActivityLog.create({
      actor: currentUserId,
      activity: "Updated User",
      description: `Updated user (${user.firstName} ${user.lastName})`,
    });

    res.status(200).json({
      message: "Successfully updated user data",
      data: user,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

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


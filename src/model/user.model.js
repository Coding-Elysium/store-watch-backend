import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  profilePicture: {
    type: String,
  },
  profilePublicId: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "promodiser", "agent", "coordinator"],
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true, });

const User = mongoose.model("User", userSchema);
export default User;

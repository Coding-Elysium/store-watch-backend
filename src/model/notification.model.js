import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true,
    },
    heading: {
        type: String,
        required: true,
        trim: true,
    },
    isRead: {
        type: Boolean,
        required: true
    },
    message: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
    }
  },
  {
    timestamps: true, 
  }
);

const Notification = mongoose.model("Notifications", notificationSchema);
export default Notification;

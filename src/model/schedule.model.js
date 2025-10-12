import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    days: {
      type: [String],
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;

import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    takenOverBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    takenOverStart: {
      type: Date,
      default: null,
    },
    takenOverUntil: {
      type: Date,
      default: null,
    },
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

scheduleSchema.pre("save", function (next) {
  if (this.endDate && this.isActive) {
    this.isActive = false;
  }
  next();
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;

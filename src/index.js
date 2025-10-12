import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productRoute from "./routes/product.routes.js";
import categoryRoute from "./routes/category.routes.js";
import activityLogRoute from "./routes/activitylog.routes.js";
import notificationRoute from "./routes/notification.routes.js";
import scheduleRoute from "./routes/schedule.routes.js";
import storeRoute from "./routes/store.routes.js";
import connectDB from "./lib/db.js";
import cookieParser from "cookie-parser";
import { seedAdmin } from "./lib/seedAdmin.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/store", storeRoute);
app.use("/api/activity-logs", activityLogRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/schedule", scheduleRoute);

app.listen(PORT, async () => {
  await connectDB();
  await seedAdmin();
  console.log(`Server is running on port ${PORT}`);
});

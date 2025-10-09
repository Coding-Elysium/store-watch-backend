import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productRoute from "./routes/product.routes.js";
import categoryRoute from "./routes/category.routes.js";
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
app.use("/api/category", categoryRoute)

app.listen(PORT, async() => {
  await connectDB();
  await seedAdmin();
  console.log(`Server is running on port ${PORT}`);
});

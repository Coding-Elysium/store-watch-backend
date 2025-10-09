import bcrypt from "bcrypt";
import User from "../model/user.model.js";

export const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });

    if (!existingAdmin) {
      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
      }

      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await User.create({
        firstName: "System",
        lastName: "Administrator",
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      });

      console.log(
        `✅ Default admin account created (email: ${process.env.ADMIN_EMAIL})`
      );
    } else {
      console.log("ℹ️ Admin account already exists");
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error.message);
  }
};

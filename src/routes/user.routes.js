import express from "express";
import { addUser, deleteUser, getUsers, getUsersById, updateUser } from "../controllers/user.controllers.js";
import protectedRoute from "../middleware/protectedRoute.js";
import createUpload from "../middleware/upload.js";

const router = express.Router();

const uploadUser = createUpload("users")
router.post("/add", uploadUser.single("profilePicture"), protectedRoute, addUser);
router.get("/read", protectedRoute, getUsers);
router.get("/read/:id", protectedRoute, getUsersById);
router.patch("/update/:id", uploadUser.single("profilePicture"), protectedRoute, updateUser);
router.delete("/delete/:id", protectedRoute, deleteUser);

export default router;

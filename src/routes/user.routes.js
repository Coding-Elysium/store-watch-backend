import express from "express";
import { addUser, deleteUser, getUsers, getUsersById, updateUser } from "../controllers/user.controllers.js";
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/add", protectedRoute, addUser);
router.get("/read", protectedRoute, getUsers);
router.get("/read/:id", protectedRoute, getUsersById);
router.patch("/update/:id", protectedRoute, updateUser);
router.delete("/delete/:id", protectedRoute, deleteUser);

export default router;

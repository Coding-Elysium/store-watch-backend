import express from "express";
import { addCategory, deleteCategory, readCategory, updateCategory } from "../controllers/category.controllers.js";
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/add", protectedRoute, addCategory);
router.get("/read", protectedRoute, readCategory);
router.patch("/update/:id", protectedRoute, updateCategory);
router.delete("/delete/:id", protectedRoute, deleteCategory);

export default router;

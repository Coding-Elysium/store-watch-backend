import express from "express";
import { checkAuth, login, logout } from "../controllers/auth.controllers.js";
import protectedRoute from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/login", login);
router.get("/logout", logout);
router.get("/check", protectedRoute, checkAuth);

export default router;

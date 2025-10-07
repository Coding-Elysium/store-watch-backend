import express from "express";
import { addUser } from "../controllers/user.controllers.js";

const router = express.Router();

router.post("/add", addUser);

export default router;

import express from "express";
import { addStore } from "../controllers/store.controllers";

const router = express.Router();

router.post("/add", addStore);

export default router;

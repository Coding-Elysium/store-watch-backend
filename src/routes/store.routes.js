import express from "express";
import {
  addStore,
  deleteStore,
  readStores,
  updateStore,
} from "../controllers/store.controllers.js";
import protectedRoute from "../middleware/protectedRoute.js";
import createUpload from "../middleware/upload.js";

const router = express.Router();

const upload = createUpload("stores");
router.post("/add", protectedRoute, upload.single("storeImage"), addStore);
router.get("/read", protectedRoute, readStores);
router.patch(
  "/update/:id",
  protectedRoute,
  upload.single("storeImage"),
  updateStore
);
router.delete("/delete/:id", protectedRoute, deleteStore);

export default router;

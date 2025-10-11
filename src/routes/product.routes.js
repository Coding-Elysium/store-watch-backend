import express from "express";
import {
  addProduct,
  deleteProduct,
  readProducts,
  updateProducts,
} from "../controllers/product.controllers.js";
import protectedRoute from "../middleware/protectedRoute.js";
import createUpload from "../middleware/upload.js";

const router = express.Router();

const uploadUser = createUpload("products");
router.post(
  "/add",
  protectedRoute,
  uploadUser.single("productImage"),
  addProduct
);
router.get("/read", protectedRoute, readProducts);
router.patch(
  "/update/:id",
  protectedRoute,
  uploadUser.single("productImage"),
  updateProducts
);
router.delete("/delete/:id", protectedRoute, deleteProduct);

export default router;

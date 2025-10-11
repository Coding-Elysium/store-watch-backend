import ActivityLog from "../model/activitylog.model.js";
import Product from "../model/product.model.js";
import { paginate } from "../lib/paginate.js";
import cloudinary from "../config/cloudinary.js";

export const addProduct = async (req, res) => {
  try {
    const { productName, skuCode, category, unit, quantityPerBox } = req.body;

    if (!productName || !skuCode || !category || !unit || !quantityPerBox) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    if (skuCode.length < 6) {
      return res.status(400).json({
        success: false,
        message: "SKU code must be at least 6 characters.",
      });
    }

    const existingSku = await Product.findOne({ skuCode });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: "SKU code must be unique.",
      });
    }

    let productImage = null;
    let productPublicId = null;

    if (req.file) {
      productImage = req.file.path;
      productPublicId = req.file.filename || req.file.public_id || null;
    }

    const newProduct = new Product({
      productImage,
      productName,
      skuCode,
      category,
      unit,
      quantityPerBox,
      productPublicId,
    });

    const result = await newProduct.save();

    const { id } = req.user;

    await ActivityLog.create({
      actor: id,
      activity: "Created Product",
      description: `You have created a new product`,
    });

    res.status(200).json({ message: "Successfully added a product", result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const readProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await paginate(Product, {
      filter: { isDeleted: false },
      page,
      limit,
      select: ["-__v", "-productPublicId"],
    });

    res
      .status(200)
      .json({ message: "Successfully read all products", ...result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updateProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { removeProductImage, ...otherUpdates } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const allowedFields = [
      "productName",
      "skuCode",
      "category",
      "unit",
      "quantityPerBox",
    ];

    const requestFields = Object.keys(otherUpdates);

    const invalidFields = requestFields.filter(
      (field) => !allowedFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid update field(s): ${invalidFields.join(", ")}`,
      });
    }

    if (removeProductImage === "true" || removeProductImage === true) {
      if (product.productPublicId) {
        try {
          await cloudinary.uploader.destroy(product.productPublicId);
        } catch (error) {
          console.warn("Failed to delete old product picture:", error.message);
        }
      }
      product.productImage = null;
      product.productPublicId = null;
    }

    if (req.file) {
      if (product.productPublicId) {
        try {
          await cloudinary.uploader.destroy(product.productPublicId);
        } catch (error) {
          console.warn("Failed to delete old product picture:", error.message);
        }
      }

      product.productImage = req.file.path;
      product.productPublicId = req.file.filename || req.file.public_id || null;
    }

    allowedFields.forEach((field) => {
      if (otherUpdates[field] !== undefined && field !== "productImage") {
        product[field] = otherUpdates[field];
      }
    });

    await product.save();

    const { id: currentUserId } = req.user;

    await ActivityLog.create({
      actor: currentUserId,
      activity: "Updated Product",
      description: `You just updated a product`,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const result = await product.save();

    const { id: currentUserId } = req.user;

    await ActivityLog.create({
      actor: currentUserId,
      activity: "Deleted Product",
      description: `You just deleted a product`,
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

import cloudinary from "../config/cloudinary.js";
import { paginate } from "../lib/paginate.js";
import ActivityLog from "../model/activitylog.model.js";
import Store from "../model/store.model.js";

export const addStore = async (req, res) => {
  try {
    const {
      name,
      location,
      contactPerson,
      mobileNumber,
      radius,
      code,
      products,
    } = req.body;

    if (
      !name ||
      !location ||
      !contactPerson ||
      !mobileNumber ||
      !radius ||
      !code
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    if (products && !Array.isArray(products)) {
      return res
        .status(400)
        .json({ message: "Product field must be an array." });
    }

    let storeImage = null;
    let storePublicId = null;

    if (req.file) {
      storeImage = req.file.path;
      storePublicId = req.file.filename || req.file.public_id || null;
    }

    const newStore = await Store.create({
      storeImage,
      storePublicId,
      name,
      location,
      contactPerson,
      mobileNumber,
      radius,
      code,
      products: products || [],
    });

    const { id } = req.user;

    await ActivityLog.create({
      actor: id,
      activity: "Created Store",
      description: `You have created a new store: ${name}`,
    });

    res.status(200).json({
      success: true,
      message: "Store created successfully",
      data: newStore,
    });
  } catch (error) {
    console.error("Error in addStore controller:", error);
    res.status(500).json({
      success: false,
      message: "Error adding store",
      error: error.message,
    });
  }
};

export const readStores = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await paginate(Store, {
      filter: { isDeleted: false },
      page,
      limit,
      select: ["-__v", "-storePublicId"],
    });

    res.status(200).json({
      success: true,
      message: "Stores retrieved successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error in getStores controller:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving stores",
      error: error.message,
    });
  }
};

export const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { removeStoreImage, ...otherUpdates } = req.body;

    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const allowedFields = [
      "name",
      "location",
      "contactPerson",
      "mobileNumber",
      "radius",
      "code",
      "products",
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

    if (removeStoreImage === "true" || removeStoreImage === true) {
      if (store.storePublicId) {
        try {
          await cloudinary.uploader.destroy(store.storePublicId);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }

      store.storeImage = null;
      store.storePublicId = null;
    }

    if (req.file) {
      if (store.storePublicId) {
        try {
          await cloudinary.uploader.destroy(store.storePublicId);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }

      store.storeImage = req.file.path;
      store.storePublicId = req.file.filename || req.file.public_id || null;
    }

    allowedFields.forEach((field) => {
      if (otherUpdates[field] !== undefined && field !== "storeImage") {
        store[field] = otherUpdates[field];
      }
    });

    const { id: currentUserId } = req.user;

    await store.save();

    await ActivityLog.create({
      actor: currentUserId,
      activity: "Updated Store",
      description: `You just updated a store: ${store.name}`,
    });

    res.status(200).json({
      success: true,
      message: "Store updated successfully",
      data: store,
    });
  } catch (error) {
    console.error("Error in updateStore controller:", error);
    res.status(500).json({
      success: false,
      message: "Error updating store",
      error: error.message,
    });
  }
};

export const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    await store.save();

    const { id: currentUserId } = req.user;

    await ActivityLog.create({
      actor: currentUserId,
      activity: "Deleted Store",
      description: `You just deleted a store: ${store.name}`,
    });

    res.status(200).json({
      success: true,
      message: "Store deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteStore controller:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting store",
      error: error.message,
    });
  }
};

import Store from "../model/store.model.js";

export const addStore = async (req, res) => {
  try {
    const { name, location, contactPerson, mobileNumber, radius, code, products } = req.body;

    if (!name || !location || !contactPerson || !mobileNumber || !radius || !code) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (products && !Array.isArray(products)) {
      return res.status(400).json({ message: "Product field must be an array." });
    }

    const newStore = await Store.create({
      name,
      location,
      contactPerson,
      mobileNumber,
      radius,
      code,
      products: products || [], 
    });

    res.status(200).json({
      success: true,
      message: "Store created successfully",
      data: newStore
    });

  } catch (error) {
    console.error("Error in addStore controller:", error);
    res.status(500).json({
      success: false,
      message: "Error adding store",
      error: error.message
    });
  }
};

import Product from "../model/product.model.js";

export const addProduct = async (req, res) => {
    try {
        const { productName } = req.body;

        const newProduct = new Product({
            productName,
        })

        const result = await newProduct.save();

     res.status(200).json({ message: "Successfully added a product", result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
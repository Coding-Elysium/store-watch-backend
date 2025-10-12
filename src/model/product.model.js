import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    productImage: {
      type: String,
      required: true,
    },
    productPublicId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    skuCode: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    quantityPerBox: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;

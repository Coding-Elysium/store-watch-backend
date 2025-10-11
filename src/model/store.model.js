import mongoose from "mongoose";

const storeSchema = mongoose.Schema(
  {
    storeImage: {
      type: String,
      default: null,
    },
    storePublicId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    radius: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Store = mongoose.model("Store", storeSchema);
export default Store;

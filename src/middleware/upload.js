import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const createUpload = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      // const userId = req.user ? req.user.id : "unknown_user";

      return {
        folder: `${folderName}`,
        allowed_formats: ["jpg", "jpeg", "png", "pdf"],
        public_id: `${Date.now()}_${file.originalname.split(".")[0]}`,
      };
    },
  });

  return multer({ storage });
};

export default createUpload;

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfigure");

const newStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Mbox_Movies_images",
    allowFormats: ["jpeg", "png", "jpg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const uploadImage = multer({ storage: newStorage });
module.exports = uploadImage;
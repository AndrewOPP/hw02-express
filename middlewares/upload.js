import multer from "multer";
import path from "path";
import HttpError from "../helpers/httpError.js";

const destination = path.resolve("temp");

const storage = multer.diskStorage({
  destination,
  filename: (req, file, callback) => {
    const uniquePreffix = `${Date.now()}_${Math.round(Math.random() * 159)}`;
    const filename = `${uniquePreffix}_${file.originalname}`;
    callback(null, filename);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const fileFilter = (req, file, callback) => {
  const extention = req.originalname.split(".").pop();
  if (extention === "exe") {
    callback(HttpError(400, ".exe non valid extention"));
  }
};

const upload = multer({
  storage,
  limits,
});

export default upload;

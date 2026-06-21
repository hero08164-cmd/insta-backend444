import multer from "multer";

import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES
} from "../constants/upload.constants.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        `Unsupported file type: ${file.mimetype}`
      ),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  }
});

export default upload;
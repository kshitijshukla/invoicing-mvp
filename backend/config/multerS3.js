import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "./s3.js";
import path from "path";

const useS3 = !!process.env.AWS_BUCKET_NAME;

let storage;
if (useS3) {
  // S3 storage (when AWS env is configured)
  storage = multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => cb(null, `branding/${Date.now()}_${file.originalname}`),
  });
} else {
  // Local disk storage fallback for dev
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.resolve("./invoices")),
    filename: (_req, file, cb) => cb(null, `branding_${Date.now()}_${file.originalname}`),
  });
}

export const uploadLogo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only PNG/JPG/WebP allowed"), ok);
  }
});

import express from "express";
import * as userCtrl from "../controllers/userController.js";
import { uploadLogo } from "../config/multerS3.js";

const router = express.Router();

router.get("/profile", userCtrl.getProfile);
router.put("/profile", userCtrl.updateProfile);
router.post("/logo", uploadLogo.single("logo"), userCtrl.uploadLogoHandler);

export default router;

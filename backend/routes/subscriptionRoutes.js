import express from "express";
import { createSubscription, verifyPayment, listSubscriptions } from "../controllers/subscriptionController.js";
const router = express.Router();
router.post("/create", createSubscription);
router.post("/verify", verifyPayment);
router.get("/list", listSubscriptions);
export default router;

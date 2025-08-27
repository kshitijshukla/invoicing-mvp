import express from "express";
import { createInvoice, getInvoices, sendInvoiceWhatsApp } from "../controllers/invoiceController.js";
const router = express.Router();
router.post("/create", createInvoice);
router.get("/list", getInvoices);
router.post("/share", sendInvoiceWhatsApp);
export default router;

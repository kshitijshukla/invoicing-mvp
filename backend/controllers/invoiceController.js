import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import { uploadFile } from "../utils/uploadToS3.js";
import { drawBrandedHeader } from "../utils/pdfBranding.js";
import twilio from "twilio";

export const createInvoice = async (req, res) => {
  try {
    const { userId, customerName, items } = req.body;
    const user = await User.findById(userId).lean();

    const totalAmount = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const gstCollected = items.reduce((sum, i) => sum + ((i.price * i.quantity * i.gstRate) / 100), 0);

    const invoice = await Invoice.create({
      userId, customerName, items, totalAmount, gstCollected,
    });

    const pdfPath = `./invoices/invoice_${invoice._id}.pdf`;
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    await drawBrandedHeader(doc, {
      logoUrl: user?.logoUrl,
      businessName: user?.businessName,
      gstNumber: user?.gstNumber,
      address: user?.address,
      brandColor: user?.brandColor,
    });

    doc.moveDown().fontSize(20).text("TAX INVOICE", { align: "right" });
    doc.fontSize(10).text(`Invoice No: INV-${invoice._id}`, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });

    doc.moveDown().fontSize(12).text("Bill To:", 40, 110);
    doc.fontSize(11).text(customerName || "-", 40, 126);

    const startY = 160;
    const col = (x, txt, y) => doc.text(txt, x, y);
    doc.fontSize(11);
    col(40, "Description", startY);
    col(280, "Qty", startY);
    col(330, "Price", startY);
    col(400, "GST %", startY);
    col(460, "Amount", startY);
    doc.moveTo(40, startY+14).lineTo(555, startY+14).strokeColor("#e5e7eb").stroke();

    let y = startY + 24;
    items.forEach(it => {
      col(40, it.description, y);
      col(280, it.quantity, y);
      col(330, `₹${it.price}`, y);
      col(400, `${it.gstRate}%`, y);
      col(460, `₹${(it.price*it.quantity).toFixed(2)}`, y);
      y += 18;
    });

    doc.moveTo(40, y+6).lineTo(555, y+6).strokeColor("#e5e7eb").stroke();
    y += 14;
    col(400, "Subtotal:", y); col(460, `₹${totalAmount.toFixed(2)}`, y);
    y += 16;
    col(400, "GST:", y); col(460, `₹${gstCollected.toFixed(2)}`, y);
    y += 16;
    doc.fontSize(13).text("Grand Total:", 400, y);
    doc.fontSize(13).text(`₹${(totalAmount+gstCollected).toFixed(2)}`, 460, y);

    doc.fontSize(9).fillColor("#6b7280")
      .text("Thank you for your business.", 40, 760, { align: "center", width: 515 });

    doc.end();

    stream.on("finish", async () => {
      const s3Url = await uploadFile(pdfPath, `invoices/invoice_${invoice._id}.pdf`);
      invoice.pdfUrl = s3Url;
      await invoice.save();
      res.json({ success: true, invoice });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export const sendInvoiceWhatsApp = async (req, res) => {
  try {
    const { phone, pdfUrl } = req.body;
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
      to: `whatsapp:${phone}`,
      body: `Here is your invoice: ${pdfUrl}`,
    });
    res.json({ success: true, message: "Invoice sent via WhatsApp" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const { userId } = req.query;
    const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

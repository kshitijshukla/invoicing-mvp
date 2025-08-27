import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import Razorpay from "razorpay";
import PDFDocument from "pdfkit";
import fs from "fs";
import { uploadFile } from "../utils/uploadToS3.js";
import { drawBrandedHeader } from "../utils/pdfBranding.js";

// ✅ Only init Razorpay if keys exist, otherwise use mock mode
const hasRazorpay = !!(process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET);

let razorpay = null;
if (hasRazorpay) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
}

export const createSubscription = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!hasRazorpay) {
      // Mock order for local/dev use when keys are missing
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: amount * 100,
        currency: "INR",
        receipt: `sub_${Date.now()}`,
        status: "created",
      };
      return res.json({ success: true, order: mockOrder, mock: true });
    }

    const options = { amount: amount * 100, currency: "INR", receipt: `sub_${Date.now()}` };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order, mock: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { userId, paymentId, amount } = req.body;
    const user = await User.findById(userId).lean();

    // MVP: we skip signature verification to keep dev simple.
    const subscription = await Subscription.create({
      userId,
      amount,
      gstPaid: amount * 0.18,
      paymentId: paymentId || `pay_mock_${Date.now()}`,
      status: "success",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await User.findByIdAndUpdate(userId, {
      subscriptionActive: true,
      subscriptionExpiry: subscription.endDate,
    });

    // Generate PDF invoice
    const pdfPath = `./invoices/subscription_${subscription._id}.pdf`;
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

    doc.moveDown().fontSize(20).text("SUBSCRIPTION INVOICE", { align: "right" });
    doc.fontSize(10).text(`Invoice No: SUB-${subscription._id}`, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });

    doc.moveDown().fontSize(12).text("Billed To:", 40, 110);
    doc.fontSize(11).text(user?.businessName || "User", 40, 126);
    doc.text(`GSTIN: ${user?.gstNumber || "-"}`, 40, 144);

    const total = amount + (subscription.gstPaid || 0);
    doc.moveDown().fontSize(12).text(`Subscription Amount: ₹${amount}`);
    doc.text(`GST (18%): ₹${subscription.gstPaid}`);
    doc.fontSize(14).text(`Total: ₹${total}`, { align: "left" });

    doc.fontSize(10).fillColor("#6b7280")
      .text(`Payment ID: ${subscription.paymentId}`, 40, 720)
      .text(`Period: ${new Date(subscription.startDate).toLocaleDateString()} - ${new Date(subscription.endDate).toLocaleDateString()}`);

    doc.end();

    stream.on("finish", async () => {
      const s3Url = await uploadFile(pdfPath, `subscriptions/sub_${subscription._id}.pdf`);
      subscription.pdfUrl = s3Url;
      await subscription.save();
      res.json({ success: true, subscription });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listSubscriptions = async (req, res) => {
  try {
    const { userId } = req.query;
    const subs = await Subscription.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, subscriptions: subs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

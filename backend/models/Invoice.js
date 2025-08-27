import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName: String,
  date: { type: Date, default: Date.now },
  items: [{
    description: String,
    quantity: Number,
    price: Number,
    gstRate: Number,
  }],
  totalAmount: Number,
  gstCollected: Number,
  pdfUrl: String,
}, { timestamps: true });

export default mongoose.model("Invoice", invoiceSchema);

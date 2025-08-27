import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: Number,
  gstPaid: Number,
  paymentId: String,
  status: { type: String, enum: ["success", "pending", "failed"], default: "pending" },
  startDate: Date,
  endDate: Date,
  pdfUrl: String,
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);

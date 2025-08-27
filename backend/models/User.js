import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  businessName: String,
  gstNumber: { type: String, required: true },
  address: String,
  email: String,
  logoUrl: String,
  brandColor: { type: String, default: "#111827" },
  subscriptionActive: { type: Boolean, default: false },
  subscriptionExpiry: Date,
}, { timestamps: true });

export default mongoose.model("User", userSchema);

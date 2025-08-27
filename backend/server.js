import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// serve local files from ./invoices at http://localhost:5000/uploads/<filename>
app.use("/uploads", express.static(path.resolve("./invoices")));

connectDB();

app.get("/", (_req, res) => res.send("Invoicing Backend OK"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/invoices", invoiceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));

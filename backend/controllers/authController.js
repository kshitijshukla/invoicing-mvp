import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const loginUser = async (req, res) => {
  const { phone, gstNumber } = req.body;
  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, gstNumber });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

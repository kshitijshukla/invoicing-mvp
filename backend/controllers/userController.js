import User from "../models/User.js";

export const getProfile = async (req, res) => {
  const id = req.user?.id || req.query.userId || req.headers["x-user-id"];
  if (!id) return res.status(400).json({ error: "Missing user id" });
  const user = await User.findById(id).lean();
  res.json({ success: true, user });
};

export const updateProfile = async (req, res) => {
  const id = req.user?.id || req.body.userId || req.headers["x-user-id"];
  if (!id) return res.status(400).json({ error: "Missing user id" });
  const { businessName, gstNumber, address, email, brandColor } = req.body;
  const user = await User.findByIdAndUpdate(
    id,
    { businessName, gstNumber, address, email, brandColor },
    { new: true }
  );
  res.json({ success: true, user });
};

export const uploadLogoHandler = async (req, res) => {
  const id = req.user?.id || req.query.userId || req.headers["x-user-id"];
  if (!id) return res.status(400).json({ error: "Missing user id" });
  if (!req.file) return res.status(400).json({ error: "No file" });

  const logoUrl = req.file.location
    ? req.file.location
    : `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(id, { logoUrl }, { new: true });
  res.json({ success: true, user });
};

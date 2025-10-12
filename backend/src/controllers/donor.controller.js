// src/controllers/donor.controller.js
import DonorProfile from "../models/DonorProfile.js";
import User from "../models/User.js";

// Create or update donor profile
export async function upsertDonorProfile(req, res) {
  console.log("[DonorProfile] POST /profile called");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  try {
    if (!req.user) {
      console.log("No user on request (auth missing or failed)");
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user._id;
    const { organization_name, country, address, funding_focus } = req.body;
    if (!organization_name || !country) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const profile = await DonorProfile.findOneAndUpdate(
      { user_id: userId },
      { organization_name, country, address, funding_focus, user_id: userId },
      { upsert: true, new: true }
    );
    await User.findByIdAndUpdate(userId, { isOrgProfileComplete: true });
    res.json({ profile });
  } catch (err) {
    console.log("Error in upsertDonorProfile:", err);
    res.status(500).json({ message: err.message || "Failed to save profile." });
  }
}

// Get my donor profile
export async function getMyDonorProfile(req, res) {
  try {
    const userId = req.user._id;
    const profile = await DonorProfile.findOne({ user_id: userId });
    if (!profile) return res.status(404).json({ message: "Profile not found." });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch profile." });
  }
}

import VolunteerProfile from "../models/VolunteerProfile.js";
import User from "../models/User.js";

// Create or update volunteer profile
export async function upsertVolunteerProfile(req, res) {
  console.log("[VolunteerProfile] POST /profile called");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  try {
    if (!req.user) {
      console.log("No user on request (auth missing or failed)");
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user._id;
    const { age, skills, district, availability } = req.body;
    if (!age || !district || !availability) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Handle uploaded picture
    let profile_picture;
    if (req.file) {
      profile_picture = `/uploads/logos/${req.file.filename}`;
    }

    const update = {
      age,
      skills,
      district,
      availability,
      user_id: userId,
      ...(profile_picture ? { profile_picture } : {}),
    };

    const profile = await VolunteerProfile.findOneAndUpdate(
      { user_id: userId },
      update,
      { upsert: true, new: true }
    );
    await User.findByIdAndUpdate(userId, { isOrgProfileComplete: true });
    res.json({ profile });
  } catch (err) {
    console.log("Error in upsertVolunteerProfile:", err);
    res.status(500).json({ message: err.message || "Failed to save profile." });
  }
}

// Get my volunteer profile
export async function getMyVolunteerProfile(req, res) {
  try {
    const userId = req.user._id;
    const profile = await VolunteerProfile.findOne({ user_id: userId });
    if (!profile) return res.status(404).json({ message: "Profile not found." });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch profile." });
  }
}

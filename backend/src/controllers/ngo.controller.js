import path from "path";
import NGOManagerProfile from "../models/NGOManagerProfile.js";
import User from "../models/User.js";

export async function upsertNGOProfile(req, res) {
  try {
    const user = req.user; // set by authenticate middleware
    if (user.role !== "NGO_MANAGER") {
      return res.status(403).json({ message: "Forbidden: NGO Manager only" });
    }

    const {
      organization_name,
      address = "",
      contact_number = "",
      sdgs = "[]",
    } = req.body;

    if (!organization_name || !organization_name.trim()) {
      return res.status(400).json({ message: "organization_name is required" });
    }

    // Parse SDGs: accept JSON or "1,2,3"
    let sdgList = [];
    try {
      if (Array.isArray(sdgs)) {
        sdgList = sdgs.map((n) => Number(n));
      } else if (typeof sdgs === "string") {
        sdgList = sdgs.trim().startsWith("[")
          ? JSON.parse(sdgs)
          : sdgs.split(",").map((n) => Number(n.trim())).filter(Boolean);
      }
    } catch (e) {
      // ignore parsing error -> empty list
    }

    // Optional uploaded file
    let logoUrl;
    if (req.file) {
      // serve from /uploads/logos/<filename>
      logoUrl = `/uploads/logos/${req.file.filename}`;
    }

    // upsert profile (one profile per user)
    const update = {
      organization_name,
      address,
      contact_number,
      ...(logoUrl ? { organization_logo: logoUrl } : {}),
      user_id: user._id,
      sdgs: sdgList,
    };

    const profile = await NGOManagerProfile.findOneAndUpdate(
      { user_id: user._id },
      { $set: update },
      { new: true, upsert: true }
    );

    // also mirror a few bits on the User record (optional but handy)
    user.organizationName = organization_name;
    if (logoUrl) user.logoUrl = logoUrl;
    if (sdgList.length) user.sdgs = sdgList;
    user.isOrgProfileComplete = true;
    await user.save();

    return res.json({
      message: "Organization profile saved",
      profile,
      user: user.toPublic(),
    });
  } catch (err) {
    console.error("upsertNGOProfile error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function getMyNGOProfile(req, res) {
  try {
    const profile = await NGOManagerProfile.findOne({ user_id: req.user._id });
    return res.json({ profile });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

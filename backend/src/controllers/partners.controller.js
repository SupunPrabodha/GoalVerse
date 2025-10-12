import NGOManagerProfile from "../models/NGOManagerProfile.js";
import DonorProfile from "../models/DonorProfile.js";
import VolunteerProfile from "../models/VolunteerProfile.js";

export async function getAllNGOs(req, res) {
  try {
    const ngos = await NGOManagerProfile.find({});
    res.json({ ngos });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch NGOs." });
  }
}

export async function getAllDonors(req, res) {
  try {
    const donors = await DonorProfile.find({});
    res.json({ donors });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch donors." });
  }
}

export async function getAllVolunteers(req, res) {
  try {
    const volunteers = await VolunteerProfile.find({}).populate("user_id", "fullName");
    res.json({ volunteers });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch volunteers." });
  }
}

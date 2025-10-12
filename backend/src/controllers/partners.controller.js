import User from "../models/User.js";
import Project from "../models/Project.js";

export async function getReceivedPartnershipRequests(req, res) {
  try {
    const userId = req.user?._id;
    console.log('[ReceivedRequests] Logged-in userId:', userId);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    // Find requests where the logged-in user is the partnerId
    const requests = await PartnershipRequest.find({ partnerId: userId })
      .populate("requester", "fullName email role")
      .populate("projectId", "name");
    console.log('[ReceivedRequests] Found requests:', requests);
    res.json({ requests });
  } catch (err) {
    console.error('[ReceivedRequests] Error:', err);
    res.status(500).json({ message: err.message || "Failed to fetch partnership requests." });
  }
}
import NGOManagerProfile from "../models/NGOManagerProfile.js";
import DonorProfile from "../models/DonorProfile.js";
import VolunteerProfile from "../models/VolunteerProfile.js";
import PartnershipRequest from "../models/PartnershipRequest.js";
// Create a partnership request
export async function createPartnershipRequest(req, res) {
  try {
    console.log("[PartnershipRequest] req.user:", req.user);
    console.log("[PartnershipRequest] req.body:", req.body);
    const { partnerId, partnerType, projectId } = req.body;
    if (!partnerId || !partnerType || !projectId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // requester is the authenticated user
    const requester = req.user?._id;
    if (!requester) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const partnershipRequest = new PartnershipRequest({
      requester,
      partnerId,
      partnerType,
      projectId,
    });
    await partnershipRequest.save();
    res.status(201).json({ message: "Partnership request created", partnershipRequest });
  } catch (err) {
    console.error("[PartnershipRequest] Error:", err);
    res.status(500).json({ message: err.message || "Failed to create partnership request." });
  }
}

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

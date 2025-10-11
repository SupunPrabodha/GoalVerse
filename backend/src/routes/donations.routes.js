import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";

const router = Router();

// POST /api/donations  (donor creates a donation)
router.post(
  "/",
  authenticate,
  requireRole("DONOR"),
  async (req, res) => {
    try {
      const donor = req.user;
      const { amountCents, currency = "USD", note = "", ngoId, campaignId } = req.body || {};

      const amt = Number(amountCents);
      if (!amt || amt <= 0) return res.status(400).json({ message: "amountCents must be > 0" });

      let ngo_id = ngoId;
      if (!ngo_id && campaignId) {
        const c = await Campaign.findById(campaignId).select("ngo_id");
        if (!c) return res.status(404).json({ message: "Campaign not found" });
        ngo_id = c.ngo_id;
      }
      if (!ngo_id) return res.status(400).json({ message: "ngoId or campaignId required" });

      const donation = await Donation.create({
        ngo_id,
        donor_id: donor._id,
        amountCents: amt,
        currency: String(currency || "USD").toUpperCase(),
        note: String(note || "").slice(0, 500),
        status: "COMPLETED",
      });

      return res.status(201).json({ donation });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// GET /api/donations/me (list my donations)
router.get(
  "/me",
  authenticate,
  requireRole("DONOR"),
  async (req, res) => {
    try {
      const donor = req.user;
      const items = await Donation.find({ donor_id: donor._id }).sort({ createdAt: -1 }).limit(50);
      return res.json({ items });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;

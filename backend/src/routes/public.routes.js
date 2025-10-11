import { Router } from "express";
import Campaign from "../models/Campaign.js";

const router = Router();

// Public campaigns list - returns only real DB campaigns
router.get('/campaigns', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) return res.status(503).json({ message: 'Database not configured' });
    const campaigns = await Campaign.find({ status: 'ACTIVE' }).sort({ createdAt: -1 }).limit(50);
    return res.json({ campaigns });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

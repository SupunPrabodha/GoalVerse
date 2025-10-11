import { Router } from "express";
import Campaign from "../models/Campaign.js";

const router = Router();

// Public campaigns list - returns DB campaigns if connected, otherwise sample data
router.get('/campaigns', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      // return sample data for development when DB not configured
      return res.json({ campaigns: [
        { _id: 'sample-1', title: 'Clean Water Initiative', category: 'Water', budgetCents: 5000000 },
        { _id: 'sample-2', title: 'School Supplies Drive', category: 'Education', budgetCents: 1200000 },
      ]});
    }

    const campaigns = await Campaign.find().sort({ createdAt: -1 }).limit(50);
    return res.json({ campaigns });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

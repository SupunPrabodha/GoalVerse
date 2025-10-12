// backend/src/controllers/donation.controller.js
import Donation from '../models/Donation.js';
import Project from '../models/Project.js';

// Create a donation
export async function createDonation(req, res) {
  try {
    const { amountCents, currency = 'USD', note = '', projectId } = req.body;
    if (!amountCents || !projectId) return res.status(400).json({ message: 'Missing amount or projectId' });
    const donation = await Donation.create({
      donor: req.user._id,
      project: projectId,
      amountCents,
      currency,
      note,
    });
    return res.status(201).json({ donation });
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to create donation' });
  }
}

// List my donations
export async function listMyDonations(req, res) {
  try {
    const items = await Donation.find({ donor: req.user._id }).sort({ createdAt: -1 });
    return res.json({ items });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to list donations' });
  }
}

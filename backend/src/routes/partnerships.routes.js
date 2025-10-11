import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import Partner from '../models/Partner.js';
import Partnership from '../models/Partnership.js';
import User from '../models/User.js';

const router = Router();

// Public list of available partners with optional type filter
router.get('/partners', async (req, res) => {
  try {
    const type = req.query.type; // NGO, DONOR, GOVERNMENT
    const q = { status: 'ACTIVE' };
    if (type && ['NGO','DONOR','GOVERNMENT'].includes(type)) q.type = type;
    const partners = await Partner.find(q).sort({ recommended: -1, name: 1 }).limit(100);
    return res.json({ partners });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// NGO Manager: list my partnerships
router.get('/me', authenticate, requireRole('NGO_MANAGER'), async (req, res) => {
  try {
    const items = await Partnership.find({ ngo_id: req.user._id })
      .populate('partner_id')
      .populate('partner_user_id', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// NGO Manager: request partnership
router.post('/request', authenticate, requireRole('NGO_MANAGER'), async (req, res) => {
  try {
    const { partnerId, notes = '' } = req.body || {};
    if (!partnerId) return res.status(400).json({ message: 'partnerId required' });
    const exists = await Partnership.findOne({ ngo_id: req.user._id, partner_id: partnerId });
    if (exists) return res.status(200).json({ item: exists, message: 'Already requested' });
    const item = await Partnership.create({ ngo_id: req.user._id, partner_id: partnerId, status: 'REQUESTED', notes });
    return res.status(201).json({ item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

// Real user discovery endpoints
// List potential partners as real users by role (e.g., DONOR organizations or NGO managers)
router.get('/users', authenticate, requireRole('NGO_MANAGER'), async (req, res) => {
  try {
    const role = req.query.role; // e.g., 'DONOR', 'NGO_MANAGER', 'GOVERNMENT' (if modeled)
    const q = {};
    if (role) q.role = role;
    const users = await User.find(q).select('fullName email role').limit(100);
    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Request partnership with a real user account
router.post('/request-user', authenticate, requireRole('NGO_MANAGER'), async (req, res) => {
  try {
    const { userId, notes = '' } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const exists = await Partnership.findOne({ ngo_id: req.user._id, partner_user_id: userId });
    if (exists) return res.status(200).json({ item: exists, message: 'Already requested' });
    const item = await Partnership.create({ ngo_id: req.user._id, partner_user_id: userId, status: 'REQUESTED', notes });
    return res.status(201).json({ item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update partnership status (e.g., approve/reject/mark pending report)
router.patch('/:id/status', authenticate, requireRole('NGO_MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = ['REQUESTED','ACTIVE','REJECTED','PENDING_REPORT'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const item = await Partnership.findOneAndUpdate({ _id: id, ngo_id: req.user._id }, { status }, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    return res.json({ item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

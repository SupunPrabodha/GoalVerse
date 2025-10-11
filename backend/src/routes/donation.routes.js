// backend/src/routes/donation.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createDonation, listMyDonations } from '../controllers/donation.controller.js';

const router = Router();

router.post('/', authenticate, createDonation);
router.get('/me', authenticate, listMyDonations);

export default router;

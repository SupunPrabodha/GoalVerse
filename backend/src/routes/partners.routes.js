
import express from "express";
import { getAllNGOs, getAllDonors, getAllVolunteers, createPartnershipRequest, getReceivedPartnershipRequests } from "../controllers/partners.controller.js";
import { authenticate } from "../middleware/auth.js";
const router = express.Router();

// Get partnership requests received by the logged-in user
router.get("/received-requests", authenticate, getReceivedPartnershipRequests);

router.get("/ngos", getAllNGOs);
router.get("/donors", getAllDonors);
router.get("/volunteers", getAllVolunteers);

// Partnership request route
router.post("/request", authenticate, createPartnershipRequest);

export default router;

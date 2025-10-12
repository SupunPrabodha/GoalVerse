import express from "express";
import { getAllNGOs, getAllDonors, getAllVolunteers, createPartnershipRequest } from "../controllers/partners.controller.js";
import { authenticate } from "../middleware/auth.js";
const router = express.Router();

router.get("/ngos", getAllNGOs);
router.get("/donors", getAllDonors);
router.get("/volunteers", getAllVolunteers);

// Partnership request route
router.post("/request", authenticate, createPartnershipRequest);

export default router;

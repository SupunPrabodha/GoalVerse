import express from "express";
import { getAllNGOs, getAllDonors, getAllVolunteers } from "../controllers/partners.controller.js";
const router = express.Router();

router.get("/ngos", getAllNGOs);
router.get("/donors", getAllDonors);
router.get("/volunteers", getAllVolunteers);

export default router;

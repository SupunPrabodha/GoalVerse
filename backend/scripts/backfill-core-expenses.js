// backend/scripts/backfill-core-expenses.js
import "./../src/lib/env.js"; // loads .env
import mongoose from "mongoose";
import Project from "../src/models/Project.js";

const CORE = [
  { code: "PROGRAM_IMPLEMENTATION",  name: "Program Implementation"  },
  { code: "ADMINISTRATIVE_COSTS",    name: "Administrative Costs"    },
  { code: "EMERGENCY_FUND",          name: "Emergency Fund"          },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const projects = await Project.find({});
  for (const p of projects) {
    let changed = false;
    for (const c of CORE) {
      if (!(p.expenses || []).some(e => e.type === "CORE" && e.code === c.code)) {
        p.expenses.push({ name: c.name, type: "CORE", code: c.code, isLocked: true });
        changed = true;
      }
    }
    if (changed) await p.save();
  }
  console.log("✅ backfill done");
  process.exit(0);
})();

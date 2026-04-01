import { Router } from "express";
import { fetchNavigationFromAirtable } from "../services/site.js";

const router = Router();

router.get("/navigation", async (_req, res) => {
  try {
    const navigation = await fetchNavigationFromAirtable();
    res.json({ navigation });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Airtable error";

    res.status(500).json({
      error: "Failed to fetch navigation",
      message
    });
  }
});

export default router;
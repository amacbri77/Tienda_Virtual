import { Router } from "express";
import { fetchCollectionsFromAirtable } from "../services/site.js";

const router = Router();

router.get("/collections", async (_req, res) => {
  try {
    const collections = await fetchCollectionsFromAirtable();
    res.json({ collections });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Airtable error";

    res.status(500).json({
      error: "Failed to fetch collections",
      message
    });
  }
});

export default router;
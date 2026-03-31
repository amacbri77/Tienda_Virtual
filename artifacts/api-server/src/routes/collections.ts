import { Router } from "express";
import { fetchCollectionsFromAirtable } from "../services/collections.js";

const collectionsRouter = Router();

collectionsRouter.get("/collections", async (_req, res, next) => {
  try {
    const collections = await fetchCollectionsFromAirtable();
    res.json({ collections });
  } catch (error) {
    next(error);
  }
});

export default collectionsRouter;
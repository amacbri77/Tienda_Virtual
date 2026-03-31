import { Router } from "express";
import { fetchNavigationFromAirtable } from "../services/navigation.js";

const navigationRouter = Router();

navigationRouter.get("/navigation", async (_req, res, next) => {
  try {
    const navigation = await fetchNavigationFromAirtable();
    res.json({ navigation });
  } catch (error) {
    next(error);
  }
});

export default navigationRouter;
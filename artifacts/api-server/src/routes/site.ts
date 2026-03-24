import { Router } from "express";
import { fetchSiteSettingsFromAirtable } from "../services/site.js";

export const siteRouter = Router();

siteRouter.get("/site-settings", async (_req, res, next) => {
  try {
    const siteSettings = await fetchSiteSettingsFromAirtable();
    res.json(siteSettings);
  } catch (error) {
    next(error);
  }
});
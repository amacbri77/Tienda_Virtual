import { Router } from "express";
import {
  fetchHomeDataFromAirtable,
  fetchSiteSettingsFromAirtable
} from "../services/site.js";

export const siteRouter = Router();

siteRouter.get("/site-settings", async (_req, res, next) => {
  try {
    const siteSettings = await fetchSiteSettingsFromAirtable();
    res.json(siteSettings);
  } catch (error) {
    next(error);
  }
});

siteRouter.get("/home", async (_req, res, next) => {
  try {
    const homeData = await fetchHomeDataFromAirtable();
    res.json(homeData);
  } catch (error) {
    next(error);
  }
});
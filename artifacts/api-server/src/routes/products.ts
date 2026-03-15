import { Router } from "express";
import { fetchProductsFromAirtable } from "../services/airtable.js";
import { pickRecommendedProducts } from "../services/recommendations.js";

const router = Router();

router.get("/products", async (_req, res) => {
  const products = await fetchProductsFromAirtable();
  res.json({ products });
});

router.get("/products/recommendations", async (_req, res) => {
  const products = await fetchProductsFromAirtable();
  const recommendations = pickRecommendedProducts(products);
  res.json({ recommendations, count: recommendations.length, constraints: "3-5 when inventory allows" });
});

export default router;

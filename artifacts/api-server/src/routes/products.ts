import { Router } from "express";
import {
  fetchProductBySlugFromAirtable,
  fetchProductsFromAirtable
} from "../services/airtable.js";
import { pickRecommendedProducts } from "../services/recommendations.js";

const router = Router();

router.get("/products", async (_req, res) => {
  try {
    const products = await fetchProductsFromAirtable();
    res.json({ products });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Airtable error";

    res.status(500).json({
      error: "Failed to fetch products",
      message
    });
  }
});

router.get("/products/recommendations", async (_req, res) => {
  try {
    const products = await fetchProductsFromAirtable();
    const recommendations = pickRecommendedProducts(products);

    res.json({
      recommendations,
      count: recommendations.length,
      constraints: "3-5 when inventory allows"
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Airtable error";

    res.status(500).json({
      error: "Failed to fetch recommendations",
      message
    });
  }
});

router.get("/products/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await fetchProductBySlugFromAirtable(slug);

    if (!product) {
      res.status(404).json({
        error: "Product not found"
      });
      return;
    }

    res.json({ product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Airtable error";

    res.status(500).json({
      error: "Failed to fetch product",
      message
    });
  }
});

export default router;
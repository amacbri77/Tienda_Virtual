import cors from "cors";
import express from "express";
import productsRouter from "./routes/products.js";
import collectionsRouter from "./routes/collections.js";
import { siteRouter } from "./routes/site.js";

const app = express();

app.use(
  cors({
    origin: true
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", productsRouter);
app.use("/api", siteRouter);
app.use("/api", collectionsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error"
  });
});

export default app;
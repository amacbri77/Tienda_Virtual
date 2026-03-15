import cors from "cors";
import express from "express";
import productsRouter from "./routes/products.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", productsRouter);

export default app;

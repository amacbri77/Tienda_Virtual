import fs from "node:fs";
import path from "node:path";
import app from "./app.js";

const envPath = path.resolve(process.cwd(), ".env");
const envExamplePath = path.resolve(process.cwd(), ".env.example");

if (fs.existsSync(envPath)) {
  process.loadEnvFile?.(envPath);
} else if (fs.existsSync(envExamplePath)) {
  process.loadEnvFile?.(envExamplePath);
}

const rawPort = process.env["PORT"] ?? "4000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
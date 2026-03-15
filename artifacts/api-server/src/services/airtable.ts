import type { Product } from "../types/product.js";

const AIRTABLE_API_BASE = "https://api.airtable.com/v0";

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
}

function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseProduct(record: AirtableRecord): Product | null {
  const name = record.fields["name"];
  const category = record.fields["category"];
  const price = record.fields["price"];

  if (typeof name !== "string" || typeof category !== "string") {
    return null;
  }

  const numericPrice =
    typeof price === "number"
      ? price
      : typeof price === "string"
        ? Number(price)
        : NaN;

  if (Number.isNaN(numericPrice)) {
    return null;
  }

  return {
    id: record.id,
    name,
    category,
    price: numericPrice,
    imageUrl:
      typeof record.fields["imageUrl"] === "string"
        ? (record.fields["imageUrl"] as string)
        : undefined,
    description:
      typeof record.fields["description"] === "string"
        ? (record.fields["description"] as string)
        : undefined
  };
}

export async function fetchProductsFromAirtable(): Promise<Product[]> {
  const apiKey = readRequiredEnv("AIRTABLE_API_KEY");
  const baseId = readRequiredEnv("AIRTABLE_BASE_ID");
  const tableName = process.env["AIRTABLE_TABLE_NAME"] ?? "products";

  const url = `${AIRTABLE_API_BASE}/${baseId}/${encodeURIComponent(tableName)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Airtable request failed with ${response.status}`);
    }

    const body = (await response.json()) as AirtableResponse;
    return body.records.map(parseProduct).filter((product): product is Product => Boolean(product));
  } catch (error) {
    console.error("Failed to fetch products from Airtable", error);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

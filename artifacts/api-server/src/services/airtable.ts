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

  console.log("[airtable] AIRTABLE_BASE_ID:", baseId);
  console.log("[airtable] AIRTABLE_TABLE_NAME:", tableName);

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

    const bodyText = await response.text();

    if (!response.ok) {
      throw new Error(
        `Airtable fetch failed: status=${response.status}, body=${bodyText || "<empty>"}`
      );
    }

    const body = JSON.parse(bodyText) as AirtableResponse;
    console.log("[airtable] number of Airtable records returned:", body.records.length);

    return body.records.map(parseProduct).filter((product): product is Product => Boolean(product));
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith("Airtable fetch failed:")) {
        throw error;
      }
      throw new Error(`Airtable fetch failed: ${error.message}`);
    }

    throw new Error("Airtable fetch failed: unknown error");
  } finally {
    clearTimeout(timeout);
  }
}

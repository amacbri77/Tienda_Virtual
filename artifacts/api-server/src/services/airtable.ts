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

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown): number | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return undefined;
}

function getImageUrl(value: unknown): string | undefined {
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0] as any;

    if (typeof first?.url === "string") {
      return first.url;
    }

    if (typeof first?.thumbnails?.large?.url === "string") {
      return first.thumbnails.large.url;
    }

    if (typeof first?.thumbnails?.full?.url === "string") {
      return first.thumbnails.full.url;
    }
  }

  return undefined;
}

function parseProduct(record: AirtableRecord): Product | null {
  const name = getString(record.fields["Nombre"]);
  const category =
    getString(record.fields["Tipo de pieza"]) ??
    getString(record.fields["Colección"]) ??
    "Sin categoría";
  const price = getNumber(record.fields["Precio"]);

  if (!name || price === undefined) {
    return null;
  }

  return {
    id: record.id,
    name,
    category,
    price,
    imageUrl: getImageUrl(record.fields["Imagen principal"]),
    description:
      getString(record.fields["Descripción corta"]) ??
      getString(record.fields["Descripción para IA"])
  };
}

export async function fetchProductsFromAirtable(): Promise<Product[]> {
  const apiKey = readRequiredEnv("AIRTABLE_API_KEY");
  const baseId = readRequiredEnv("AIRTABLE_BASE_ID");
  const tableName = readRequiredEnv("AIRTABLE_TABLE_NAME");

  const url = `${AIRTABLE_API_BASE}/${baseId}/${encodeURIComponent(tableName)}`;

  console.log("[Airtable debug] BASE_ID:", baseId);
  console.log("[Airtable debug] TABLE_NAME:", tableName);

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
      const bodyText = await response.text();
      throw new Error(
        `Airtable fetch failed: status ${response.status}, body: ${bodyText}`
      );
    }

    const body = (await response.json()) as AirtableResponse;
    console.log("[Airtable debug] raw record count:", body.records.length);

    const parsedProducts = body.records
      .map(parseProduct)
      .filter((product): product is Product => Boolean(product));

    console.log("[Airtable debug] parsed product count:", parsedProducts.length);

    return parsedProducts;
  } catch (error) {
    console.error("[Airtable debug] Failed to fetch products from Airtable", error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

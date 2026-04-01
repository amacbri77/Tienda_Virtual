import type { Product, ProductAttribute } from "../types/product.js";

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
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const parsed = Number(normalized);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return undefined;
}

function getBoolean(value: unknown): boolean {
  return value === true;
}

function getSingleOrFirstString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === "string" && first.trim()) {
      const normalized = first.trim();
      if (/^rec[a-zA-Z0-9]+$/.test(normalized)) {
        return undefined;
      }
      return normalized;
    }
  }

  return undefined;
}

function getImageUrl(value: unknown): string | undefined {
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0] as {
      url?: string;
      thumbnails?: {
        large?: { url?: string };
        full?: { url?: string };
      };
    };

    if (typeof first?.url === "string" && first.url.trim()) {
      return first.url;
    }

    if (typeof first?.thumbnails?.large?.url === "string") {
      return first.thumbnails.large.url;
    }

    if (typeof first?.thumbnails?.full?.url === "string") {
      return first.thumbnails.full.url;
    }
  }

  if (typeof value === "string" && value.trim()) {
    const match = value.match(/\((https?:\/\/[^)]+)\)$/);
    if (match?.[1]) {
      return match[1];
    }

    if (value.startsWith("http")) {
      return value.trim();
    }
  }

  return undefined;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildAttributes(input: {
  collection?: string;
  occasion?: string;
  meaning?: string;
  material?: string;
  detail?: string;
  style?: string;
}): ProductAttribute[] {
  const raw: Array<ProductAttribute | null> = [
    input.collection ? { label: "Colección", value: input.collection } : null,
    input.occasion ? { label: "Ocasión", value: input.occasion } : null,
    input.meaning ? { label: "Significado", value: input.meaning } : null,
    input.material ? { label: "Material", value: input.material } : null,
    input.detail ? { label: "Detalle", value: input.detail } : null,
    input.style ? { label: "Estilo", value: input.style } : null
  ];

  return raw.filter((item): item is ProductAttribute => Boolean(item));
}

function parseProduct(record: AirtableRecord): Product | null {
  const fields = record.fields;

  const isActive = getBoolean(fields["Activo"]);
  const visibleInStore =
    fields["Visible en tienda"] === undefined
      ? true
      : getBoolean(fields["Visible en tienda"]);
  const isDiscontinued = getBoolean(fields["Descontinuado"]);

  if (!isActive || !visibleInStore || isDiscontinued) {
    return null;
  }

  const name = getString(fields["Nombre"]);
  const price = getNumber(fields["Precio"]);

  if (!name || price === undefined) {
    return null;
  }

  const slug = getString(fields["Slug"]) ?? slugify(name);

  const category =
    getString(fields["Tipo de pieza"]) ??
    getString(fields["Categoría"]) ??
    getString(fields["Familia de producto"]) ??
    "Sin categoría";

  const imageUrl =
    getImageUrl(fields["Imagen principal"]) ??
    getImageUrl(fields["Imagen Principal"]) ??
    getImageUrl(fields["Imagen"]) ??
    getImageUrl(fields["URL imagen principal"]);

  const description =
    getString(fields["Descripción corta"]) ??
    getString(fields["Descripción para guía"]) ??
    getString(fields["Descripción para IA"]);

  const descriptionLong =
    getString(fields["Descripción larga"]) ??
    getString(fields["Texto comercial guía"]) ??
    getString(fields["Descripción para IA"]);

  const collection = getSingleOrFirstString(fields["Colección"]);
  const occasion = getSingleOrFirstString(fields["Ocasión"]);
  const meaning = getString(fields["Significado"]);
  const material = getString(fields["Material principal"]);
  const detail = getString(fields["Piedra o detalle"]);
  const style = getString(fields["Estilo"]);

  return {
    id: record.id,
    slug,
    name,
    category,
    price,
    imageUrl,
    description,
    descriptionLong,
    collection,
    occasion,
    meaning,
    material,
    detail,
    style,
    attributes: buildAttributes({
      collection,
      occasion,
      meaning,
      material,
      detail,
      style
    })
  };
}

async function fetchRawProducts(): Promise<AirtableRecord[]> {
  const apiKey = readRequiredEnv("AIRTABLE_API_KEY");
  const baseId = readRequiredEnv("AIRTABLE_BASE_ID");
  const tableName = readRequiredEnv("AIRTABLE_TABLE_NAME");

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
      const bodyText = await response.text();
      throw new Error(
        `Airtable fetch failed: status ${response.status}, body: ${bodyText}`
      );
    }

    const body = (await response.json()) as AirtableResponse;
    return body.records;
  } catch (error) {
    console.error("Failed to fetch products from Airtable", error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchProductsFromAirtable(): Promise<Product[]> {
  const records = await fetchRawProducts();

  return records
    .map(parseProduct)
    .filter((product): product is Product => Boolean(product));
}

export async function fetchProductBySlugFromAirtable(
  slug: string
): Promise<Product | null> {
  const products = await fetchProductsFromAirtable();
  return products.find((product) => product.slug === slug) ?? null;
}
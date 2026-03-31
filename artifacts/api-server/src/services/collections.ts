const AIRTABLE_API_BASE = "https://api.airtable.com/v0";
const COLLECTIONS_TABLE_ID = "tblC9keu24mQEQh7V";

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
}

export type CollectionItem = {
  id: string;
  name: string;
  shortDescription: string;
  editorialText: string;
  imageUrl?: string;
  videoUrl?: string;
  order: number;
  isActive: boolean;
};

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

function getBoolean(value: unknown): boolean {
  return value === true;
}

function getAttachmentUrl(value: unknown): string | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;

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

  return undefined;
}

function parseCollection(record: AirtableRecord): CollectionItem {
  const fields = record.fields;

  return {
    id: record.id,
    name: getString(fields["Nombre"]) ?? "Colección",
    shortDescription:
      getString(fields["Descripción corta"]) ??
      "Colección editorial de la tienda.",
    editorialText:
      getString(fields["Texto editorial"]) ??
      getString(fields["Descripción larga"]) ??
      "Una selección curada para descubrir la tienda de una forma más sensible y editorial.",
    imageUrl:
      getAttachmentUrl(fields["Imagen de tarjeta"]) ??
      getAttachmentUrl(fields["Imagen principal"]),
    videoUrl: getAttachmentUrl(fields["Video colección"]),
    order: getNumber(fields["Orden manual"]) ?? 999,
    isActive: getBoolean(fields["Activa"])
  };
}

export async function fetchCollectionsFromAirtable(): Promise<CollectionItem[]> {
  const apiKey = readRequiredEnv("AIRTABLE_API_KEY");
  const baseId = readRequiredEnv("AIRTABLE_BASE_ID");

  const url = `${AIRTABLE_API_BASE}/${baseId}/${COLLECTIONS_TABLE_ID}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(
        `Airtable collections fetch failed: status ${response.status}, body: ${bodyText}`
      );
    }

    const body = (await response.json()) as AirtableResponse;

    return body.records
      .map(parseCollection)
      .filter((item) => item.isActive)
      .sort((a, b) => a.order - b.order);
  } finally {
    clearTimeout(timeout);
  }
}
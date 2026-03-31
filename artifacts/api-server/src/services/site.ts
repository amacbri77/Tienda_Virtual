const AIRTABLE_API_BASE = "https://api.airtable.com/v0";
const SITE_SETTINGS_TABLE_ID = "tbls9bpGocY5yDgUB";
const HOME_SECTIONS_TABLE_ID = "tbl3tpHn4ss3o2KhK";

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
}

export type SiteSettings = {
  brandName: string;
  brandSubtitle: string;
  footerMessage: string;
  logoUrl?: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroText: string;
  heroCtaLabel: string;
  heroCtaLink: string;
  heroVideoUrl?: string;
  heroImageUrl?: string;
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

function getFirstAttachmentUrlFromPossibleFields(
  fields: Record<string, unknown>,
  fieldNames: string[]
): string | undefined {
  for (const fieldName of fieldNames) {
    const url = getAttachmentUrl(fields[fieldName]);
    if (url) return url;
  }
  return undefined;
}

async function fetchAirtableTable(
  baseId: string,
  tableId: string,
  apiKey: string,
  signal: AbortSignal
): Promise<AirtableRecord[]> {
  const url = `${AIRTABLE_API_BASE}/${baseId}/${tableId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    signal
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(
      `Airtable fetch failed for table ${tableId}: status ${response.status}, body: ${bodyText}`
    );
  }

  const body = (await response.json()) as AirtableResponse;
  return body.records;
}

export async function fetchSiteSettingsFromAirtable(): Promise<SiteSettings> {
  const apiKey = readRequiredEnv("AIRTABLE_API_KEY");
  const baseId = readRequiredEnv("AIRTABLE_BASE_ID");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const [siteRecords, sectionRecords] = await Promise.all([
      fetchAirtableTable(baseId, SITE_SETTINGS_TABLE_ID, apiKey, controller.signal),
      fetchAirtableTable(baseId, HOME_SECTIONS_TABLE_ID, apiKey, controller.signal)
    ]);

    const siteRecord = siteRecords[0];
    const heroRecord = sectionRecords.find(
      (record) => getString(record.fields["Clave de sección"]) === "hero"
    );

    const siteFields = siteRecord?.fields ?? {};
    const heroFields = heroRecord?.fields ?? {};

    const heroVideoUrl = getFirstAttachmentUrlFromPossibleFields(heroFields, [
      "Video hero",
      "Video Hero",
      "Hero video",
      "Hero Video",
      "Video",
      "Video principal"
    ]);

    const heroImageUrl = getFirstAttachmentUrlFromPossibleFields(heroFields, [
      "Imagen hero fallback",
      "Imagen Hero Fallback",
      "Hero image fallback",
      "Imagen hero",
      "Imagen Hero",
      "Imagen",
      "Imagen principal"
    ]);

    return {
      brandName: getString(siteFields["Nombre de marca"]) ?? "Arte Dorado",
      brandSubtitle:
        getString(siteFields["Subtítulo de marca"]) ?? "Joyería artesanal colombiana",
      footerMessage:
        getString(siteFields["Mensaje de footer"]) ??
        "Joyas artesanales pensadas para acompañar historias, momentos y personas.",
      logoUrl: getAttachmentUrl(siteFields["Logo"]),
      heroEyebrow: getString(heroFields["Eyebrow"]) ?? "Boutique digital guiada",
      heroTitle:
        getString(heroFields["Título"]) ??
        "Encuentra una pieza con historia, intención y presencia.",
      heroSubtitle:
        getString(heroFields["Subtítulo"]) ??
        "Arte Dorado busca sentirse más cercano a una boutique curada que a un catálogo estándar.",
      heroText:
        getString(heroFields["Texto"]) ??
        "Descubre joyas artesanales con una experiencia más cálida, orientada y significativa.",
      heroCtaLabel: getString(heroFields["Etiqueta CTA"]) ?? "Quiero que me guíen",
      heroCtaLink: getString(heroFields["Enlace CTA"]) ?? "/guia",
      heroVideoUrl,
      heroImageUrl
    };
  } finally {
    clearTimeout(timeout);
  }
}
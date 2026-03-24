const AIRTABLE_API_BASE = "https://api.airtable.com/v0";
const SITE_SETTINGS_TABLE_ID = "tbls9bpGocY5yDgUB";

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

export async function fetchSiteSettingsFromAirtable(): Promise<SiteSettings> {
  const apiKey = readRequiredEnv("AIRTABLE_API_KEY");
  const baseId = readRequiredEnv("AIRTABLE_BASE_ID");

  const url = `${AIRTABLE_API_BASE}/${baseId}/${SITE_SETTINGS_TABLE_ID}`;

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
        `Airtable site settings fetch failed: status ${response.status}, body: ${bodyText}`
      );
    }

    const body = (await response.json()) as AirtableResponse;
    const record = body.records[0];

    if (!record) {
      return {
        brandName: "Arte Dorado",
        brandSubtitle: "Joyería artesanal colombiana",
        footerMessage: "Joyas artesanales pensadas para acompañar historias, momentos y personas."
      };
    }

    const fields = record.fields;

    return {
      brandName: getString(fields["Nombre de marca"]) ?? "Arte Dorado",
      brandSubtitle:
        getString(fields["Subtítulo de marca"]) ?? "Joyería artesanal colombiana",
      footerMessage:
        getString(fields["Mensaje de footer"]) ??
        "Joyas artesanales pensadas para acompañar historias, momentos y personas.",
      logoUrl: getAttachmentUrl(fields["Logo"])
    };
  } finally {
    clearTimeout(timeout);
  }
}
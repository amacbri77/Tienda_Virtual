const AIRTABLE_API_BASE = "https://api.airtable.com/v0";
const NAVIGATION_TABLE_ID = "tblFDHnCdqwKY5oJc";

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
}

export type NavigationItem = {
  id: string;
  label: string;
  destination: string;
  order: number;
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

function parseNavigationItem(record: AirtableRecord): NavigationItem | null {
  const fields = record.fields;

  const label = getString(fields["Etiqueta"]);
  const destination = getString(fields["Destino"]);

  if (!label || !destination) {
    return null;
  }

  return {
    id: record.id,
    label,
    destination,
    order: getNumber(fields["Orden"]) ?? 999
  };
}

export async function fetchNavigationFromAirtable(): Promise<NavigationItem[]> {
  const apiKey = readRequiredEnv("AIRTABLE_API_KEY");
  const baseId = readRequiredEnv("AIRTABLE_BASE_ID");

  const url = `${AIRTABLE_API_BASE}/${baseId}/${NAVIGATION_TABLE_ID}`;

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
        `Airtable navigation fetch failed: status ${response.status}, body: ${bodyText}`
      );
    }

    const body = (await response.json()) as AirtableResponse;

    return body.records
      .map(parseNavigationItem)
      .filter((item): item is NavigationItem => Boolean(item))
      .sort((a, b) => a.order - b.order);
  } finally {
    clearTimeout(timeout);
  }
}
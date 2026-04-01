const AIRTABLE_API_BASE = "https://api.airtable.com/v0";
const SITE_SETTINGS_TABLE_NAME = "Configuración del sitio";
const HOME_SECTIONS_TABLE_NAME = "Secciones de inicio";
const NAVIGATION_TABLE_NAME = "Navegación";
const COLLECTIONS_TABLE_NAME = "Colecciones";

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

export type HomeSection = {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  order: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  text: string;
  ctaLabel: string;
  ctaLink: string;
  displayStyle: string;
  backgroundTone: string;
  imageUrl?: string;
  videoUrl?: string;
  relatedCollection?: string;
  relatedMeaning?: string;
};

export type HomeResponse = {
  site: SiteSettings;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    text: string;
    ctaLabel: string;
    ctaLink: string;
    videoUrl?: string;
    imageUrl?: string;
  };
  sections: HomeSection[];
};

export type NavigationItem = {
  id: string;
  label: string;
  destination: string;
  order: number;
  isActive: boolean;
  linkType: string;
  openInNewTab: boolean;
  isExternal: boolean;
};

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

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return undefined;
}

function getBoolean(value: unknown): boolean {
  return value === true;
}

function getAttachmentUrl(value: unknown): string | undefined {
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

function normalizeLink(value?: string): string {
  if (!value?.trim()) return "/catalogo";

  const normalized = value.trim();

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  if (normalized.startsWith("#")) {
    const section = normalized.replace(/^#+/, "").trim().toLowerCase();

    if (section === "guia") return "/guia";
    if (section === "colecciones") return "/colecciones";
    if (section === "catalogo") return "/catalogo";
    if (section === "home" || section === "inicio") return "/";

    return `/${section}`;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  return `/${normalized}`;
}

async function fetchTable(tableName: string): Promise<AirtableRecord[]> {
  const apiKey = readRequiredEnv("AIRTABLE_API_KEY");
  const baseId = readRequiredEnv("AIRTABLE_BASE_ID");

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
        `Airtable fetch failed for ${tableName}: status ${response.status}, body: ${bodyText}`
      );
    }

    const body = (await response.json()) as AirtableResponse;
    return body.records;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchSiteSettingsFromAirtable(): Promise<SiteSettings> {
  const records = await fetchTable(SITE_SETTINGS_TABLE_NAME);
  const record = records[0];

  if (!record) {
    return {
      brandName: "Arte Dorado",
      brandSubtitle: "Joyería artesanal colombiana",
      footerMessage:
        "Joyas artesanales pensadas para acompañar historias, momentos y personas."
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
}

export async function fetchHomeDataFromAirtable(): Promise<HomeResponse> {
  const [site, sectionRecords] = await Promise.all([
    fetchSiteSettingsFromAirtable(),
    fetchTable(HOME_SECTIONS_TABLE_NAME)
  ]);

  const sections = sectionRecords
    .map((record): HomeSection | null => {
      const fields = record.fields;
      const isActive = getBoolean(fields["Activa"]);

      if (!isActive) return null;

      return {
        id: record.id,
        key: getString(fields["Clave de sección"]) ?? "",
        name: getString(fields["Nombre"]) ?? "Sección",
        isActive,
        order: getNumber(fields["Orden"]) ?? 999,
        eyebrow: getString(fields["Eyebrow"]) ?? "",
        title: getString(fields["Título"]) ?? "",
        subtitle: getString(fields["Subtítulo"]) ?? "",
        text: getString(fields["Texto"]) ?? "",
        ctaLabel: getString(fields["Etiqueta CTA"]) ?? "Explorar",
        ctaLink: normalizeLink(getString(fields["Enlace CTA"])),
        displayStyle: getString(fields["Estilo de visualización"]) ?? "simple",
        backgroundTone: getString(fields["Tono de fondo"]) ?? "claro",
        imageUrl: getAttachmentUrl(fields["Imagen"]),
        videoUrl: getAttachmentUrl(fields["Video"]),
        relatedCollection: getString(fields["Colección relacionada"]) ?? "",
        relatedMeaning: getString(fields["Significado relacionado"]) ?? ""
      };
    })
    .filter((section): section is HomeSection => Boolean(section))
    .sort((a, b) => a.order - b.order);

  const heroSection = sections.find((section) => section.key === "hero");

  return {
    site,
    hero: {
      eyebrow: heroSection?.eyebrow ?? "Boutique digital guiada",
      title:
        heroSection?.title ??
        "Encuentra una pieza con historia, intención y presencia.",
      subtitle:
        heroSection?.subtitle ??
        "Arte Dorado busca sentirse más cercano a una boutique curada que a un catálogo estándar.",
      text:
        heroSection?.text ??
        "Descubre joyas artesanales con una experiencia más cálida, orientada y significativa.",
      ctaLabel: heroSection?.ctaLabel ?? "Quiero que me guíen",
      ctaLink: heroSection?.ctaLink ?? "/guia",
      videoUrl: heroSection?.videoUrl,
      imageUrl: heroSection?.imageUrl
    },
    sections
  };
}

export async function fetchNavigationFromAirtable(): Promise<NavigationItem[]> {
  const records = await fetchTable(NAVIGATION_TABLE_NAME);

  return records
    .map((record): NavigationItem | null => {
      const fields = record.fields;
      const isActive = getBoolean(fields["Activo"]);

      if (!isActive) return null;

      const linkType = getString(fields["Tipo de enlace"]) ?? "interno";
      const rawDestination = getString(fields["Destino"]) ?? "";
      const destination =
        linkType.toLowerCase() === "externo"
          ? rawDestination
          : normalizeLink(rawDestination);

      return {
        id: record.id,
        label: getString(fields["Etiqueta"]) ?? "Enlace",
        destination,
        order: getNumber(fields["Orden"]) ?? 999,
        isActive,
        linkType,
        openInNewTab: getBoolean(fields["Abrir en nueva pestaña"]),
        isExternal: linkType.toLowerCase() === "externo"
      };
    })
    .filter((item): item is NavigationItem => Boolean(item))
    .sort((a, b) => a.order - b.order);
}

export async function fetchCollectionsFromAirtable(): Promise<CollectionItem[]> {
  const records = await fetchTable(COLLECTIONS_TABLE_NAME);

  return records
    .map((record): CollectionItem | null => {
      const fields = record.fields;
      const isActive = getBoolean(fields["Activa"]);

      if (!isActive) return null;

      return {
        id: record.id,
        name: getString(fields["Nombre"]) ?? "Colección",
        shortDescription: getString(fields["Descripción corta"]) ?? "",
        editorialText:
          getString(fields["Texto editorial"]) ??
          getString(fields["Descripción larga"]) ??
          "",
        imageUrl:
          getAttachmentUrl(fields["Imagen principal"]) ??
          getAttachmentUrl(fields["Imagen de tarjeta"]),
        videoUrl: getAttachmentUrl(fields["Video colección"]),
        order: getNumber(fields["Orden manual"]) ?? 999,
        isActive
      };
    })
    .filter((item): item is CollectionItem => Boolean(item))
    .sort((a, b) => a.order - b.order);
}
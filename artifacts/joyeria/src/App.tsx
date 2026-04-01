import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, Link, useParams } from "react-router-dom";

type ProductAttribute = {
  label: string;
  value: string;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  descriptionLong?: string;
  imageUrl?: string;
  collection?: string;
  occasion?: string;
  meaning?: string;
  material?: string;
  detail?: string;
  style?: string;
  attributes: ProductAttribute[];
};

type GuideAnswers = {
  purpose: string | null;
  meaning: string | null;
  pieceType: string | null;
  presence: string | null;
};

type CollectionItem = {
  id: string;
  name: string;
  shortDescription: string;
  editorialText: string;
  imageUrl?: string;
  videoUrl?: string;
  order: number;
  isActive: boolean;
};

type HomeSection = {
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

type HomeData = {
  site: {
    brandName: string;
    brandSubtitle: string;
    footerMessage: string;
    logoUrl?: string;
  };
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

type NavigationItem = {
  id: string;
  label: string;
  destination: string;
  order: number;
  isActive: boolean;
  linkType: string;
  openInNewTab: boolean;
  isExternal: boolean;
};

type SiteIdentity = {
  brandName: string;
  brandSubtitle: string;
  footerMessage: string;
  logoUrl?: string;
};

const initialGuideAnswers: GuideAnswers = {
  purpose: null,
  meaning: null,
  pieceType: null,
  presence: null
};

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const theme = {
  bg: "#f7f1e8",
  bgSoft: "#fbf7f2",
  card: "rgba(255,255,255,0.74)",
  cardStrong: "rgba(255,255,255,0.88)",
  text: "#221d17",
  textSoft: "#67584a",
  textMuted: "#837364",
  accent: "#8b6338",
  accentDark: "#2b221b",
  accentSoft: "#f0e3d3",
  border: "rgba(146, 116, 83, 0.12)",
  borderStrong: "rgba(146, 116, 83, 0.18)",
  shadow: "0 18px 40px rgba(71, 49, 27, 0.06)",
  shadowStrong: "0 22px 52px rgba(71, 49, 27, 0.08)"
};

const fallbackSiteIdentity: SiteIdentity = {
  brandName: "Arte Dorado",
  brandSubtitle: "Joyería artesanal colombiana",
  footerMessage: "Joyas artesanales pensadas para acompañar historias, momentos y personas."
};

function useResponsive() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  const [isTablet, setIsTablet] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 768 && window.innerWidth < 1100;
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1100);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile, isTablet };
}

function useGlobalSiteIdentity() {
  const [siteIdentity, setSiteIdentity] = useState<SiteIdentity>(fallbackSiteIdentity);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSiteIdentity() {
      try {
        const response = await fetch(`${apiBase}/api/site-settings`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la identidad del sitio.");
        }

        const data = await response.json();

        setSiteIdentity({
          brandName: data.brandName ?? fallbackSiteIdentity.brandName,
          brandSubtitle: data.brandSubtitle ?? fallbackSiteIdentity.brandSubtitle,
          footerMessage: data.footerMessage ?? fallbackSiteIdentity.footerMessage,
          logoUrl: data.logoUrl
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    loadSiteIdentity();

    return () => controller.abort();
  }, []);

  return siteIdentity;
}

function useHomeData() {
  const [homeData, setHomeData] = useState<HomeData>({
    site: {
      brandName: "Arte Dorado",
      brandSubtitle: "Joyería artesanal colombiana",
      footerMessage: "Joyas artesanales pensadas para acompañar historias, momentos y personas."
    },
    hero: {
      eyebrow: "Boutique digital guiada",
      title: "Encuentra una pieza con historia, intención y presencia.",
      subtitle:
        "Arte Dorado busca sentirse más cercano a una boutique curada que a un catálogo estándar.",
      text:
        "Descubre joyas artesanales con una experiencia más cálida, orientada y significativa.",
      ctaLabel: "Quiero que me guíen",
      ctaLink: "/guia"
    },
    sections: []
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadHomeData() {
      try {
        const response = await fetch(`${apiBase}/api/home`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la Home.");
        }

        const data = await response.json();

        setHomeData({
          site: {
            brandName: data.site?.brandName ?? "Arte Dorado",
            brandSubtitle: data.site?.brandSubtitle ?? "Joyería artesanal colombiana",
            footerMessage:
              data.site?.footerMessage ??
              "Joyas artesanales pensadas para acompañar historias, momentos y personas.",
            logoUrl: data.site?.logoUrl
          },
          hero: {
            eyebrow: data.hero?.eyebrow ?? "Boutique digital guiada",
            title: data.hero?.title ?? "Encuentra una pieza con historia, intención y presencia.",
            subtitle:
              data.hero?.subtitle ??
              "Arte Dorado busca sentirse más cercano a una boutique curada que a un catálogo estándar.",
            text:
              data.hero?.text ??
              "Descubre joyas artesanales con una experiencia más cálida, orientada y significativa.",
            ctaLabel: data.hero?.ctaLabel ?? "Quiero que me guíen",
            ctaLink: data.hero?.ctaLink ?? "/guia",
            videoUrl: data.hero?.videoUrl,
            imageUrl: data.hero?.imageUrl
          },
          sections: Array.isArray(data.sections) ? data.sections : []
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    loadHomeData();

    return () => controller.abort();
  }, []);

  return homeData;
}

function useNavigationItems() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([
    {
      id: "guia",
      label: "Guía",
      destination: "/guia",
      order: 1,
      isActive: true,
      linkType: "interno",
      openInNewTab: false,
      isExternal: false
    },
    {
      id: "colecciones",
      label: "Colecciones",
      destination: "/colecciones",
      order: 2,
      isActive: true,
      linkType: "interno",
      openInNewTab: false,
      isExternal: false
    },
    {
      id: "catalogo",
      label: "Ver catálogo",
      destination: "/catalogo",
      order: 3,
      isActive: true,
      linkType: "interno",
      openInNewTab: false,
      isExternal: false
    }
  ]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadNavigation() {
      try {
        const response = await fetch(`${apiBase}/api/navigation`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la navegación.");
        }

        const data = await response.json();
        const items = Array.isArray(data.navigation) ? data.navigation : [];

        if (items.length > 0) {
          setNavigationItems(items);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    loadNavigation();

    return () => controller.abort();
  }, []);

  return navigationItems;
}

function pageShellStyle(): React.CSSProperties {
  return {
    minHeight: "100vh",
    background: `linear-gradient(180deg, ${theme.bg} 0%, ${theme.bgSoft} 100%)`,
    color: theme.text,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };
}

function containerStyle(isMobile: boolean): React.CSSProperties {
  return {
    maxWidth: 1240,
    margin: "0 auto",
    padding: isMobile ? "0 16px" : "0 24px"
  };
}

function headerStyle(): React.CSSProperties {
  return {
    position: "sticky",
    top: 0,
    zIndex: 30,
    backdropFilter: "blur(16px)",
    background: "rgba(247, 241, 232, 0.78)",
    borderBottom: `1px solid ${theme.border}`
  };
}

function navLinkStyle(): React.CSSProperties {
  return {
    textDecoration: "none",
    color: theme.textSoft,
    fontWeight: 600,
    fontSize: 14,
    padding: "8px 0"
  };
}

function primaryButtonStyle(isMobile = false): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 999,
    padding: isMobile ? "13px 18px" : "14px 22px",
    background: theme.accentDark,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: isMobile ? 14 : 15,
    boxShadow: "0 12px 26px rgba(43, 34, 27, 0.16)",
    cursor: "pointer",
    textAlign: "center"
  };
}

function secondaryButtonStyle(isMobile = false): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: isMobile ? "13px 18px" : "14px 22px",
    background: "rgba(255,255,255,0.88)",
    color: theme.text,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: isMobile ? 14 : 15,
    border: `1px solid ${theme.borderStrong}`,
    cursor: "pointer",
    textAlign: "center"
  };
}

function cardStyle(isMobile = false): React.CSSProperties {
  return {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: isMobile ? 22 : 28,
    padding: isMobile ? 22 : 30,
    boxShadow: theme.shadow
  };
}

function sectionEyebrowStyle(): React.CSSProperties {
  return {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: theme.accent,
    fontWeight: 800
  };
}

function pageTitleStyle(isMobile: boolean, isTablet: boolean): React.CSSProperties {
  return {
    margin: "0 0 14px",
    fontSize: isMobile ? 36 : isTablet ? 44 : 52,
    lineHeight: 0.98,
    letterSpacing: "-0.04em"
  };
}

function pageIntroStyle(isMobile: boolean): React.CSSProperties {
  return {
    margin: 0,
    color: theme.textSoft,
    lineHeight: 1.8,
    fontSize: isMobile ? 16 : 17,
    maxWidth: 760
  };
}

function sectionSpacingStyle(isMobile: boolean): React.CSSProperties {
  return {
    marginBottom: isMobile ? 26 : 34
  };
}

function footerPanelStyle(isMobile: boolean): React.CSSProperties {
  return {
    background: "linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(247,241,232,0.85) 100%)",
    border: `1px solid ${theme.border}`,
    borderRadius: isMobile ? 24 : 30,
    padding: isMobile ? "22px 20px" : "28px 30px",
    boxShadow: theme.shadow
  };
}

function normalizeText(value?: string | null): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function productSearchBlob(product: Product): string {
  const parts = [
    product.name,
    product.category,
    product.description,
    product.descriptionLong,
    product.collection,
    product.occasion,
    product.meaning,
    product.material,
    product.detail,
    product.style,
    ...product.attributes.map((a) => `${a.label} ${a.value}`)
  ];

  return normalizeText(parts.filter(Boolean).join(" "));
}

function scoreProductForGuide(product: Product, answers: GuideAnswers): number {
  const blob = productSearchBlob(product);
  let score = 0;

  if (answers.pieceType) {
    const pieceMap: Record<string, string[]> = {
      aretes: ["arete", "earring", "pendiente"],
      collar: ["collar", "cadena", "necklace"],
      pulsera: ["pulsera", "bracelet"],
      anillo: ["anillo", "ring"],
      descubrir: []
    };

    const targets = pieceMap[answers.pieceType] ?? [];
    if (targets.some((target) => blob.includes(target))) {
      score += 5;
    }
  }

  if (answers.meaning) {
    const meaningMap: Record<string, string[]> = {
      amor: ["amor", "love", "romance"],
      proteccion: ["proteccion", "protección", "proteger", "amparo"],
      elegancia: ["elegancia", "elegante", "sofisticado", "sofisticada"],
      naturaleza: ["naturaleza", "natural", "floral", "organico", "orgánico"],
      luz: ["luz", "brillo", "luminoso", "radiante"],
      fuerza: ["fuerza", "fuerte", "energia", "energía", "poder"]
    };

    const targets = meaningMap[answers.meaning] ?? [];
    if (targets.some((target) => blob.includes(normalizeText(target)))) {
      score += 4;
    }
  }

  if (answers.presence) {
    const presenceMap: Record<string, string[]> = {
      sutil: ["sutil", "delicado", "delicada", "minimal", "fino", "pequeno", "pequeño"],
      equilibrado: ["equilibrado", "equilibrada", "clasico", "clásico", "versatil", "versátil"],
      protagonista: ["protagonista", "statement", "grande", "intenso", "presencia", "bold"]
    };

    const targets = presenceMap[answers.presence] ?? [];
    if (targets.some((target) => blob.includes(normalizeText(target)))) {
      score += 3;
    }
  }

  if (answers.purpose === "regalo") {
    if (
      blob.includes("regalo") ||
      blob.includes("obsequio") ||
      blob.includes("especial") ||
      blob.includes("significado")
    ) {
      score += 2;
    }
  }

  if (answers.purpose === "para_mi") {
    if (
      blob.includes("uso diario") ||
      blob.includes("versatil") ||
      blob.includes("versátil") ||
      blob.includes("personal")
    ) {
      score += 2;
    }
  }

  return score;
}

function getTopGuidedProducts(products: Product[], answers: GuideAnswers, limit = 3): Product[] {
  const scored = products.map((product, index) => ({
    product,
    score: scoreProductForGuide(product, answers),
    index
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });

  return scored.slice(0, limit).map((item) => item.product);
}

function SiteHeader({
  siteIdentity,
  navigationItems
}: {
  siteIdentity: SiteIdentity;
  navigationItems: NavigationItem[];
}) {
  const { isMobile } = useResponsive();

  function renderNavItem(item: NavigationItem, isLast: boolean) {
    const sharedStyle = isLast ? primaryButtonStyle(isMobile) : navLinkStyle();

    if (item.isExternal) {
      return (
        <a
          key={item.id}
          href={item.destination}
          target={item.openInNewTab ? "_blank" : undefined}
          rel={item.openInNewTab ? "noreferrer" : undefined}
          style={sharedStyle}
        >
          {item.label}
        </a>
      );
    }

    return (
      <Link key={item.id} to={item.destination} style={sharedStyle}>
        {item.label}
      </Link>
    );
  }

  return (
    <header style={headerStyle()}>
      <div
        style={{
          ...containerStyle(isMobile),
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 12 : 16,
          minHeight: isMobile ? "auto" : 82,
          paddingTop: isMobile ? 14 : 0,
          paddingBottom: isMobile ? 14 : 0
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: theme.text,
            display: "flex",
            gap: 12,
            alignItems: "center"
          }}
        >
          {siteIdentity.logoUrl ? (
            <img
              src={siteIdentity.logoUrl}
              alt={siteIdentity.brandName}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
                boxShadow: "0 6px 14px rgba(43,34,27,0.10)"
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #c79a62 0%, #8f6232 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: "0 8px 18px rgba(43,34,27,0.12)"
              }}
            >
              ✦
            </div>
          )}

          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{siteIdentity.brandName}</div>
            <div style={{ fontSize: 12, color: theme.textSoft }}>{siteIdentity.brandSubtitle}</div>
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            gap: isMobile ? 12 : 20,
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          {navigationItems.map((item, index) => renderNavItem(item, index === navigationItems.length - 1))}
        </nav>
      </div>
    </header>
  );
}

function SiteFooter({ siteIdentity }: { siteIdentity: SiteIdentity }) {
  const { isMobile } = useResponsive();

  return (
    <footer
      style={{
        marginTop: 68,
        padding: isMobile ? "10px 0 42px" : "18px 0 56px"
      }}
    >
      <div style={containerStyle(isMobile)}>
        <div style={footerPanelStyle(isMobile)}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
              gap: isMobile ? 20 : 28,
              alignItems: "start"
            }}
          >
            <div>
              <div style={{ ...sectionEyebrowStyle(), marginBottom: 10 }}>Marca</div>
              <div style={{ fontWeight: 800, fontSize: isMobile ? 22 : 26, marginBottom: 10 }}>
                {siteIdentity.brandName}
              </div>
              <p style={{ margin: 0, color: theme.textSoft, lineHeight: 1.8, maxWidth: 620 }}>
                {siteIdentity.footerMessage}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: 10
              }}
            >
              <div style={{ ...sectionEyebrowStyle(), marginBottom: 2 }}>Experiencia</div>
              <div style={{ color: theme.textSoft, lineHeight: 1.7 }}>Curaduría más clara</div>
              <div style={{ color: theme.textSoft, lineHeight: 1.7 }}>Navegación más guiada</div>
              <div style={{ color: theme.textSoft, lineHeight: 1.7 }}>Base lista para rebranding</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function GuideStep({
  title,
  options,
  value,
  onSelect
}: {
  title: string;
  options: Array<{ label: string; value: string }>;
  value: string | null;
  onSelect: (value: string) => void;
}) {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        paddingBottom: 22,
        marginBottom: 22,
        borderBottom: `1px solid ${theme.border}`
      }}
    >
      <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, marginBottom: 14 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              style={{
                border: `1px solid ${active ? theme.accentDark : theme.border}`,
                background: active ? theme.accentDark : "#fff",
                color: active ? "#fff" : theme.textSoft,
                borderRadius: 999,
                padding: isMobile ? "10px 12px" : "11px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GuideMetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        paddingBottom: 10,
        borderBottom: `1px solid ${theme.border}`
      }}
    >
      <span style={{ color: theme.textMuted, fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 700, color: theme.text, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { isMobile } = useResponsive();
  const visibleAttributes = product.attributes.slice(0, 2);

  return (
    <article
      style={{
        background: theme.cardStrong,
        borderRadius: 26,
        overflow: "hidden",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadowStrong,
        transition: "transform 160ms ease, box-shadow 160ms ease"
      }}
    >
      <div
        style={{
          height: isMobile ? 240 : 300,
          background: "linear-gradient(180deg, #efe4d6 0%, #e7d6c1 100%)"
        }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9a846f",
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Sin imagen
          </div>
        )}
      </div>

      <div style={{ padding: isMobile ? 18 : 22 }}>
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: theme.accent,
            fontWeight: 800,
            marginBottom: 12
          }}
        >
          {product.category}
        </div>

        <h3
          style={{
            margin: "0 0 12px",
            fontSize: isMobile ? 21 : 24,
            lineHeight: 1.15
          }}
        >
          {product.name}
        </h3>

        <p
          style={{
            margin: 0,
            minHeight: isMobile ? "auto" : 72,
            color: theme.textSoft,
            fontSize: 14,
            lineHeight: 1.7
          }}
        >
          {product.description ?? "Producto seleccionado para una experiencia más curada y clara."}
        </p>

        {visibleAttributes.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 16
            }}
          >
            {visibleAttributes.map((attribute, index) => (
              <span
                key={`${attribute.label}-${attribute.value}-${index}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.96)",
                  border: `1px solid ${theme.border}`,
                  padding: "7px 10px",
                  fontSize: 12,
                  color: theme.textSoft,
                  fontWeight: 600
                }}
              >
                {attribute.label}: {attribute.value}
              </span>
            ))}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
            marginTop: 20,
            gap: 14
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 19 }}>{currency.format(product.price)}</div>

          <Link
            to={`/producto/${product.slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              background: theme.accentDark,
              color: "#fff",
              padding: "10px 14px",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            Ver producto
          </Link>
        </div>
      </div>
    </article>
  );
}

function LoadingGrid() {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        display: "grid",
        gap: 24,
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))"
      }}
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          style={{
            background: theme.cardStrong,
            borderRadius: 24,
            padding: 18,
            border: `1px solid ${theme.border}`
          }}
        >
          <div
            style={{
              height: isMobile ? 220 : 250,
              borderRadius: 18,
              background: "#eadfd1",
              marginBottom: 16
            }}
          />
          <div
            style={{
              height: 12,
              width: "60%",
              borderRadius: 999,
              background: "#ece3d9",
              marginBottom: 10
            }}
          />
          <div style={{ height: 12, borderRadius: 999, background: "#ece3d9", marginBottom: 10 }} />
          <div style={{ height: 12, borderRadius: 999, background: "#ece3d9", marginBottom: 10 }} />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        padding: 30,
        borderRadius: 24,
        background: "rgba(255,255,255,0.74)",
        border: `1px solid ${theme.border}`
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{title}</div>
      <div style={{ color: theme.textSoft, lineHeight: 1.7 }}>{text}</div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: 30,
        borderRadius: 24,
        background: "rgba(120, 34, 34, 0.06)",
        border: "1px solid rgba(120, 34, 34, 0.12)"
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8, color: "#742c2c" }}>
        No pudimos cargar la información
      </div>
      <div style={{ color: "#7a4444", lineHeight: 1.7 }}>{message}</div>
    </div>
  );
}

function getLabel(value: string | null, map: Record<string, string>, fallback: string) {
  if (!value) return fallback;
  return map[value] ?? fallback;
}

function HomePage({
  siteIdentity,
  navigationItems
}: {
  siteIdentity: SiteIdentity;
  navigationItems: NavigationItem[];
}) {
  const { isMobile, isTablet } = useResponsive();
  const homeData = useHomeData();

  const mergedSiteIdentity: SiteIdentity = {
    brandName: homeData.site.brandName ?? siteIdentity.brandName,
    brandSubtitle: homeData.site.brandSubtitle ?? siteIdentity.brandSubtitle,
    footerMessage: homeData.site.footerMessage ?? siteIdentity.footerMessage,
    logoUrl: homeData.site.logoUrl ?? siteIdentity.logoUrl
  };

  const heroLink =
    typeof homeData.hero.ctaLink === "string" && homeData.hero.ctaLink.trim()
      ? homeData.hero.ctaLink
      : "/guia";

  const nonHeroSections = homeData.sections.filter((section) => section.key !== "hero");

  function getSectionLink(section: HomeSection) {
    if (section.ctaLink?.trim()) return section.ctaLink;

    if (section.key === "guia") return "/guia";
    if (section.key === "catalogo" || section.key === "destacados") return "/catalogo";
    if (section.key === "colecciones" || section.key === "significados") return "/colecciones";

    return "/catalogo";
  }

  function getSectionTitle(section: HomeSection) {
    return section.title?.trim() ? section.title : section.name;
  }

  function getSectionDescription(section: HomeSection) {
    if (section.text?.trim()) return section.text;
    if (section.subtitle?.trim()) return section.subtitle;
    return "Bloque editorial configurable desde Airtable.";
  }

  function getToneBackground(tone?: string) {
    switch ((tone ?? "").toLowerCase()) {
      case "cálido":
      case "calido":
        return "linear-gradient(180deg, rgba(244,232,216,0.95) 0%, rgba(255,255,255,0.9) 100%)";
      case "neutro":
        return "linear-gradient(180deg, rgba(240,236,231,0.95) 0%, rgba(255,255,255,0.9) 100%)";
      default:
        return "rgba(255,255,255,0.82)";
    }
  }

  function renderSection(section: HomeSection) {
    const title = getSectionTitle(section);
    const description = getSectionDescription(section);
    const link = getSectionLink(section);
    const ctaLabel = section.ctaLabel?.trim() ? section.ctaLabel : "Explorar";

    const media = section.videoUrl ? (
      <video
        src={section.videoUrl}
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.22,
          pointerEvents: "none"
        }}
      />
    ) : section.imageUrl ? (
      <img
        src={section.imageUrl}
        alt={title}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.14,
          pointerEvents: "none"
        }}
      />
    ) : null;

    if (section.key === "entrada_dual" || section.key === "guia") {
      return (
        <article
          key={section.id}
          style={{
            ...cardStyle(isMobile),
            background: getToneBackground(section.backgroundTone),
            position: "relative",
            overflow: "hidden"
          }}
        >
          {media}
          <div style={{ position: "relative", zIndex: 1 }}>
            {section.eyebrow ? <div style={{ ...sectionEyebrowStyle(), marginBottom: 10 }}>{section.eyebrow}</div> : null}

            <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: isMobile ? 24 : 30 }}>
              {title}
            </h3>

            {section.subtitle ? (
              <p
                style={{
                  margin: "0 0 10px",
                  color: theme.textSoft,
                  lineHeight: 1.8,
                  fontWeight: 600
                }}
              >
                {section.subtitle}
              </p>
            ) : null}

            <p style={{ margin: "0 0 18px", color: theme.textSoft, lineHeight: 1.8 }}>
              {description}
            </p>

            <Link to={link} style={primaryButtonStyle(isMobile)}>
              {ctaLabel}
            </Link>
          </div>
        </article>
      );
    }

    if (section.key === "significados" || section.key === "destacados") {
      return (
        <article
          key={section.id}
          style={{
            ...cardStyle(isMobile),
            background: getToneBackground(section.backgroundTone),
            position: "relative",
            overflow: "hidden",
            minHeight: isMobile ? 260 : 300,
            gridColumn: isMobile ? "auto" : "span 2"
          }}
        >
          {media}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.48) 0%, rgba(247,241,232,0.72) 100%)"
            }}
          />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
            {section.eyebrow ? <div style={{ ...sectionEyebrowStyle(), marginBottom: 10 }}>{section.eyebrow}</div> : null}

            <h3
              style={{
                marginTop: 0,
                marginBottom: 14,
                fontSize: isMobile ? 28 : 40,
                lineHeight: 1.02,
                letterSpacing: "-0.03em"
              }}
            >
              {title}
            </h3>

            {section.subtitle ? (
              <p
                style={{
                  margin: "0 0 12px",
                  color: theme.textSoft,
                  lineHeight: 1.8,
                  fontWeight: 600,
                  fontSize: isMobile ? 16 : 18
                }}
              >
                {section.subtitle}
              </p>
            ) : null}

            <p
              style={{
                margin: "0 0 20px",
                color: theme.textSoft,
                lineHeight: 1.82,
                maxWidth: 680
              }}
            >
              {description}
            </p>

            <Link to={link} style={primaryButtonStyle(isMobile)}>
              {ctaLabel}
            </Link>
          </div>
        </article>
      );
    }

    return (
      <article
        key={section.id}
        style={{
          ...cardStyle(isMobile),
          background: getToneBackground(section.backgroundTone),
          position: "relative",
          overflow: "hidden"
        }}
      >
        {media}
        <div style={{ position: "relative", zIndex: 1 }}>
          {section.eyebrow ? <div style={{ ...sectionEyebrowStyle(), marginBottom: 10 }}>{section.eyebrow}</div> : null}

          <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: isMobile ? 24 : 28 }}>
            {title}
          </h3>

          {section.subtitle ? (
            <p
              style={{
                margin: "0 0 10px",
                color: theme.textSoft,
                lineHeight: 1.8,
                fontWeight: 600
              }}
            >
              {section.subtitle}
            </p>
          ) : null}

          <p style={{ margin: "0 0 18px", color: theme.textSoft, lineHeight: 1.8 }}>
            {description}
          </p>

          <Link to={link} style={primaryButtonStyle(isMobile)}>
            {ctaLabel}
          </Link>
        </div>
      </article>
    );
  }

  return (
    <div style={pageShellStyle()}>
      <SiteHeader siteIdentity={mergedSiteIdentity} navigationItems={navigationItems} />

      <main>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            padding: isMobile ? "38px 0 28px" : "64px 0 42px",
            minHeight: isMobile ? 520 : 660,
            display: "flex",
            alignItems: "center"
          }}
        >
          {homeData.hero.videoUrl ? (
            <video
              src={homeData.hero.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.32,
                pointerEvents: "none"
              }}
            />
          ) : homeData.hero.imageUrl ? (
            <img
              src={homeData.hero.imageUrl}
              alt={homeData.hero.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.16,
                pointerEvents: "none"
              }}
            />
          ) : null}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(247,241,232,0.68) 0%, rgba(251,247,242,0.76) 100%)"
            }}
          />

          <div
            style={{
              position: "absolute",
              top: -80,
              right: -40,
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "rgba(184,138,86,0.10)",
              filter: "blur(60px)",
              pointerEvents: "none"
            }}
          />

          <div
            style={{
              ...containerStyle(isMobile),
              position: "relative",
              zIndex: 1
            }}
          >
            <div style={{ maxWidth: isMobile ? "100%" : 840 }}>
              <div style={{ ...sectionEyebrowStyle(), marginBottom: 16 }}>{homeData.hero.eyebrow}</div>

              <h1
                style={{
                  margin: "0 0 20px",
                  fontSize: isMobile ? 42 : isTablet ? 58 : 76,
                  lineHeight: 0.93,
                  letterSpacing: "-0.055em",
                  maxWidth: 920
                }}
              >
                {homeData.hero.title}
              </h1>

              <p
                style={{
                  margin: "0 0 14px",
                  maxWidth: 760,
                  fontSize: isMobile ? 17 : 20,
                  lineHeight: 1.8,
                  color: theme.textSoft,
                  fontWeight: 600
                }}
              >
                {homeData.hero.subtitle}
              </p>

              <p
                style={{
                  margin: 0,
                  maxWidth: 760,
                  fontSize: isMobile ? 15 : 17,
                  lineHeight: 1.82,
                  color: theme.textSoft
                }}
              >
                {homeData.hero.text}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  marginTop: 30,
                  flexWrap: "wrap",
                  flexDirection: isMobile ? "column" : "row"
                }}
              >
                <Link to={heroLink} style={primaryButtonStyle(isMobile)}>
                  {homeData.hero.ctaLabel}
                </Link>
                <Link to="/colecciones" style={secondaryButtonStyle(isMobile)}>
                  Ver colecciones
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? "10px 0 36px" : "20px 0 48px" }}>
          <div style={containerStyle(isMobile)}>
            <div style={{ ...sectionEyebrowStyle(), marginBottom: 22 }}>Experiencia configurable</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                gap: 18
              }}
            >
              {nonHeroSections.length > 0 ? (
                nonHeroSections.map((section) => renderSection(section))
              ) : (
                <>
                  <article style={cardStyle(isMobile)}>
                    <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: isMobile ? 24 : 28 }}>
                      Home modular
                    </h3>
                    <p style={{ margin: "0 0 18px", color: theme.textSoft, lineHeight: 1.8 }}>
                      Las secciones de inicio activas aparecerán aquí cuando estén configuradas desde Airtable.
                    </p>
                  </article>

                  <article style={cardStyle(isMobile)}>
                    <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: isMobile ? 24 : 28 }}>
                      Base lista
                    </h3>
                    <p style={{ margin: 0, color: theme.textSoft, lineHeight: 1.8 }}>
                      La arquitectura ya está preparada para una Home realmente parametrizable.
                    </p>
                  </article>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter siteIdentity={mergedSiteIdentity} />
    </div>
  );
}

function GuiaPage({
  siteIdentity,
  navigationItems
}: {
  siteIdentity: SiteIdentity;
  navigationItems: NavigationItem[];
}) {
  const { isMobile, isTablet } = useResponsive();

  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideAnswers, setGuideAnswers] = useState<GuideAnswers>(initialGuideAnswers);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const catalogRes = await fetch(`${apiBase}/api/products`, {
          signal: controller.signal
        });

        if (!catalogRes.ok) throw new Error("No se pudo cargar el catálogo.");

        const catalogData = await catalogRes.json();
        setCatalog(catalogData.products ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const guideCompleted = Boolean(
    guideAnswers.purpose &&
      guideAnswers.meaning &&
      guideAnswers.pieceType &&
      guideAnswers.presence
  );

  const guidedProducts = useMemo(() => {
    if (catalog.length === 0) return [];
    if (!guideCompleted) return catalog.slice(0, 3);
    return getTopGuidedProducts(catalog, guideAnswers, 3);
  }, [catalog, guideAnswers, guideCompleted]);

  const guideSummaryTitle = useMemo(() => {
    if (!guideAnswers.meaning && !guideAnswers.presence) {
      return "Una selección pensada para acompañarte";
    }

    const meaningMap: Record<string, string> = {
      amor: "amor",
      proteccion: "protección",
      elegancia: "elegancia",
      naturaleza: "naturaleza",
      luz: "luz",
      fuerza: "fuerza"
    };

    const presenceMap: Record<string, string> = {
      sutil: "delicadeza",
      equilibrado: "equilibrio",
      protagonista: "presencia"
    };

    const meaning = guideAnswers.meaning ? meaningMap[guideAnswers.meaning] : "significado";
    const presence = guideAnswers.presence ? presenceMap[guideAnswers.presence] : "presencia";

    return `Piezas con ${meaning} y ${presence}`;
  }, [guideAnswers]);

  const guideSummaryText = useMemo(() => {
    const purposeLabel = getLabel(
      guideAnswers.purpose,
      { para_mi: "para ti", regalo: "para regalar" },
      "para una elección personal"
    );

    const pieceLabel = getLabel(
      guideAnswers.pieceType,
      {
        aretes: "aretes",
        collar: "collares",
        pulsera: "pulseras",
        anillo: "anillos",
        descubrir: "piezas abiertas al descubrimiento"
      },
      "piezas"
    );

    const meaningLabel = getLabel(
      guideAnswers.meaning,
      {
        amor: "amor",
        proteccion: "protección",
        elegancia: "elegancia",
        naturaleza: "naturaleza",
        luz: "luz",
        fuerza: "fuerza"
      },
      "significado"
    );

    const presenceLabel = getLabel(
      guideAnswers.presence,
      {
        sutil: "sutil",
        equilibrado: "equilibrado",
        protagonista: "con más presencia"
      },
      "equilibrado"
    );

    return `Esta selección se ordenó según tu intención: ${purposeLabel}, con foco en ${meaningLabel}, ${pieceLabel} y un carácter ${presenceLabel}.`;
  }, [guideAnswers]);

  const guideMatchText = useMemo(() => {
    if (!guideCompleted) {
      return "Completa las cuatro respuestas para que el sistema ordene el catálogo según afinidad real.";
    }

    if (guidedProducts.length === 0) {
      return "No encontramos coincidencias claras con este criterio.";
    }

    return `Mostramos los ${guidedProducts.length} productos con mayor afinidad según categoría, significado, atributos y presencia.`;
  }, [guideCompleted, guidedProducts]);

  function updateGuideAnswer(key: keyof GuideAnswers, value: string) {
    setGuideAnswers((current) => ({ ...current, [key]: value }));
  }

  function resetGuide() {
    setGuideAnswers(initialGuideAnswers);
  }

  return (
    <div style={pageShellStyle()}>
      <SiteHeader siteIdentity={siteIdentity} navigationItems={navigationItems} />
      <main style={{ padding: isMobile ? "34px 0" : "58px 0" }}>
        <div style={containerStyle(isMobile)}>
          <section style={sectionSpacingStyle(isMobile)}>
            <div style={{ ...sectionEyebrowStyle(), marginBottom: 12 }}>Guía asistida</div>

            <h1 style={pageTitleStyle(isMobile, isTablet)}>Te ayudamos a encontrar una pieza ideal</h1>

            <p style={pageIntroStyle(isMobile)}>
              Este es el primer paso hacia una experiencia más asesorada. Responde unas
              pocas preguntas para orientar mejor la búsqueda.
            </p>
          </section>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile || isTablet ? "1fr" : "1.15fr 0.85fr",
              gap: 22,
              alignItems: "start"
            }}
          >
            <div style={cardStyle(isMobile)}>
              <GuideStep
                title="1. ¿Buscas una pieza para ti o para regalar?"
                options={[
                  { label: "Para mí", value: "para_mi" },
                  { label: "Para regalar", value: "regalo" }
                ]}
                value={guideAnswers.purpose}
                onSelect={(value) => updateGuideAnswer("purpose", value)}
              />

              <GuideStep
                title="2. ¿Qué te gustaría transmitir o encontrar?"
                options={[
                  { label: "Amor", value: "amor" },
                  { label: "Protección", value: "proteccion" },
                  { label: "Elegancia", value: "elegancia" },
                  { label: "Naturaleza", value: "naturaleza" },
                  { label: "Luz", value: "luz" },
                  { label: "Fuerza", value: "fuerza" }
                ]}
                value={guideAnswers.meaning}
                onSelect={(value) => updateGuideAnswer("meaning", value)}
              />

              <GuideStep
                title="3. ¿Qué tipo de pieza te atrae más?"
                options={[
                  { label: "Aretes", value: "aretes" },
                  { label: "Collar", value: "collar" },
                  { label: "Pulsera", value: "pulsera" },
                  { label: "Anillo", value: "anillo" },
                  { label: "Quiero descubrir", value: "descubrir" }
                ]}
                value={guideAnswers.pieceType}
                onSelect={(value) => updateGuideAnswer("pieceType", value)}
              />

              <GuideStep
                title="4. ¿Prefieres algo sutil o con más presencia?"
                options={[
                  { label: "Sutil", value: "sutil" },
                  { label: "Equilibrado", value: "equilibrado" },
                  { label: "Protagonista", value: "protagonista" }
                ]}
                value={guideAnswers.presence}
                onSelect={(value) => updateGuideAnswer("presence", value)}
              />
            </div>

            <aside
              style={{
                ...cardStyle(isMobile),
                position: isMobile || isTablet ? "relative" : "sticky",
                top: isMobile || isTablet ? undefined : 96,
                background:
                  "linear-gradient(180deg, rgba(248,240,228,0.96) 0%, rgba(255,255,255,0.92) 100%)"
              }}
            >
              <div style={{ ...sectionEyebrowStyle(), marginBottom: 12 }}>Lectura de intención</div>

              <h2 style={{ margin: "0 0 12px", fontSize: isMobile ? 24 : 30, lineHeight: 1.08 }}>
                {guideSummaryTitle}
              </h2>

              <p style={{ margin: "0 0 14px", color: theme.textSoft, lineHeight: 1.8 }}>
                {guideSummaryText}
              </p>

              <p
                style={{
                  margin: 0,
                  color: theme.textMuted,
                  lineHeight: 1.75,
                  fontSize: 14
                }}
              >
                {guideMatchText}
              </p>

              <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
                <GuideMetaItem
                  label="Propósito"
                  value={getLabel(
                    guideAnswers.purpose,
                    { para_mi: "Para mí", regalo: "Para regalar" },
                    "Sin definir"
                  )}
                />
                <GuideMetaItem
                  label="Intención"
                  value={getLabel(
                    guideAnswers.meaning,
                    {
                      amor: "Amor",
                      proteccion: "Protección",
                      elegancia: "Elegancia",
                      naturaleza: "Naturaleza",
                      luz: "Luz",
                      fuerza: "Fuerza"
                    },
                    "Sin definir"
                  )}
                />
                <GuideMetaItem
                  label="Tipo"
                  value={getLabel(
                    guideAnswers.pieceType,
                    {
                      aretes: "Aretes",
                      collar: "Collar",
                      pulsera: "Pulsera",
                      anillo: "Anillo",
                      descubrir: "Descubrir"
                    },
                    "Sin definir"
                  )}
                />
                <GuideMetaItem
                  label="Presencia"
                  value={getLabel(
                    guideAnswers.presence,
                    {
                      sutil: "Sutil",
                      equilibrado: "Equilibrado",
                      protagonista: "Protagonista"
                    },
                    "Sin definir"
                  )}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 24,
                  flexWrap: "wrap",
                  flexDirection: isMobile ? "column" : "row"
                }}
              >
                <button
                  type="button"
                  style={{
                    ...primaryButtonStyle(isMobile),
                    opacity: guideCompleted ? 1 : 0.7,
                    cursor: guideCompleted ? "pointer" : "not-allowed"
                  }}
                  disabled={!guideCompleted}
                >
                  Selección calculada
                </button>

                <button type="button" style={secondaryButtonStyle(isMobile)} onClick={resetGuide}>
                  Reiniciar guía
                </button>
              </div>
            </aside>
          </div>

          <section style={{ marginTop: 36 }}>
            <div style={{ ...sectionEyebrowStyle(), marginBottom: 14 }}>Resultado guiado</div>

            {loading ? (
              <LoadingGrid />
            ) : error ? (
              <ErrorState message={error} />
            ) : guidedProducts.length === 0 ? (
              <EmptyState
                title="No encontramos productos para este criterio"
                text="Prueba con otra combinación o amplía la intención de búsqueda."
              />
            ) : (
              <>
                <div style={{ ...cardStyle(isMobile), marginBottom: 26 }}>
                  <div style={{ ...sectionEyebrowStyle(), marginBottom: 10 }}>Selección ordenada</div>

                  <h3 style={{ margin: "0 0 10px", fontSize: isMobile ? 24 : 30, lineHeight: 1.08 }}>
                    {guideSummaryTitle}
                  </h3>

                  <p style={{ margin: "0 0 10px", color: theme.textSoft, lineHeight: 1.8 }}>
                    {guideSummaryText}
                  </p>

                  <p style={{ margin: 0, color: theme.textMuted, lineHeight: 1.75 }}>
                    {guideMatchText}
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 24,
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(270px, 1fr))"
                  }}
                >
                  {guidedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      <SiteFooter siteIdentity={siteIdentity} />
    </div>
  );
}

function ColeccionesPage({
  siteIdentity,
  navigationItems
}: {
  siteIdentity: SiteIdentity;
  navigationItems: NavigationItem[];
}) {
  const { isMobile, isTablet } = useResponsive();

  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCollections() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiBase}/api/collections`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar las colecciones.");
        }

        const data = await response.json();
        setCollections(data.collections ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      } finally {
        setLoading(false);
      }
    }

    loadCollections();

    return () => controller.abort();
  }, []);

  return (
    <div style={pageShellStyle()}>
      <SiteHeader siteIdentity={siteIdentity} navigationItems={navigationItems} />
      <main style={{ padding: isMobile ? "34px 0" : "58px 0" }}>
        <div style={containerStyle(isMobile)}>
          <section style={sectionSpacingStyle(isMobile)}>
            <div style={{ ...sectionEyebrowStyle(), marginBottom: 12 }}>Colecciones</div>

            <h1 style={pageTitleStyle(isMobile, isTablet)}>
              Descubre por sensibilidad, intención y estilo
            </h1>

            <p style={pageIntroStyle(isMobile)}>
              No todas las personas eligen una joya solo por forma. A veces la elección
              comienza por lo que quieren transmitir, regalar o acompañar.
            </p>
          </section>

          {loading ? (
            <LoadingGrid />
          ) : error ? (
            <ErrorState message={error} />
          ) : collections.length === 0 ? (
            <EmptyState
              title="Aún no hay colecciones activas"
              text="Cuando haya colecciones disponibles en Airtable, aparecerán aquí."
            />
          ) : (
            <section
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                gap: 22
              }}
            >
              {collections.map((collection) => (
                <article
                  key={collection.id}
                  style={{
                    ...cardStyle(isMobile),
                    position: "relative",
                    overflow: "hidden",
                    minHeight: isMobile ? 420 : 470
                  }}
                >
                  {collection.videoUrl ? (
                    <video
                      src={collection.videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls={false}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 0.34,
                        pointerEvents: "none",
                        zIndex: 0
                      }}
                    />
                  ) : collection.imageUrl ? (
                    <img
                      src={collection.imageUrl}
                      alt={collection.name}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 0.16,
                        pointerEvents: "none",
                        zIndex: 0
                      }}
                    />
                  ) : null}

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(247,241,232,0.7) 100%)",
                      zIndex: 1
                    }}
                  />

                  <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{ ...sectionEyebrowStyle(), marginBottom: 12 }}>Colección</div>

                    <h2
                      style={{
                        margin: "0 0 12px",
                        fontSize: isMobile ? 28 : 34,
                        lineHeight: 1.08,
                        letterSpacing: "-0.03em"
                      }}
                    >
                      {collection.name}
                    </h2>

                    <p style={{ margin: "0 0 12px", color: theme.textSoft, lineHeight: 1.8 }}>
                      {collection.shortDescription}
                    </p>

                    <p style={{ margin: "0 0 22px", color: theme.textSoft, lineHeight: 1.8 }}>
                      {collection.editorialText}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        flexDirection: isMobile ? "column" : "row"
                      }}
                    >
                      <Link to="/catalogo" style={primaryButtonStyle(isMobile)}>
                        Explorar catálogo
                      </Link>
                      <Link to="/guia" style={secondaryButtonStyle(isMobile)}>
                        Quiero que me orienten
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          <section style={{ marginTop: 32 }}>
            <div style={cardStyle(isMobile)}>
              <div style={{ ...sectionEyebrowStyle(), marginBottom: 12 }}>Lógica editorial</div>

              <h3 style={{ margin: "0 0 10px", fontSize: isMobile ? 24 : 30, lineHeight: 1.08 }}>
                Una forma más curada de recorrer la tienda
              </h3>

              <p style={{ margin: 0, color: theme.textSoft, lineHeight: 1.8 }}>
                Esta sección existe para que la exploración no se reduzca a filtros fríos.
                Ahora las colecciones ya se alimentan directamente desde Airtable.
              </p>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter siteIdentity={siteIdentity} />
    </div>
  );
}

function ProductDetailPage({
  siteIdentity,
  navigationItems
}: {
  siteIdentity: SiteIdentity;
  navigationItems: NavigationItem[];
}) {
  const { isMobile, isTablet } = useResponsive();
  const { slug } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const productResponse = await fetch(`${apiBase}/api/products/${slug}`, {
          signal: controller.signal
        });

        if (!productResponse.ok) {
          if (productResponse.status === 404) {
            throw new Error("No encontramos este producto.");
          }
          throw new Error("No se pudo cargar el producto.");
        }

        const productData = await productResponse.json();
        setProduct(productData.product ?? null);

        try {
          const recommendedResponse = await fetch(`${apiBase}/api/products/recommendations`, {
            signal: controller.signal
          });

          if (recommendedResponse.ok) {
            const recommendedData = await recommendedResponse.json();
            const recommendedProducts = (recommendedData.recommendations ?? []).filter(
              (item: Product) => item.slug !== slug
            );
            setRecommended(recommendedProducts.slice(0, 3));
          }
        } catch {
          setRecommended([]);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();

    return () => controller.abort();
  }, [slug]);

  return (
    <div style={pageShellStyle()}>
      <SiteHeader siteIdentity={siteIdentity} navigationItems={navigationItems} />
      <main style={{ padding: isMobile ? "34px 0" : "58px 0" }}>
        <div style={containerStyle(isMobile)}>
          {loading ? (
            <LoadingGrid />
          ) : error ? (
            <ErrorState message={error} />
          ) : !product ? (
            <EmptyState
              title="Producto no encontrado"
              text="No pudimos encontrar este producto."
            />
          ) : (
            <>
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1fr",
                  gap: 30,
                  alignItems: "start",
                  marginBottom: 38
                }}
              >
                <div style={{ ...cardStyle(isMobile), padding: isMobile ? 18 : 22 }}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: isMobile ? 360 : 540,
                        objectFit: "cover",
                        borderRadius: 22,
                        display: "block"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: isMobile ? 360 : 540,
                        borderRadius: 22,
                        background: "linear-gradient(180deg, #efe4d6 0%, #e7d6c1 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9a846f",
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      Sin imagen
                    </div>
                  )}
                </div>

                <div style={cardStyle(isMobile)}>
                  <div style={{ ...sectionEyebrowStyle(), marginBottom: 12 }}>{product.category}</div>

                  <h1
                    style={{
                      margin: "0 0 14px",
                      fontSize: isMobile ? 34 : 50,
                      lineHeight: 0.98,
                      letterSpacing: "-0.04em"
                    }}
                  >
                    {product.name}
                  </h1>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      marginBottom: 20
                    }}
                  >
                    {currency.format(product.price)}
                  </div>

                  <p
                    style={{
                      margin: "0 0 14px",
                      color: theme.textSoft,
                      lineHeight: 1.82,
                      fontSize: 16
                    }}
                  >
                    {product.description ?? "Producto curado para una experiencia más humana y significativa."}
                  </p>

                  {product.descriptionLong ? (
                    <p
                      style={{
                        margin: "0 0 20px",
                        color: theme.textSoft,
                        lineHeight: 1.82,
                        fontSize: 15
                      }}
                    >
                      {product.descriptionLong}
                    </p>
                  ) : null}

                  {product.attributes.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        marginBottom: 24
                      }}
                    >
                      {product.attributes.map((attribute, index) => (
                        <GuideMetaItem
                          key={`${attribute.label}-${attribute.value}-${index}`}
                          label={attribute.label}
                          value={attribute.value}
                        />
                      ))}
                    </div>
                  ) : null}

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      flexDirection: isMobile ? "column" : "row"
                    }}
                  >
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Hola, me interesa el producto "${product.name}".`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      style={primaryButtonStyle(isMobile)}
                    >
                      Consultar por WhatsApp
                    </a>

                    <Link to="/catalogo" style={secondaryButtonStyle(isMobile)}>
                      Volver al catálogo
                    </Link>
                  </div>
                </div>
              </section>

              <section>
                <div style={{ ...sectionEyebrowStyle(), marginBottom: 14 }}>También podría interesarte</div>

                {recommended.length === 0 ? (
                  <EmptyState
                    title="No hay sugerencias por ahora"
                    text="Cuando haya más productos disponibles, aparecerán aquí."
                  />
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gap: 24,
                      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))"
                    }}
                  >
                    {recommended.map((item) => (
                      <ProductCard key={item.id} product={item} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <SiteFooter siteIdentity={siteIdentity} />
    </div>
  );
}

function CatalogoPage({
  siteIdentity,
  navigationItems
}: {
  siteIdentity: SiteIdentity;
  navigationItems: NavigationItem[];
}) {
  const { isMobile, isTablet } = useResponsive();

  const [recommended, setRecommended] = useState<Product[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const catalogRes = await fetch(`${apiBase}/api/products`, {
          signal: controller.signal
        });

        if (!catalogRes.ok) throw new Error("No se pudo cargar el catálogo.");

        const catalogData = await catalogRes.json();
        const catalogProducts = catalogData.products ?? [];
        setCatalog(catalogProducts);

        try {
          const recommendedRes = await fetch(`${apiBase}/api/products/recommendations`, {
            signal: controller.signal
          });

          if (!recommendedRes.ok) throw new Error("No se pudieron cargar las recomendaciones.");

          const recommendedData = await recommendedRes.json();
          setRecommended(recommendedData.recommendations ?? []);
        } catch {
          setRecommended(catalogProducts.slice(0, 4));
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(catalog.map((p) => p.category).filter(Boolean)));
    return ["Todas", ...unique];
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todas" || product.category === selectedCategory;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.description ?? "").toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [catalog, selectedCategory, query]);

  return (
    <div style={pageShellStyle()}>
      <SiteHeader siteIdentity={siteIdentity} navigationItems={navigationItems} />
      <main style={{ padding: isMobile ? "34px 0" : "58px 0" }}>
        <div style={containerStyle(isMobile)}>
          <section style={sectionSpacingStyle(isMobile)}>
            <div style={{ ...sectionEyebrowStyle(), marginBottom: 12 }}>Catálogo</div>

            <h1 style={pageTitleStyle(isMobile, isTablet)}>Explora la colección</h1>

            <p style={pageIntroStyle(isMobile)}>
              Aquí vive la exploración libre: búsqueda, filtros y productos disponibles para
              recorrer con más autonomía.
            </p>
          </section>

          <section style={{ ...cardStyle(isMobile), marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                borderRadius: 18,
                padding: "0 14px",
                minHeight: 56,
                border: `1px solid ${theme.borderStrong}`
              }}
            >
              <span style={{ fontSize: 18, color: "#7c6b5c" }}>⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, categoría o descripción"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  width: "100%",
                  fontSize: 15,
                  color: theme.text
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
              {categories.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      border: `1px solid ${active ? theme.accentDark : theme.border}`,
                      background: active ? theme.accentDark : "#fff",
                      color: active ? "#fff" : theme.textSoft,
                      borderRadius: 999,
                      padding: "10px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </section>

          <section style={{ marginBottom: 38 }}>
            <div style={{ ...sectionEyebrowStyle(), marginBottom: 14 }}>Selección destacada</div>

            {loading ? (
              <LoadingGrid />
            ) : error ? (
              <ErrorState message={error} />
            ) : recommended.length === 0 ? (
              <EmptyState
                title="Aún no hay recomendados"
                text="Cuando haya productos destacados disponibles, aparecerán aquí."
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 24,
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(270px, 1fr))"
                }}
              >
                {recommended.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div style={{ ...sectionEyebrowStyle(), marginBottom: 14 }}>Productos</div>

            {loading ? (
              <LoadingGrid />
            ) : error ? (
              <ErrorState message={error} />
            ) : filteredCatalog.length === 0 ? (
              <EmptyState
                title="No encontramos productos con ese criterio"
                text="Prueba otra categoría o una búsqueda más amplia."
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 24,
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))"
                }}
              >
                {filteredCatalog.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter siteIdentity={siteIdentity} />
    </div>
  );
}

export function App() {
  const siteIdentity = useGlobalSiteIdentity();
  const navigationItems = useNavigationItems();

  return (
    <Routes>
      <Route path="/" element={<HomePage siteIdentity={siteIdentity} navigationItems={navigationItems} />} />
      <Route
        path="/guia"
        element={<GuiaPage siteIdentity={siteIdentity} navigationItems={navigationItems} />}
      />
      <Route
        path="/colecciones"
        element={<ColeccionesPage siteIdentity={siteIdentity} navigationItems={navigationItems} />}
      />
      <Route
        path="/catalogo"
        element={<CatalogoPage siteIdentity={siteIdentity} navigationItems={navigationItems} />}
      />
      <Route
        path="/producto/:slug"
        element={<ProductDetailPage siteIdentity={siteIdentity} navigationItems={navigationItems} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
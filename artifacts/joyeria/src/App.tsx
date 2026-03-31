import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, Link, useParams } from "react-router-dom";

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
};

type GuideAnswers = {
  purpose: string | null;
  meaning: string | null;
  pieceType: string | null;
  presence: string | null;
};

type SiteSettings = {
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

type NavigationItem = {
  id: string;
  label: string;
  destination: string;
  order: number;
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
  card: "rgba(255,255,255,0.72)",
  text: "#221d17",
  textSoft: "#67584a",
  accent: "#8b6338",
  accentDark: "#2b221b",
  border: "rgba(146, 116, 83, 0.12)"
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

function useSiteSettings() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    brandName: "Arte Dorado",
    brandSubtitle: "Joyería artesanal colombiana",
    footerMessage: "Joyas artesanales pensadas para acompañar historias, momentos y personas.",
    heroEyebrow: "Boutique digital guiada",
    heroTitle: "Encuentra una pieza con historia, intención y presencia.",
    heroSubtitle:
      "Arte Dorado busca sentirse más cercano a una boutique curada que a un catálogo estándar.",
    heroText:
      "Descubre joyas artesanales con una experiencia más cálida, orientada y significativa.",
    heroCtaLabel: "Quiero que me guíen",
    heroCtaLink: "/guia"
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadSiteSettings() {
      try {
        const response = await fetch(`${apiBase}/api/site-settings`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la configuración del sitio.");
        }

        const data = await response.json();

        setSiteSettings({
          brandName: data.brandName ?? "Arte Dorado",
          brandSubtitle: data.brandSubtitle ?? "Joyería artesanal colombiana",
          footerMessage:
            data.footerMessage ??
            "Joyas artesanales pensadas para acompañar historias, momentos y personas.",
          logoUrl: data.logoUrl,
          heroEyebrow: data.heroEyebrow ?? "Boutique digital guiada",
          heroTitle:
            data.heroTitle ?? "Encuentra una pieza con historia, intención y presencia.",
          heroSubtitle:
            data.heroSubtitle ??
            "Arte Dorado busca sentirse más cercano a una boutique curada que a un catálogo estándar.",
          heroText:
            data.heroText ??
            "Descubre joyas artesanales con una experiencia más cálida, orientada y significativa.",
          heroCtaLabel: data.heroCtaLabel ?? "Quiero que me guíen",
          heroCtaLink: data.heroCtaLink ?? "/guia",
          heroVideoUrl: data.heroVideoUrl,
          heroImageUrl: data.heroImageUrl
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    loadSiteSettings();

    return () => controller.abort();
  }, []);

  return siteSettings;
}

function useNavigationItems() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([
    { id: "guia", label: "Guía", destination: "/guia", order: 1 },
    { id: "colecciones", label: "Colecciones", destination: "/colecciones", order: 2 },
    { id: "catalogo", label: "Ver catálogo", destination: "/catalogo", order: 3 }
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
    background: `linear-gradient(180deg, ${theme.bg} 0%, #fbf7f2 100%)`,
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
    zIndex: 20,
    backdropFilter: "blur(14px)",
    background: "rgba(247, 241, 232, 0.82)",
    borderBottom: `1px solid ${theme.border}`
  };
}

function navLinkStyle(): React.CSSProperties {
  return {
    textDecoration: "none",
    color: theme.textSoft,
    fontWeight: 600,
    fontSize: 14
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
    boxShadow: "0 10px 24px rgba(43, 34, 27, 0.14)",
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
    background: "rgba(255,255,255,0.82)",
    color: theme.text,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: isMobile ? 14 : 15,
    border: `1px solid ${theme.border}`,
    cursor: "pointer",
    textAlign: "center"
  };
}

function cardStyle(isMobile = false): React.CSSProperties {
  return {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: isMobile ? 22 : 28,
    padding: isMobile ? 20 : 28,
    boxShadow: "0 18px 40px rgba(71, 49, 27, 0.06)"
  };
}

function SiteHeader() {
  const { isMobile } = useResponsive();
  const siteSettings = useSiteSettings();
  const navigationItems = useNavigationItems();

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
          minHeight: isMobile ? "auto" : 78,
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
          {siteSettings.logoUrl ? (
            <img
              src={siteSettings.logoUrl}
              alt={siteSettings.brandName}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0
              }}
            />
          ) : (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #b88a56 0%, #8f6232 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                flexShrink: 0
              }}
            >
              ✦
            </div>
          )}

          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{siteSettings.brandName}</div>
            <div style={{ fontSize: 12, color: theme.textSoft }}>
              {siteSettings.brandSubtitle}
            </div>
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            gap: isMobile ? 10 : 18,
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          {navigationItems.map((item, index) => {
            const isLast = index === navigationItems.length - 1;

            return (
              <Link
                key={item.id}
                to={item.destination}
                style={isLast ? primaryButtonStyle(isMobile) : navLinkStyle()}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  const { isMobile } = useResponsive();
  const siteSettings = useSiteSettings();

  return (
    <footer
      style={{
        marginTop: 56,
        borderTop: `1px solid ${theme.border}`,
        padding: isMobile ? "26px 0 38px" : "30px 0 46px"
      }}
    >
      <div style={containerStyle(isMobile)}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>{siteSettings.brandName}</div>
        <p style={{ margin: 0, color: theme.textSoft, maxWidth: 720, lineHeight: 1.7 }}>
          {siteSettings.footerMessage}
        </p>
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
        paddingBottom: 20,
        marginBottom: 20,
        borderBottom: `1px solid ${theme.border}`
      }}
    >
      <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, marginBottom: 12 }}>
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
      <span style={{ color: "#7b6b5d", fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 700, color: theme.text, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { isMobile } = useResponsive();

  return (
    <article
      style={{
        background: "rgba(255,255,255,0.82)",
        borderRadius: 24,
        overflow: "hidden",
        border: `1px solid ${theme.border}`,
        boxShadow: "0 18px 42px rgba(71, 49, 27, 0.08)"
      }}
    >
      <div
        style={{
          height: isMobile ? 240 : 290,
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

      <div style={{ padding: 18 }}>
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: theme.accent,
            fontWeight: 700,
            marginBottom: 10
          }}
        >
          {product.category}
        </div>

        <h3 style={{ margin: "0 0 10px", fontSize: isMobile ? 20 : 22, lineHeight: 1.2 }}>
          {product.name}
        </h3>

        <p
          style={{
            margin: 0,
            minHeight: isMobile ? "auto" : 68,
            color: theme.textSoft,
            fontSize: 14,
            lineHeight: 1.6
          }}
        >
          {product.description ??
            "Pieza artesanal curada para una experiencia más humana y significativa."}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
            marginTop: 18,
            gap: 14
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>{currency.format(product.price)}</div>

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
            Ver pieza
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
            background: "rgba(255,255,255,0.82)",
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
        padding: 28,
        borderRadius: 24,
        background: "rgba(255,255,255,0.7)",
        border: `1px solid ${theme.border}`
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{title}</div>
      <div style={{ color: theme.textSoft }}>{text}</div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: 28,
        borderRadius: 24,
        background: "rgba(120, 34, 34, 0.06)",
        border: "1px solid rgba(120, 34, 34, 0.12)"
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8, color: "#742c2c" }}>
        No pudimos cargar la información
      </div>
      <div style={{ color: "#7a4444" }}>{message}</div>
    </div>
  );
}

function getLabel(value: string | null, map: Record<string, string>, fallback: string) {
  if (!value) return fallback;
  return map[value] ?? fallback;
}

function HomePage() {
  const { isMobile, isTablet } = useResponsive();
  const siteSettings = useSiteSettings();

  const heroLink =
    typeof siteSettings.heroCtaLink === "string" && siteSettings.heroCtaLink.trim()
      ? siteSettings.heroCtaLink
      : "/guia";

  return (
    <div style={pageShellStyle()}>
      <SiteHeader />

      <main>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            padding: isMobile ? "34px 0 24px" : "56px 0 34px",
            minHeight: isMobile ? 520 : 640,
            display: "flex",
            alignItems: "center"
          }}
        >
          {siteSettings.heroVideoUrl ? (
            <video
              src={siteSettings.heroVideoUrl}
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
          ) : siteSettings.heroImageUrl ? (
            <img
              src={siteSettings.heroImageUrl}
              alt={siteSettings.heroTitle}
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
                "linear-gradient(180deg, rgba(247,241,232,0.68) 0%, rgba(251,247,242,0.74) 100%)"
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
            <div
              style={{
                maxWidth: isMobile ? "100%" : 820
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: theme.accent,
                  fontWeight: 800,
                  marginBottom: 16
                }}
              >
                {siteSettings.heroEyebrow}
              </div>

              <h1
                style={{
                  margin: "0 0 18px",
                  fontSize: isMobile ? 42 : isTablet ? 56 : 72,
                  lineHeight: 0.95,
                  letterSpacing: "-0.05em",
                  maxWidth: 900
                }}
              >
                {siteSettings.heroTitle}
              </h1>

              <p
                style={{
                  margin: "0 0 12px",
                  maxWidth: 760,
                  fontSize: isMobile ? 17 : 20,
                  lineHeight: 1.7,
                  color: theme.textSoft,
                  fontWeight: 600
                }}
              >
                {siteSettings.heroSubtitle}
              </p>

              <p
                style={{
                  margin: 0,
                  maxWidth: 760,
                  fontSize: isMobile ? 15 : 17,
                  lineHeight: 1.7,
                  color: theme.textSoft
                }}
              >
                {siteSettings.heroText}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  marginTop: 28,
                  flexWrap: "wrap",
                  flexDirection: isMobile ? "column" : "row"
                }}
              >
                <Link to={heroLink} style={primaryButtonStyle(isMobile)}>
                  {siteSettings.heroCtaLabel}
                </Link>
                <Link to="/colecciones" style={secondaryButtonStyle(isMobile)}>
                  Ver colecciones
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? "8px 0 28px" : "18px 0 34px" }}>
          <div style={containerStyle(isMobile)}>
            <div
              style={{
                marginBottom: 20,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: theme.accent,
                fontWeight: 800
              }}
            >
              Explora a tu manera
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "repeat(3, 1fr)",
                gap: 18
              }}
            >
              <div style={cardStyle(isMobile)}>
                <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: isMobile ? 24 : 28 }}>
                  Quiero que me guíen
                </h3>
                <p style={{ margin: "0 0 18px", color: theme.textSoft, lineHeight: 1.7 }}>
                  Responde unas pocas preguntas y empieza a descubrir piezas con una lógica
                  más cercana a una asesoría que a una búsqueda fría.
                </p>
                <Link to="/guia" style={primaryButtonStyle(isMobile)}>
                  Ir a la guía
                </Link>
              </div>

              <div style={cardStyle(isMobile)}>
                <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: isMobile ? 24 : 28 }}>
                  Ver colecciones
                </h3>
                <p style={{ margin: "0 0 18px", color: theme.textSoft, lineHeight: 1.7 }}>
                  Explora universos más editoriales y curados, organizados por sensibilidad,
                  intención y estilo.
                </p>
                <Link to="/colecciones" style={primaryButtonStyle(isMobile)}>
                  Ir a colecciones
                </Link>
              </div>

              <div style={cardStyle(isMobile)}>
                <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: isMobile ? 24 : 28 }}>
                  Explorar catálogo
                </h3>
                <p style={{ margin: "0 0 18px", color: theme.textSoft, lineHeight: 1.7 }}>
                  Si prefieres una navegación más directa, entra al catálogo y recorre la
                  colección con búsqueda y filtros.
                </p>
                <Link to="/catalogo" style={primaryButtonStyle(isMobile)}>
                  Ir al catálogo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function GuiaPage() {
  const { isMobile, isTablet } = useResponsive();

  const [recommended, setRecommended] = useState<Product[]>([]);
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

        const [recommendedRes, catalogRes] = await Promise.all([
          fetch(`${apiBase}/api/products/recommendations`, { signal: controller.signal }),
          fetch(`${apiBase}/api/products`, { signal: controller.signal })
        ]);

        if (!recommendedRes.ok) throw new Error("No se pudieron cargar las recomendaciones.");
        if (!catalogRes.ok) throw new Error("No se pudo cargar el catálogo.");

        const recommendedData = await recommendedRes.json();
        const catalogData = await catalogRes.json();

        setRecommended(recommendedData.recommendations ?? []);
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
    const source = recommended.length > 0 ? recommended : catalog;
    return source.slice(0, 3);
  }, [recommended, catalog]);

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

    return `Esta primera selección está pensada ${purposeLabel}, con un enfoque en ${meaningLabel}, ${pieceLabel} y un carácter ${presenceLabel}.`;
  }, [guideAnswers]);

  function updateGuideAnswer(key: keyof GuideAnswers, value: string) {
    setGuideAnswers((current) => ({ ...current, [key]: value }));
  }

  function resetGuide() {
    setGuideAnswers(initialGuideAnswers);
  }

  return (
    <div style={pageShellStyle()}>
      <SiteHeader />
      <main style={{ padding: isMobile ? "32px 0" : "56px 0" }}>
        <div style={containerStyle(isMobile)}>
          <section style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: theme.accent,
                fontWeight: 800,
                marginBottom: 12
              }}
            >
              Guía asistida
            </div>

            <h1
              style={{
                margin: "0 0 12px",
                fontSize: isMobile ? 36 : isTablet ? 44 : 52,
                lineHeight: 1
              }}
            >
              Te ayudamos a encontrar una pieza ideal
            </h1>

            <p
              style={{
                margin: 0,
                color: theme.textSoft,
                lineHeight: 1.7,
                fontSize: isMobile ? 16 : 17,
                maxWidth: 760
              }}
            >
              Este es el primer paso hacia una experiencia más asesorada. Responde unas
              pocas preguntas para orientar mejor la búsqueda.
            </p>
          </section>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile || isTablet ? "1fr" : "1.15fr 0.85fr",
              gap: 20,
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
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: theme.accent,
                  fontWeight: 800,
                  marginBottom: 12
                }}
              >
                Lectura de intención
              </div>

              <h2 style={{ margin: "0 0 12px", fontSize: isMobile ? 24 : 30, lineHeight: 1.08 }}>
                {guideSummaryTitle}
              </h2>

              <p style={{ margin: 0, color: theme.textSoft, lineHeight: 1.7 }}>
                {guideSummaryText}
              </p>

              <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
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
                  marginTop: 22,
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
                  Ver mi selección
                </button>

                <button type="button" style={secondaryButtonStyle(isMobile)} onClick={resetGuide}>
                  Reiniciar guía
                </button>
              </div>
            </aside>
          </div>

          <section style={{ marginTop: 34 }}>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: theme.accent,
                fontWeight: 800,
                marginBottom: 14
              }}
            >
              Resultado guiado
            </div>

            {loading ? (
              <LoadingGrid />
            ) : error ? (
              <ErrorState message={error} />
            ) : guidedProducts.length === 0 ? (
              <EmptyState
                title="Aún no hay piezas para mostrar"
                text="Cuando el catálogo tenga contenido disponible, aquí aparecerán sugerencias iniciales."
              />
            ) : (
              <>
                <div style={{ ...cardStyle(isMobile), marginBottom: 24 }}>
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: theme.accent,
                      fontWeight: 800,
                      marginBottom: 10
                    }}
                  >
                    Selección orientativa
                  </div>

                  <h3 style={{ margin: "0 0 10px", fontSize: isMobile ? 24 : 30, lineHeight: 1.08 }}>
                    {guideSummaryTitle}
                  </h3>

                  <p style={{ margin: 0, color: theme.textSoft, lineHeight: 1.7 }}>
                    {guideSummaryText}
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
      <SiteFooter />
    </div>
  );
}

function ColeccionesPage() {
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
      <SiteHeader />
      <main style={{ padding: isMobile ? "32px 0" : "56px 0" }}>
        <div style={containerStyle(isMobile)}>
          <section style={{ marginBottom: 26 }}>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: theme.accent,
                fontWeight: 800,
                marginBottom: 12
              }}
            >
              Colecciones
            </div>

            <h1
              style={{
                margin: "0 0 12px",
                fontSize: isMobile ? 36 : isTablet ? 44 : 52,
                lineHeight: 1
              }}
            >
              Descubre por sensibilidad, intención y estilo
            </h1>

            <p
              style={{
                margin: 0,
                color: theme.textSoft,
                lineHeight: 1.7,
                fontSize: isMobile ? 16 : 17,
                maxWidth: 760
              }}
            >
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
                gap: 20
              }}
            >
              {collections.map((collection) => (
                <article
                  key={collection.id}
                  style={{
                    ...cardStyle(isMobile),
                    position: "relative",
                    overflow: "hidden",
                    minHeight: isMobile ? 420 : 460
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
                        "linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(247,241,232,0.68) 100%)",
                      zIndex: 1
                    }}
                  />

                  <div
                    style={{
                      position: "relative",
                      zIndex: 2
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        color: theme.accent,
                        fontWeight: 800,
                        marginBottom: 12
                      }}
                    >
                      Colección
                    </div>

                    <h2
                      style={{
                        margin: "0 0 10px",
                        fontSize: isMobile ? 28 : 34,
                        lineHeight: 1.08
                      }}
                    >
                      {collection.name}
                    </h2>

                    <p style={{ margin: "0 0 12px", color: theme.textSoft, lineHeight: 1.7 }}>
                      {collection.shortDescription}
                    </p>

                    <p style={{ margin: "0 0 20px", color: theme.textSoft, lineHeight: 1.7 }}>
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

          <section style={{ marginTop: 30 }}>
            <div style={cardStyle(isMobile)}>
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: theme.accent,
                  fontWeight: 800,
                  marginBottom: 12
                }}
              >
                Lógica editorial
              </div>

              <h3 style={{ margin: "0 0 10px", fontSize: isMobile ? 24 : 30, lineHeight: 1.08 }}>
                Una forma más curada de recorrer la tienda
              </h3>

              <p style={{ margin: 0, color: theme.textSoft, lineHeight: 1.7 }}>
                Esta sección existe para que la exploración no se reduzca a filtros fríos.
                Ahora las colecciones ya se alimentan directamente desde Airtable.
              </p>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProductDetailPage() {
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
            throw new Error("No encontramos esta pieza.");
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
      <SiteHeader />
      <main style={{ padding: isMobile ? "32px 0" : "56px 0" }}>
        <div style={containerStyle(isMobile)}>
          {loading ? (
            <LoadingGrid />
          ) : error ? (
            <ErrorState message={error} />
          ) : !product ? (
            <EmptyState
              title="Producto no encontrado"
              text="No pudimos encontrar esta pieza."
            />
          ) : (
            <>
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1fr",
                  gap: 28,
                  alignItems: "start",
                  marginBottom: 34
                }}
              >
                <div style={cardStyle(isMobile)}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: isMobile ? 360 : 520,
                        objectFit: "cover",
                        borderRadius: 20,
                        display: "block"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: isMobile ? 360 : 520,
                        borderRadius: 20,
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
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: theme.accent,
                      fontWeight: 800,
                      marginBottom: 12
                    }}
                  >
                    {product.category}
                  </div>

                  <h1
                    style={{
                      margin: "0 0 12px",
                      fontSize: isMobile ? 34 : 48,
                      lineHeight: 1
                    }}
                  >
                    {product.name}
                  </h1>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      marginBottom: 18
                    }}
                  >
                    {currency.format(product.price)}
                  </div>

                  <p
                    style={{
                      margin: "0 0 14px",
                      color: theme.textSoft,
                      lineHeight: 1.7,
                      fontSize: 16
                    }}
                  >
                    {product.description ??
                      "Pieza artesanal curada para una experiencia más humana y significativa."}
                  </p>

                  {product.descriptionLong ? (
                    <p
                      style={{
                        margin: "0 0 18px",
                        color: theme.textSoft,
                        lineHeight: 1.7,
                        fontSize: 15
                      }}
                    >
                      {product.descriptionLong}
                    </p>
                  ) : null}

                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      marginBottom: 22
                    }}
                  >
                    {product.collection ? (
                      <GuideMetaItem label="Colección" value={product.collection} />
                    ) : null}
                    {product.occasion ? (
                      <GuideMetaItem label="Ocasión" value={product.occasion} />
                    ) : null}
                    {product.meaning ? (
                      <GuideMetaItem label="Significado" value={product.meaning} />
                    ) : null}
                    {product.material ? (
                      <GuideMetaItem label="Material" value={product.material} />
                    ) : null}
                    {product.detail ? (
                      <GuideMetaItem label="Detalle" value={product.detail} />
                    ) : null}
                    {product.style ? (
                      <GuideMetaItem label="Estilo" value={product.style} />
                    ) : null}
                  </div>

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
                        `Hola, me interesa la pieza "${product.name}".`
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
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: theme.accent,
                    fontWeight: 800,
                    marginBottom: 14
                  }}
                >
                  También podría interesarte
                </div>

                {recommended.length === 0 ? (
                  <EmptyState
                    title="No hay sugerencias por ahora"
                    text="Cuando haya más piezas disponibles, aparecerán aquí."
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
      <SiteFooter />
    </div>
  );
}

function CatalogoPage() {
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
      <SiteHeader />
      <main style={{ padding: isMobile ? "32px 0" : "56px 0" }}>
        <div style={containerStyle(isMobile)}>
          <section style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: theme.accent,
                fontWeight: 800,
                marginBottom: 12
              }}
            >
              Catálogo
            </div>

            <h1
              style={{
                margin: "0 0 12px",
                fontSize: isMobile ? 36 : isTablet ? 44 : 52,
                lineHeight: 1
              }}
            >
              Explora la colección
            </h1>

            <p
              style={{
                margin: 0,
                color: theme.textSoft,
                lineHeight: 1.7,
                fontSize: isMobile ? 16 : 17,
                maxWidth: 760
              }}
            >
              Aquí vive la exploración libre: búsqueda, filtros y piezas disponibles para
              recorrer con más autonomía.
            </p>
          </section>

          <section style={{ ...cardStyle(isMobile), marginBottom: 26 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                borderRadius: 18,
                padding: "0 14px",
                minHeight: 54,
                border: `1px solid ${theme.border}`
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

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
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

          <section style={{ marginBottom: 34 }}>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: theme.accent,
                fontWeight: 800,
                marginBottom: 14
              }}
            >
              Selección destacada
            </div>

            {loading ? (
              <LoadingGrid />
            ) : error ? (
              <ErrorState message={error} />
            ) : recommended.length === 0 ? (
              <EmptyState
                title="Aún no hay recomendados"
                text="Cuando haya piezas destacadas disponibles, aparecerán aquí."
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
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: theme.accent,
                fontWeight: 800,
                marginBottom: 14
              }}
            >
              Productos
            </div>

            {loading ? (
              <LoadingGrid />
            ) : error ? (
              <ErrorState message={error} />
            ) : filteredCatalog.length === 0 ? (
              <EmptyState
                title="No encontramos piezas con ese criterio"
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
      <SiteFooter />
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/guia" element={<GuiaPage />} />
      <Route path="/colecciones" element={<ColeccionesPage />} />
      <Route path="/catalogo" element={<CatalogoPage />} />
      <Route path="/producto/:slug" element={<ProductDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
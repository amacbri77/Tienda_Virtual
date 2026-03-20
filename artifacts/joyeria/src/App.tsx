<h1>🔥 VERSION FINAL 🔥</h1>

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

export function App() {
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

        const [recommendedRes, catalogRes] = await Promise.all([
          fetch(`${apiBase}/api/products/recommendations`, {
            signal: controller.signal
          }),
          fetch(`${apiBase}/api/products`, {
            signal: controller.signal
          })
        ]);

        if (!recommendedRes.ok) {
          throw new Error("No se pudieron cargar las recomendaciones.");
        }

        if (!catalogRes.ok) {
          throw new Error("No se pudo cargar el catálogo.");
        }

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

  const featuredCategories = useMemo(() => {
    return categories.filter((c) => c !== "Todas").slice(0, 4);
  }, [categories]);

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowTop} />
      <div style={styles.backgroundGlowBottom} />

      <header style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.brandMark}>✦</div>
          <div>
            <div style={styles.brandName}>Arte Dorado</div>
            <div style={styles.brandSub}>Joyería artesanal colombiana</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <a href="#recomendados" style={styles.navLink}>
            Recomendados
          </a>
          <a href="#catalogo" style={styles.navLink}>
            Catálogo
          </a>
        </nav>
      </header>

      <main>
        <section style={styles.heroSection}>
          <div style={styles.heroCopy}>
            <div style={styles.kicker}>Colecciones con significado</div>

            <h1 style={styles.heroTitle}>
              Joyas artesanales con historia, símbolo y presencia.
            </h1>

            <p style={styles.heroText}>
              Descubre piezas inspiradas en amor, naturaleza, protección y tradición.
              Una experiencia digital pensada para sentirse más humana, más cálida y
              más curada que una tienda online convencional.
            </p>

            <div style={styles.heroActions}>
              <a href="#catalogo" style={styles.primaryButton}>
                Explorar catálogo
              </a>
              <a href="#recomendados" style={styles.secondaryButton}>
                Ver recomendados
              </a>
            </div>

            <div style={styles.trustRow}>
              <TrustBadge title="Hecho por artesanos" text="Piezas con intención y origen." />
              <TrustBadge title="Curaduría simbólica" text="Colecciones con significado." />
              <TrustBadge title="Experiencia guiada" text="Descubre mejor que con un catálogo plano." />
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.heroCardLarge}>
              <div style={styles.heroCardLabel}>Selección destacada</div>
              <div style={styles.heroCardTitle}>Piezas con esencia cálida y atemporal</div>
              <div style={styles.heroCardMeta}>
                Diseño elegante · narrativa artesanal · intención simbólica
              </div>
            </div>

            <div style={styles.heroCardSmall}>
              <div style={styles.miniEyebrow}>Colecciones</div>
              {featuredCategories.length > 0 ? (
                featuredCategories.map((cat) => (
                  <span key={cat} style={styles.categoryChip}>
                    {cat}
                  </span>
                ))
              ) : (
                <span style={styles.categoryChip}>Artesanal</span>
              )}
            </div>
          </div>
        </section>

        <section id="recomendados" style={styles.section}>
          <SectionHeading
            eyebrow="Selección personalizada"
            title="Recomendados para ti"
            subtitle="Una muestra curada para que la experiencia se sienta más cercana y menos abrumadora."
          />

          {loading ? (
            <LoadingGrid />
          ) : error ? (
            <ErrorState message={error} />
          ) : recommended.length === 0 ? (
            <EmptyState
              title="Aún no hay recomendaciones"
              text="Cuando el sistema tenga suficientes datos, aquí aparecerá una selección especial."
            />
          ) : (
            <ProductGrid products={recommended} compact={false} />
          )}
        </section>

        <section id="catalogo" style={styles.section}>
          <SectionHeading
            eyebrow="Explora por estilo"
            title="Catálogo"
            subtitle="Navega por tipo, significado o intuición. Cada pieza busca transmitir algo más que apariencia."
          />

          <div style={styles.filtersCard}>
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, categoría o descripción"
                style={styles.searchInput}
              />
            </div>

            <div style={styles.chipsWrap}>
              {categories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      ...styles.filterChip,
                      ...(active ? styles.filterChipActive : {})
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
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
            <ProductGrid products={filteredCatalog} compact />
          )}
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerBrand}>Arte Dorado</div>
        <p style={styles.footerText}>
          Joyería artesanal colombiana con curaduría simbólica y experiencia digital guiada.
        </p>
      </footer>
    </div>
  );
}

function ProductGrid({
  products,
  compact
}: {
  products: Product[];
  compact?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.grid,
        gridTemplateColumns: compact
          ? "repeat(auto-fit, minmax(240px, 1fr))"
          : "repeat(auto-fit, minmax(270px, 1fr))"
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article style={styles.card}>
      <div style={styles.cardMedia}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={styles.cardImage}
          />
        ) : (
          <div style={styles.cardPlaceholder}>
            <span style={styles.cardPlaceholderText}>Sin imagen</span>
          </div>
        )}
      </div>

      <div style={styles.cardBody}>
        <div style={styles.cardCategory}>{product.category}</div>

        <h3 style={styles.cardTitle}>{product.name}</h3>

        <p style={styles.cardDescription}>
          {product.description ??
            "Pieza artesanal curada para una experiencia más humana y significativa."}
        </p>

        <div style={styles.cardFooter}>
          <div style={styles.cardPrice}>{currency.format(product.price * 1000)}</div>
          <button style={styles.cardButton}>Ver pieza</button>
        </div>
      </div>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={styles.sectionHeading}>
      <div style={styles.sectionEyebrow}>{eyebrow}</div>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.sectionSubtitle}>{subtitle}</p>
    </div>
  );
}

function TrustBadge({ title, text }: { title: string; text: string }) {
  return (
    <div style={styles.trustBadge}>
      <div style={styles.trustTitle}>{title}</div>
      <div style={styles.trustText}>{text}</div>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyTitle}>{title}</div>
      <div style={styles.emptyText}>{text}</div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={styles.errorState}>
      <div style={styles.errorTitle}>No pudimos cargar la información</div>
      <div style={styles.errorText}>{message}</div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div style={styles.grid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} style={styles.skeletonCard}>
          <div style={styles.skeletonMedia} />
          <div style={styles.skeletonLineShort} />
          <div style={styles.skeletonLine} />
          <div style={styles.skeletonLine} />
          <div style={styles.skeletonLineShort} />
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8f3eb 0%, #f7efe5 38%, #fdfaf5 100%)",
    color: "#221d17",
    overflow: "hidden",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "rgba(201, 162, 106, 0.15)",
    filter: "blur(60px)",
    pointerEvents: "none"
  },
  backgroundGlowBottom: {
    position: "absolute",
    left: -120,
    bottom: 40,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(170, 126, 92, 0.12)",
    filter: "blur(70px)",
    pointerEvents: "none"
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 28px",
    backdropFilter: "blur(16px)",
    background: "rgba(248, 243, 235, 0.72)",
    borderBottom: "1px solid rgba(120, 92, 62, 0.08)"
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #b88a56 0%, #8f6232 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    boxShadow: "0 8px 22px rgba(143, 98, 50, 0.22)"
  },
  brandName: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.02em"
  },
  brandSub: {
    fontSize: 12,
    color: "#7f6d5d"
  },
  nav: {
    display: "flex",
    gap: 18
  },
  navLink: {
    color: "#5d4f42",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600
  },
  heroSection: {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "72px 24px 32px",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 32,
    alignItems: "center"
  },
  heroCopy: {
    position: "relative",
    zIndex: 1
  },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#8c6c49",
    marginBottom: 18
  },
  heroTitle: {
    fontSize: "clamp(42px, 7vw, 76px)",
    lineHeight: 0.95,
    letterSpacing: "-0.04em",
    margin: "0 0 18px"
  },
  heroText: {
    maxWidth: 720,
    fontSize: 18,
    lineHeight: 1.7,
    color: "#625446",
    margin: 0
  },
  heroActions: {
    display: "flex",
    gap: 14,
    marginTop: 28,
    flexWrap: "wrap"
  },
  primaryButton: {
    background: "linear-gradient(135deg, #1f1a15 0%, #3a3027 100%)",
    color: "#fff",
    textDecoration: "none",
    padding: "14px 20px",
    borderRadius: 999,
    fontWeight: 700,
    boxShadow: "0 10px 30px rgba(34, 29, 23, 0.18)"
  },
  secondaryButton: {
    background: "rgba(255,255,255,0.7)",
    color: "#3f352c",
    textDecoration: "none",
    padding: "14px 20px",
    borderRadius: 999,
    fontWeight: 700,
    border: "1px solid rgba(113, 86, 60, 0.16)"
  },
  trustRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginTop: 34
  },
  trustBadge: {
    padding: 16,
    borderRadius: 18,
    background: "rgba(255,255,255,0.62)",
    border: "1px solid rgba(126, 97, 68, 0.08)",
    boxShadow: "0 8px 30px rgba(73, 52, 31, 0.05)"
  },
  trustTitle: {
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 6
  },
  trustText: {
    fontSize: 13,
    lineHeight: 1.5,
    color: "#736456"
  },
  heroVisual: {
    display: "grid",
    gap: 18
  },
  heroCardLarge: {
    minHeight: 300,
    padding: 28,
    borderRadius: 30,
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.95), rgba(239,224,204,0.9))",
    boxShadow: "0 20px 60px rgba(92, 67, 39, 0.12)",
    border: "1px solid rgba(155, 124, 89, 0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end"
  },
  heroCardLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "#8a6b49",
    marginBottom: 12,
    fontWeight: 700
  },
  heroCardTitle: {
    fontSize: 34,
    lineHeight: 1.05,
    fontWeight: 700,
    maxWidth: 420
  },
  heroCardMeta: {
    marginTop: 14,
    color: "#6e5d4d",
    fontSize: 15
  },
  heroCardSmall: {
    padding: 20,
    borderRadius: 24,
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(155, 124, 89, 0.1)",
    boxShadow: "0 14px 40px rgba(92, 67, 39, 0.08)"
  },
  miniEyebrow: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "#8a6b49",
    marginBottom: 12,
    fontWeight: 700
  },
  categoryChip: {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 999,
    background: "#f0e3d3",
    color: "#5a493a",
    fontSize: 13,
    fontWeight: 700,
    marginRight: 10,
    marginBottom: 10
  },
  section: {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "32px 24px 72px"
  },
  sectionHeading: {
    marginBottom: 24
  },
  sectionEyebrow: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "#8a6b49",
    marginBottom: 10,
    fontWeight: 700
  },
  sectionTitle: {
    fontSize: 34,
    lineHeight: 1.1,
    margin: "0 0 10px"
  },
  sectionSubtitle: {
    margin: 0,
    color: "#6e5d4d",
    fontSize: 16,
    lineHeight: 1.7,
    maxWidth: 760
  },
  filtersCard: {
    padding: 18,
    borderRadius: 24,
    background: "rgba(255,255,255,0.66)",
    border: "1px solid rgba(155, 124, 89, 0.1)",
    boxShadow: "0 14px 40px rgba(92, 67, 39, 0.06)",
    marginBottom: 26
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    borderRadius: 18,
    padding: "0 14px",
    minHeight: 54,
    border: "1px solid rgba(130, 100, 70, 0.12)"
  },
  searchIcon: {
    fontSize: 18,
    color: "#7c6b5c"
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: 15,
    color: "#2f271f"
  },
  chipsWrap: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 16
  },
  filterChip: {
    border: "1px solid rgba(130, 100, 70, 0.12)",
    background: "#fff",
    color: "#5d4f42",
    borderRadius: 999,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer"
  },
  filterChipActive: {
    background: "#2b221b",
    color: "#fff",
    borderColor: "#2b221b"
  },
  grid: {
    display: "grid",
    gap: 24
  },
  card: {
    background: "rgba(255,255,255,0.82)",
    borderRadius: 24,
    overflow: "hidden",
    border: "1px solid rgba(146, 116, 83, 0.08)",
    boxShadow: "0 18px 42px rgba(71, 49, 27, 0.08)"
  },
  cardMedia: {
    height: 290,
    background: "linear-gradient(180deg, #efe4d6 0%, #e7d6c1 100%)"
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
  },
  cardPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  cardPlaceholderText: {
    color: "#9a846f",
    fontSize: 14,
    fontWeight: 600
  },
  cardBody: {
    padding: 18
  },
  cardCategory: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#8a6b49",
    fontWeight: 700,
    marginBottom: 10
  },
  cardTitle: {
    margin: "0 0 10px",
    fontSize: 22,
    lineHeight: 1.2
  },
  cardDescription: {
    margin: 0,
    minHeight: 68,
    color: "#665749",
    fontSize: 14,
    lineHeight: 1.6
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    gap: 14
  },
  cardPrice: {
    fontWeight: 800,
    fontSize: 18
  },
  cardButton: {
    border: "none",
    borderRadius: 999,
    background: "#1f1a15",
    color: "#fff",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer"
  },
  emptyState: {
    padding: 28,
    borderRadius: 24,
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(146, 116, 83, 0.08)"
  },
  emptyTitle: {
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 8
  },
  emptyText: {
    color: "#6d5d4d"
  },
  errorState: {
    padding: 28,
    borderRadius: 24,
    background: "rgba(120, 34, 34, 0.06)",
    border: "1px solid rgba(120, 34, 34, 0.12)"
  },
  errorTitle: {
    fontWeight: 700,
    marginBottom: 8,
    color: "#742c2c"
  },
  errorText: {
    color: "#7a4444"
  },
  skeletonCard: {
    background: "rgba(255,255,255,0.82)",
    borderRadius: 24,
    padding: 18,
    border: "1px solid rgba(146, 116, 83, 0.08)"
  },
  skeletonMedia: {
    height: 250,
    borderRadius: 18,
    background: "#eadfd1",
    marginBottom: 16
  },
  skeletonLine: {
    height: 12,
    borderRadius: 999,
    background: "#ece3d9",
    marginBottom: 10
  },
  skeletonLineShort: {
    height: 12,
    width: "60%",
    borderRadius: 999,
    background: "#ece3d9",
    marginBottom: 10
  },
  footer: {
    borderTop: "1px solid rgba(120, 92, 62, 0.08)",
    padding: "28px 24px 42px",
    textAlign: "center"
  },
  footerBrand: {
    fontWeight: 800,
    marginBottom: 8
  },
  footerText: {
    margin: 0,
    color: "#7a695a",
    fontSize: 14
  }
};

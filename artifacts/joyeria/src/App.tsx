import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
};

type GuideAnswers = {
  purpose: string | null;
  meaning: string | null;
  pieceType: string | null;
  presence: string | null;
};

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000").replace(/\/+$/, "");

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const initialGuideAnswers: GuideAnswers = {
  purpose: null,
  meaning: null,
  pieceType: null,
  presence: null
};

export function App() {
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [query, setQuery] = useState("");
  const [guideAnswers, setGuideAnswers] = useState<GuideAnswers>(initialGuideAnswers);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 900;
  });

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

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 900);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(catalog.map((p) => p.category).filter(Boolean)));
    return ["Todas", ...unique];
  }, [catalog]);

  const featuredCategories = useMemo(() => {
    return categories.filter((c) => c !== "Todas").slice(0, 4);
  }, [categories]);

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

  const guidedProducts = useMemo(() => {
    const source = recommended.length > 0 ? recommended : catalog;
    return source.slice(0, 3);
  }, [recommended, catalog]);

  const guideCompleted = Boolean(
    guideAnswers.purpose &&
      guideAnswers.meaning &&
      guideAnswers.pieceType &&
      guideAnswers.presence
  );

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
    const presence = guideAnswers.presence
      ? presenceMap[guideAnswers.presence]
      : "presencia";

    return `Piezas con ${meaning} y ${presence}`;
  }, [guideAnswers]);

  const guideSummaryText = useMemo(() => {
    const purposeLabel = getLabel(
      guideAnswers.purpose,
      {
        para_mi: "para ti",
        regalo: "para regalar"
      },
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

  const styles = getStyles(isMobile);

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateGuideAnswer(key: keyof GuideAnswers, value: string) {
    setGuideAnswers((current) => ({
      ...current,
      [key]: value
    }));
  }

  function resetGuide() {
    setGuideAnswers(initialGuideAnswers);
  }

  function applyGuideToCatalog() {
    const meaningMap: Record<string, string> = {
      amor: "amor",
      proteccion: "protección",
      elegancia: "elegancia",
      naturaleza: "naturaleza",
      luz: "luz",
      fuerza: "fuerza"
    };

    const pieceTypeMap: Record<string, string> = {
      aretes: "aretes",
      collar: "collar",
      pulsera: "pulsera",
      anillo: "anillo",
      descubrir: ""
    };

    const combinedQuery = [
      guideAnswers.pieceType ? pieceTypeMap[guideAnswers.pieceType] : "",
      guideAnswers.meaning ? meaningMap[guideAnswers.meaning] : ""
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    setSelectedCategory("Todas");
    setQuery(combinedQuery);
    scrollToSection("catalogo");
  }

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
          <a href="#guia" style={styles.navLink}>
            Guía
          </a>
          <a href="#colecciones" style={styles.navLink}>
            Colecciones
          </a>
          <a href="#catalogo" style={styles.navCta}>
            Ver catálogo
          </a>
        </nav>
      </header>

      <main>
        <section style={styles.heroSection}>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            style={styles.heroVideo}
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>

          <div style={styles.heroOverlay} />

          <div style={styles.heroInner}>
            <div style={styles.heroCopy}>
              <div style={styles.kicker}>Boutique digital guiada</div>

              <h1 style={styles.heroTitle}>
                Encuentra una pieza con historia, intención y presencia.
              </h1>

              <p style={styles.heroText}>
                Arte Dorado no busca sentirse como un catálogo más. Queremos que
                descubras joyas artesanales con una experiencia más cálida, curada
                y acompañada.
              </p>

              <div style={styles.heroActions}>
                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() => scrollToSection("guia")}
                >
                  Quiero que me guíen
                </button>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => scrollToSection("catalogo")}
                >
                  Ver colección
                </button>
              </div>
            </div>

            <div style={styles.heroMediaPanel}>
              <div style={styles.heroMediaCard}>
                <div style={styles.heroMediaEyebrow}>Experiencia de marca</div>
                <div style={styles.heroMediaTitle}>
                  Una entrada más cercana a una boutique que a una tienda estándar
                </div>
                <p style={styles.heroMediaText}>
                  Puedes dejarte guiar por intención, ocasión o estilo, o explorar
                  libremente la colección.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div style={styles.sectionEyebrow}>Explora a tu manera</div>
            <h2 style={styles.sectionTitle}>Dos caminos para descubrir</h2>
            <p style={styles.sectionSubtitle}>
              Puedes entrar de forma guiada o recorrer la colección por tu cuenta.
            </p>
          </div>

          <div style={styles.dualGrid}>
            <article style={styles.pathCard}>
              <div style={styles.pathLabel}>Experiencia guiada</div>
              <h3 style={styles.pathTitle}>Quiero ayuda para elegir</h3>
              <p style={styles.pathText}>
                Responde unas pocas preguntas y te mostraremos una selección con
                una lógica más cercana a la asesoría que a la búsqueda fría.
              </p>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => scrollToSection("guia")}
              >
                Comenzar guía
              </button>
            </article>

            <article style={styles.pathCard}>
              <div style={styles.pathLabel}>Navegación libre</div>
              <h3 style={styles.pathTitle}>Prefiero explorar la colección</h3>
              <p style={styles.pathText}>
                Si ya sabes lo que buscas, puedes recorrer el catálogo y utilizar
                filtros para navegar con libertad.
              </p>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => scrollToSection("catalogo")}
              >
                Ir al catálogo
              </button>
            </article>
          </div>
        </section>

        <section id="guia" style={styles.section}>
          <div style={styles.sectionHeading}>
            <div style={styles.sectionEyebrow}>Guía asistida</div>
            <h2 style={styles.sectionTitle}>Te ayudamos a encontrar una pieza ideal</h2>
            <p style={styles.sectionSubtitle}>
              Este es el primer paso hacia una experiencia más asesorada. No es un
              catálogo plano: es una orientación inicial para descubrir mejor.
            </p>
          </div>

          <div style={styles.guideLayout}>
            <div style={styles.guidePanel}>
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

            <aside style={styles.guideSummaryCard}>
              <div style={styles.guideSummaryLabel}>Lectura de intención</div>
              <h3 style={styles.guideSummaryTitle}>{guideSummaryTitle}</h3>
              <p style={styles.guideSummaryText}>{guideSummaryText}</p>

              <div style={styles.guideMetaList}>
                <GuideMetaItem
                  label="Propósito"
                  value={getLabel(
                    guideAnswers.purpose,
                    {
                      para_mi: "Para mí",
                      regalo: "Para regalar"
                    },
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

              <div style={styles.heroActions}>
                <button
                  type="button"
                  style={{
                    ...styles.primaryButton,
                    opacity: guideCompleted ? 1 : 0.7,
                    cursor: guideCompleted ? "pointer" : "not-allowed"
                  }}
                  onClick={applyGuideToCatalog}
                  disabled={!guideCompleted}
                >
                  Ver mi selección
                </button>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={resetGuide}
                >
                  Reiniciar guía
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div style={styles.sectionEyebrow}>Resultado guiado</div>
            <h2 style={styles.sectionTitle}>Una primera selección para orientar la búsqueda</h2>
            <p style={styles.sectionSubtitle}>
              En esta fase usamos la selección destacada disponible para demostrar
              cómo se verá una experiencia de asesoría más guiada.
            </p>
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
              <div style={styles.curatedIntroCard}>
                <div style={styles.curatedIntroEyebrow}>Selección orientativa</div>
                <h3 style={styles.curatedIntroTitle}>{guideSummaryTitle}</h3>
                <p style={styles.curatedIntroText}>{guideSummaryText}</p>
              </div>

              <ProductGrid products={guidedProducts} compact={false} />
            </>
          )}
        </section>

        <section id="colecciones" style={styles.section}>
          <div style={styles.sectionHeading}>
            <div style={styles.sectionEyebrow}>Descubre por intención</div>
            <h2 style={styles.sectionTitle}>Una lógica más emocional que categórica</h2>
            <p style={styles.sectionSubtitle}>
              No todas las personas eligen una joya solo por forma. A veces la
              elección empieza por lo que quieren expresar.
            </p>
          </div>

          <div style={styles.intentGrid}>
            <IntentCard
              title="Amor"
              text="Piezas pensadas para regalar, recordar o acompañar vínculos importantes."
            />
            <IntentCard
              title="Protección"
              text="Opciones con presencia serena para quienes buscan simbolismo y compañía."
            />
            <IntentCard
              title="Naturaleza"
              text="Una sensibilidad orgánica, cálida y conectada con materiales y formas vivas."
            />
            <IntentCard
              title="Luz"
              text="Selecciones más delicadas, luminosas y fáciles de integrar a distintos momentos."
            />
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div style={styles.sectionEyebrow}>Selección destacada</div>
            <h2 style={styles.sectionTitle}>Pocas piezas, mejor presentadas</h2>
            <p style={styles.sectionSubtitle}>
              Esta sección debe sentirse más curada que el catálogo general y más
              alineada con una experiencia boutique.
            </p>
          </div>

          {loading ? (
            <LoadingGrid />
          ) : error ? (
            <ErrorState message={error} />
          ) : recommended.length === 0 ? (
            <EmptyState
              title="Aún no hay recomendados"
              text="Cuando el sistema tenga suficientes datos, aquí aparecerá una selección destacada."
            />
          ) : (
            <ProductGrid products={recommended.slice(0, 4)} compact={false} />
          )}
        </section>

        <section id="catalogo" style={styles.section}>
          <div style={styles.sectionHeading}>
            <div style={styles.sectionEyebrow}>Explora libremente</div>
            <h2 style={styles.sectionTitle}>Catálogo</h2>
            <p style={styles.sectionSubtitle}>
              Aquí sigue disponible la navegación tradicional, pero ya no es la
              única puerta de entrada a la experiencia.
            </p>
          </div>

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

        <section style={styles.section}>
          <div style={styles.trustPanel}>
            <div style={styles.trustPanelItem}>
              <div style={styles.trustPanelTitle}>Artesanía cuidada</div>
              <p style={styles.trustPanelText}>
                El valor no está solo en el material, sino también en la forma en
                que una pieza es elegida, trabajada y presentada.
              </p>
            </div>

            <div style={styles.trustPanelItem}>
              <div style={styles.trustPanelTitle}>Curaduría con significado</div>
              <p style={styles.trustPanelText}>
                La experiencia busca ayudarte a descubrir mejor, no solo a mirar
                una cuadrícula interminable de productos.
              </p>
            </div>

            <div style={styles.trustPanelItem}>
              <div style={styles.trustPanelTitle}>Acompañamiento para elegir</div>
              <p style={styles.trustPanelText}>
                Esta tienda está pensada para evolucionar hacia una guía digital
                cada vez más cercana, elegante y útil.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerBrand}>Arte Dorado</div>
        <p style={styles.footerText}>
          Joyas artesanales pensadas para acompañar historias, momentos y personas.
        </p>

        <div style={styles.footerLinks}>
          <a href="#guia" style={styles.footerLink}>
            Guía
          </a>
          <a href="#colecciones" style={styles.footerLink}>
            Colecciones
          </a>
          <a href="#catalogo" style={styles.footerLink}>
            Catálogo
          </a>
        </div>
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
        display: "grid",
        gap: 24,
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
    <article style={baseStyles.card}>
      <div style={baseStyles.cardMedia}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={baseStyles.cardImage} />
        ) : (
          <div style={baseStyles.cardPlaceholder}>
            <span style={baseStyles.cardPlaceholderText}>Sin imagen</span>
          </div>
        )}
      </div>

      <div style={baseStyles.cardBody}>
        <div style={baseStyles.cardCategory}>{product.category}</div>

        <h3 style={baseStyles.cardTitle}>{product.name}</h3>

        <p style={baseStyles.cardDescription}>
          {product.description ??
            "Pieza artesanal curada para una experiencia más humana y significativa."}
        </p>

        <div style={baseStyles.cardFooter}>
          <div style={baseStyles.cardPrice}>{currency.format(product.price * 1000)}</div>
          <button type="button" style={baseStyles.cardButton}>
            Ver pieza
          </button>
        </div>
      </div>
    </article>
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
  return (
    <div style={baseStyles.guideStep}>
      <div style={baseStyles.guideStepTitle}>{title}</div>
      <div style={baseStyles.optionWrap}>
        {options.map((option) => {
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              style={{
                ...baseStyles.optionPill,
                ...(active ? baseStyles.optionPillActive : {})
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
    <div style={baseStyles.guideMetaItem}>
      <span style={baseStyles.guideMetaLabel}>{label}</span>
      <span style={baseStyles.guideMetaValue}>{value}</span>
    </div>
  );
}

function IntentCard({ title, text }: { title: string; text: string }) {
  return (
    <article style={baseStyles.intentCard}>
      <div style={baseStyles.intentCardTitle}>{title}</div>
      <p style={baseStyles.intentCardText}>{text}</p>
    </article>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div style={baseStyles.emptyState}>
      <div style={baseStyles.emptyTitle}>{title}</div>
      <div style={baseStyles.emptyText}>{text}</div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={baseStyles.errorState}>
      <div style={baseStyles.errorTitle}>No pudimos cargar la información</div>
      <div style={baseStyles.errorText}>{message}</div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div
      style={{
        display: "grid",
        gap: 24,
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} style={baseStyles.skeletonCard}>
          <div style={baseStyles.skeletonMedia} />
          <div style={baseStyles.skeletonLineShort} />
          <div style={baseStyles.skeletonLine} />
          <div style={baseStyles.skeletonLine} />
          <div style={baseStyles.skeletonLineShort} />
        </div>
      ))}
    </div>
  );
}

function getLabel(
  value: string | null,
  map: Record<string, string>,
  fallback: string
) {
  if (!value) return fallback;
  return map[value] ?? fallback;
}

function getStyles(isMobile: boolean): Record<string, React.CSSProperties> {
  return {
    page: {
      position: "relative",
      minHeight: "100vh",
      background:
        "linear-gradient(180deg, #f8f3eb 0%, #f6efe6 38%, #fcf8f2 100%)",
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
      gap: 16,
      padding: isMobile ? "14px 16px" : "18px 28px",
      backdropFilter: "blur(16px)",
      background: "rgba(248, 243, 235, 0.78)",
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
      gap: isMobile ? 10 : 18,
      alignItems: "center"
    },
    navLink: {
      color: "#5d4f42",
      textDecoration: "none",
      fontSize: isMobile ? 12 : 14,
      fontWeight: 600
    },
    navCta: {
      color: "#fff",
      textDecoration: "none",
      fontSize: isMobile ? 12 : 14,
      fontWeight: 700,
      background: "#2a221b",
      borderRadius: 999,
      padding: isMobile ? "10px 12px" : "10px 16px"
    },
    heroSection: {
      position: "relative",
      minHeight: isMobile ? "auto" : "88vh",
      overflow: "hidden",
      display: "flex",
      alignItems: "center"
    },
    heroVideo: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover"
    },
    heroOverlay: {
      position: "absolute",
      inset: 0,
      background: isMobile
        ? "linear-gradient(180deg, rgba(248,243,235,0.90) 0%, rgba(248,243,235,0.82) 46%, rgba(248,243,235,0.74) 100%)"
        : "linear-gradient(90deg, rgba(248,243,235,0.92) 0%, rgba(248,243,235,0.78) 40%, rgba(248,243,235,0.44) 72%, rgba(248,243,235,0.22) 100%)"
    },
    heroInner: {
      position: "relative",
      zIndex: 1,
      maxWidth: 1240,
      width: "100%",
      margin: "0 auto",
      padding: isMobile ? "36px 16px 28px" : "72px 24px 44px",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
      gap: isMobile ? 18 : 28,
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
      fontSize: isMobile ? 38 : 68,
      lineHeight: 0.98,
      letterSpacing: "-0.04em",
      margin: "0 0 18px"
    },
    heroText: {
      maxWidth: 680,
      fontSize: isMobile ? 16 : 18,
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
      border: "none",
      background: "linear-gradient(135deg, #1f1a15 0%, #3a3027 100%)",
      color: "#fff",
      padding: "14px 20px",
      borderRadius: 999,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 10px 30px rgba(34, 29, 23, 0.18)"
    },
    secondaryButton: {
      border: "1px solid rgba(113, 86, 60, 0.16)",
      background: "rgba(255,255,255,0.78)",
      color: "#3f352c",
      padding: "14px 20px",
      borderRadius: 999,
      fontWeight: 700,
      cursor: "pointer"
    },
    heroMediaPanel: {
      display: "flex",
      justifyContent: isMobile ? "stretch" : "flex-end"
    },
    heroMediaCard: {
      width: "100%",
      maxWidth: 430,
      minHeight: isMobile ? "auto" : 270,
      padding: isMobile ? 20 : 28,
      borderRadius: 30,
      background: "rgba(255,255,255,0.66)",
      boxShadow: "0 20px 60px rgba(92, 67, 39, 0.12)",
      border: "1px solid rgba(155, 124, 89, 0.1)",
      backdropFilter: "blur(12px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end"
    },
    heroMediaEyebrow: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      color: "#8a6b49",
      marginBottom: 12,
      fontWeight: 700
    },
    heroMediaTitle: {
      fontSize: isMobile ? 24 : 34,
      lineHeight: 1.08,
      fontWeight: 700
    },
    heroMediaText: {
      margin: "14px 0 0",
      color: "#6e5d4d",
      fontSize: 15,
      lineHeight: 1.65
    },
    section: {
      maxWidth: 1240,
      margin: "0 auto",
      padding: isMobile ? "28px 16px 44px" : "42px 24px 74px"
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
      fontSize: isMobile ? 30 : 38,
      lineHeight: 1.08,
      margin: "0 0 10px"
    },
    sectionSubtitle: {
      margin: 0,
      color: "#6e5d4d",
      fontSize: isMobile ? 15 : 16,
      lineHeight: 1.7,
      maxWidth: 760
    },
    dualGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: 18
    },
    pathCard: {
      padding: isMobile ? 20 : 28,
      borderRadius: 26,
      background: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(155, 124, 89, 0.1)",
      boxShadow: "0 14px 40px rgba(92, 67, 39, 0.07)"
    },
    pathLabel: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      color: "#8a6b49",
      marginBottom: 10,
      fontWeight: 700
    },
    pathTitle: {
      margin: "0 0 10px",
      fontSize: isMobile ? 24 : 30,
      lineHeight: 1.08
    },
    pathText: {
      margin: "0 0 20px",
      color: "#67584a",
      lineHeight: 1.7
    },
    guideLayout: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
      gap: 20,
      alignItems: "start"
    },
    guidePanel: {
      padding: isMobile ? 18 : 24,
      borderRadius: 28,
      background: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(155, 124, 89, 0.1)",
      boxShadow: "0 14px 40px rgba(92, 67, 39, 0.06)"
    },
    guideSummaryCard: {
      padding: isMobile ? 20 : 24,
      borderRadius: 28,
      background: "linear-gradient(180deg, rgba(248,240,228,0.96) 0%, rgba(255,255,255,0.92) 100%)",
      border: "1px solid rgba(155, 124, 89, 0.12)",
      boxShadow: "0 16px 42px rgba(92, 67, 39, 0.08)",
      position: isMobile ? "relative" : "sticky",
      top: isMobile ? undefined : 92
    },
    guideSummaryLabel: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      color: "#8a6b49",
      marginBottom: 12,
      fontWeight: 700
    },
    guideSummaryTitle: {
      margin: "0 0 12px",
      fontSize: isMobile ? 24 : 30,
      lineHeight: 1.08
    },
    guideSummaryText: {
      margin: 0,
      color: "#695a4c",
      lineHeight: 1.7
    },
    guideMetaList: {
      display: "grid",
      gap: 10,
      marginTop: 20
    },
    curatedIntroCard: {
      padding: isMobile ? 20 : 26,
      borderRadius: 26,
      background: "rgba(255,255,255,0.76)",
      border: "1px solid rgba(155, 124, 89, 0.1)",
      boxShadow: "0 14px 40px rgba(92, 67, 39, 0.06)",
      marginBottom: 24
    },
    curatedIntroEyebrow: {
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      color: "#8a6b49",
      marginBottom: 10,
      fontWeight: 700
    },
    curatedIntroTitle: {
      margin: "0 0 10px",
      fontSize: isMobile ? 24 : 30,
      lineHeight: 1.1
    },
    curatedIntroText: {
      margin: 0,
      color: "#695a4c",
      lineHeight: 1.7
    },
    intentGrid: {
      display: "grid",
      gap: 18,
      gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)"
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
    trustPanel: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: 18,
      padding: isMobile ? 18 : 24,
      borderRadius: 28,
      background: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(155, 124, 89, 0.1)",
      boxShadow: "0 14px 40px rgba(92, 67, 39, 0.06)"
    },
    trustPanelItem: {
      padding: isMobile ? 4 : 8
    },
    trustPanelTitle: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 8
    },
    trustPanelText: {
      margin: 0,
      color: "#6b5c4d",
      lineHeight: 1.7
    },
    footer: {
      borderTop: "1px solid rgba(120, 92, 62, 0.08)",
      padding: isMobile ? "28px 16px 40px" : "34px 24px 48px",
      textAlign: "center"
    },
    footerBrand: {
      fontWeight: 800,
      marginBottom: 8,
      fontSize: 18
    },
    footerText: {
      margin: "0 auto 18px",
      color: "#6f604f",
      maxWidth: 680,
      lineHeight: 1.7
    },
    footerLinks: {
      display: "flex",
      justifyContent: "center",
      gap: 18,
      flexWrap: "wrap"
    },
    footerLink: {
      color: "#5d4f42",
      textDecoration: "none",
      fontWeight: 600
    }
  };
}

const baseStyles: Record<string, React.CSSProperties> = {
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
  guideStep: {
    paddingBottom: 20,
    marginBottom: 20,
    borderBottom: "1px solid rgba(146, 116, 83, 0.08)"
  },
  guideStepTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12
  },
  optionWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10
  },
  optionPill: {
    border: "1px solid rgba(130, 100, 70, 0.12)",
    background: "#fff",
    color: "#5d4f42",
    borderRadius: 999,
    padding: "11px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer"
  },
  optionPillActive: {
    background: "#2b221b",
    color: "#fff",
    borderColor: "#2b221b"
  },
  guideMetaItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 10,
    borderBottom: "1px solid rgba(146, 116, 83, 0.08)"
  },
  guideMetaLabel: {
    color: "#7b6b5d",
    fontSize: 14
  },
  guideMetaValue: {
    fontWeight: 700,
    color: "#2f271f"
  },
  intentCard: {
    padding: 22,
    borderRadius: 24,
    background: "rgba(255,255,255,0.74)",
    border: "1px solid rgba(146, 116, 83, 0.08)",
    boxShadow: "0 14px 40px rgba(71, 49, 27, 0.06)"
  },
  intentCardTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 10
  },
  intentCardText: {
    margin: 0,
    color: "#6a5b4c",
    lineHeight: 1.7
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
  }
};

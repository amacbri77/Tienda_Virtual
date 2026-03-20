import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export function App() {
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/api/products/recommendations`)
      .then((response) => response.json())
      .then((data) => setRecommended(data.recommendations ?? []))
      .catch((error) => {
        console.error("Failed to load recommendations", error);
      });

    fetch(`${apiBase}/api/products`)
      .then((response) => response.json())
      .then((data) => setCatalog(data.products ?? []))
      .catch((error) => {
        console.error("Failed to load catalog", error);
      });
  }, []);

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#faf7f2",
        minHeight: "100vh",
        color: "#222"
      }}
    >
      <section
        style={{
          textAlign: "center",
          padding: "60px 20px 30px"
        }}
      >
        <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>
          Joyas artesanales con historia
        </h1>
        <p
          style={{
            fontSize: "20px",
            color: "#6b5b4d",
            maxWidth: "700px",
            margin: "0 auto"
          }}
        >
          Descubre piezas inspiradas en naturaleza, amor, protección y tradición artesanal.
        </p>
      </section>

      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>Recomendados para ti</h2>
        <ProductGrid products={recommended} />
      </section>

      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 20px 60px" }}>
        <h2 style={{ marginBottom: "20px" }}>Catálogo</h2>
        <ProductGrid products={catalog} />
      </section>
    </main>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "24px"
      }}
    >
      {products.map((product) => (
        <article
          key={product.id}
          style={{
            background: "#fff",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 4px 18px rgba(0,0,0,0.08)"
          }}
        >
          <div
            style={{
              height: "240px",
              background: "#f3ede4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            ) : (
              <span style={{ color: "#9a8d7c" }}>Sin imagen</span>
            )}
          </div>

          <div style={{ padding: "16px" }}>
            <div
              style={{
                fontSize: "13px",
                color: "#8a735d",
                marginBottom: "8px"
              }}
            >
              {product.category}
            </div>

            <h3 style={{ margin: "0 0 10px", fontSize: "20px" }}>
              {product.name}
            </h3>

            {product.description && (
              <p style={{ fontSize: "14px", color: "#555", minHeight: "48px" }}>
                {product.description}
              </p>
            )}

            <div
              style={{
                marginTop: "14px",
                fontWeight: "bold",
                fontSize: "18px"
              }}
            >
              ${product.price}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

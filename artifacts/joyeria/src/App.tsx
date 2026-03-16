import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export function App() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/products/recommendations`)
      .then((response) => response.json())
      .then((data) => setProducts(data.recommendations ?? []))
      .catch((error) => {
        console.error("Failed to load recommendations", error);
      });
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", margin: "2rem" }}>
      <h1>Joyeria - Recomendados</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - {product.category} - ${product.price}
          </li>
        ))}
      </ul>
    </main>
  );
}

import type { Product } from "../types/product.js";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRecommendedProducts(products: Product[]): Product[] {
  if (products.length === 0) {
    return [];
  }

  const targetSize = Math.min(products.length, 5);
  const minSize = Math.min(products.length, 3);

  const byCategory = new Map<string, Product[]>();
  for (const product of shuffle(products)) {
    const bucket = byCategory.get(product.category) ?? [];
    bucket.push(product);
    byCategory.set(product.category, bucket);
  }

  const recommendations: Product[] = [];

  for (const [, categoryProducts] of byCategory) {
    if (recommendations.length >= targetSize) {
      break;
    }
    const candidate = categoryProducts.shift();
    if (candidate) {
      recommendations.push(candidate);
    }
  }

  const leftovers = shuffle(
    Array.from(byCategory.values()).flat()
  ).filter((product) => !recommendations.some((item) => item.id === product.id));

  for (const product of leftovers) {
    if (recommendations.length >= targetSize) {
      break;
    }
    recommendations.push(product);
  }

  if (recommendations.length < minSize) {
    return shuffle(products).slice(0, minSize);
  }

  return recommendations;
}

/**
 * The "external" product catalog — the source of reference data (price, stock)
 * that the form doesn't own but needs. In a real app this would come from an API.
 */
export interface Product {
  readonly sku: string;
  readonly name: string;
  readonly price: number;
  readonly stock: number;
}

export const CATALOG: readonly Product[] = [
  { sku: 'SKU-1', name: 'Wireless Mouse', price: 24.99, stock: 42 },
  { sku: 'SKU-2', name: 'Mechanical Keyboard', price: 89.0, stock: 3 },
  { sku: 'SKU-3', name: 'USB-C Hub', price: 39.5, stock: 0 },
  { sku: 'SKU-4', name: '27" Monitor', price: 219.0, stock: 11 },
  { sku: 'SKU-5', name: 'Laptop Stand', price: 34.0, stock: 25 },
];

const BY_SKU = new Map(CATALOG.map((p) => [p.sku, p]));

/** Look up a catalog product by SKU. */
export function productOf(sku: string): Product | undefined {
  return BY_SKU.get(sku);
}

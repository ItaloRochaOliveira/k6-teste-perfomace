import type { Product, ProductFormInput, ProductRow } from "../types";

const priceFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function mapProductToRow(product: Product): ProductRow {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    priceLabel: priceFormatter.format(product.price),
    stock: product.stock,
    createdAtLabel: dateFormatter.format(new Date(product.createdAt)),
  };
}

export function mapProductToFormValues(product?: Product | null): ProductFormInput {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
  };
}

import type { ReactNode } from "react";

import type { ProductRow, ProductSortBy } from "../../../types";

export interface ProductColumn {
  key: string;
  header: string;
  sortBy?: ProductSortBy;
  className?: string;
  render: (row: ProductRow) => ReactNode;
}

export const productColumns: ProductColumn[] = [
  { key: "id", header: "ID", sortBy: "id", className: "w-16", render: (row) => row.id },
  { key: "name", header: "Nome", sortBy: "name", render: (row) => row.name },
  {
    key: "description",
    header: "Descrição",
    className: "max-w-xs truncate",
    render: (row) => row.description,
  },
  { key: "price", header: "Preço", sortBy: "price", render: (row) => row.priceLabel },
  { key: "stock", header: "Estoque", render: (row) => row.stock },
  {
    key: "createdAt",
    header: "Criado em",
    sortBy: "createdAt",
    render: (row) => row.createdAtLabel,
  },
];

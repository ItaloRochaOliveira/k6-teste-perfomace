import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { ProductRow, ProductSortBy, SortOrder } from "../../../types";
import { productColumns } from "./columns";

interface ProductsTableProps {
  rows: ProductRow[];
  isLoading: boolean;
  sortBy: ProductSortBy | undefined;
  sortOrder: SortOrder;
  onSort: (sortBy: ProductSortBy) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ProductsTable({
  rows,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {productColumns.map((column) => (
            <TableHead key={column.key} className={column.className}>
              {column.sortBy ? (
                <button
                  type="button"
                  className="font-medium hover:underline"
                  onClick={() => onSort(column.sortBy as ProductSortBy)}
                >
                  {column.header}
                  {sortBy === column.sortBy ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}
                </button>
              ) : (
                column.header
              )}
            </TableHead>
          ))}
          <TableHead className="w-40 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={productColumns.length + 1} className="text-center">
              {isLoading ? "Carregando..." : "Nenhum produto encontrado."}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.id}>
              {productColumns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render(row)}
                </TableCell>
              ))}
              <TableCell className="space-x-2 text-right">
                <Button size="sm" variant="outline" onClick={() => onEdit(row.id)}>
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(row.id)}>
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

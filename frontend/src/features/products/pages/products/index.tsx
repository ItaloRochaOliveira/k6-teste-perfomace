"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { useProductsMutations } from "../../hooks/use-products-mutations";
import { useProducts } from "../../hooks/use-products";
import { PRODUCTS_DEFAULT_PAGE_SIZE } from "../../constants";
import type { Product, ProductFormInput, ProductSortBy, SortOrder } from "../../types";
import { ProductFormDialog } from "./ProductFormDialog";
import { ProductsFilters } from "./ProductsFilters";
import { ProductsTable } from "./table";

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<ProductSortBy | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { products, rows, total, totalPages, isLoading } = useProducts({
    page,
    pageSize: PRODUCTS_DEFAULT_PAGE_SIZE,
    search,
    ...(sortBy ? { sortBy, sortOrder } : {}),
  });
  const { create, update, remove } = useProductsMutations();

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleSort(column: ProductSortBy) {
    if (sortBy === column) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  }

  function handleAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(id: number) {
    setEditing(products.find((product) => product.id === id) ?? null);
    setFormOpen(true);
  }

  function handleSubmit(values: ProductFormInput) {
    const onSuccess = () => setFormOpen(false);
    if (editing) {
      update.mutate({ id: editing.id, body: values }, { onSuccess });
    } else {
      create.mutate(values, { onSuccess });
    }
  }

  function handleConfirmDelete() {
    if (deletingId === null) return;
    remove.mutate(deletingId, { onSettled: () => setDeletingId(null) });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Produtos</h1>

      <ProductsFilters search={search} onSearchChange={handleSearchChange} onAdd={handleAdd} />

      <ProductsTable
        rows={rows}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={setDeletingId}
      />

      <div className="flex items-center justify-between text-sm">
        <span>
          {total} produto(s) — página {page} de {totalPages}
        </span>
        <div className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>

      <ProductFormDialog
        open={formOpen}
        product={editing}
        isSubmitting={create.isPending || update.isPending}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

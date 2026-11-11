import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
}

export function ProductsFilters({ search, onSearchChange, onAdd }: ProductsFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Input
        className="max-w-sm"
        placeholder="Buscar produtos..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Button onClick={onAdd}>Novo produto</Button>
    </div>
  );
}

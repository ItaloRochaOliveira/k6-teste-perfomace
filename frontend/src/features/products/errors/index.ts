// Códigos de erro espelhando o backend (modules/products/products.errors.ts)
export const productErrorCode = {
  NOT_FOUND: "PRODUCT_NOT_FOUND",
} as const;

export const productErrorMessages: Record<string, string> = {
  [productErrorCode.NOT_FOUND]: "Produto não encontrado.",
};

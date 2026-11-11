export const productErrorCode = {
  NOT_FOUND: 'PRODUCT_NOT_FOUND',
} as const;

export type ProductErrorCode = (typeof productErrorCode)[keyof typeof productErrorCode];

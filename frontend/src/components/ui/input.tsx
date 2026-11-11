import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "file:text-foreground selection:bg-primary selection:text-primary-foreground h-10 w-full min-w-0 px-4 py-3 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "placeholder:text-placeholder border-neutral-200 rounded-lg border bg-white shadow-xs transition-[color,box-shadow] ",
        flat: "placeholder:text-placeholder border-0 bg-input rounded-[10px] shadow-none transition-[background-color] duration-150 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-input-focus",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Input({
  className,
  type,
  variant,
  autoComplete = "off",
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      autoComplete={autoComplete}
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Input };

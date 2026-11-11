import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full text-sm cursor-pointer font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-0 bg-primary text-primary-foreground shadow-none hover:brightness-95 hover:shadow-none active:brightness-90",
        destructive:
          "rounded-md border border-destructive bg-destructive/5 text-destructive shadow-none hover:bg-destructive/10 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-primary bg-transparent text-primary shadow-none hover:bg-primary/5 hover:shadow-none dark:hover:bg-primary/10",
        neutral: "bg-card text-muted-foreground shadow-sm hover:shadow-md",
        input:
          "justify-start rounded-full border border-input bg-transparent px-3 py-1 text-left font-normal text-base shadow-xs hover:bg-transparent md:text-sm data-[empty=true]:text-muted-foreground",
        colorInput: "shrink-0 border-0 bg-input shadow-none",
        secondary:
          "rounded-md border border-primary bg-primary/10 text-primary shadow-none hover:bg-primary/15 dark:hover:bg-primary/20",
        ghost: "hover:bg-primary/20 dark:hover:bg-primary/50",
        link: "text-primary underline-offset-4 hover:underline",
        "back-link":
          "h-auto w-fit justify-start gap-1 rounded-none border-0 bg-transparent p-0 py-1 m-0 text-sm font-medium leading-5 text-primary shadow-none hover:bg-transparent hover:underline hover:brightness-100 focus-visible:border-transparent focus-visible:ring-0",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-full px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-full px-3 text-xs has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3",
        "size-icon":
          "h-7 font-normal rounded-md p-3 text-xs has-[>svg]:px-2.5 gap-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 rounded-full px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md p-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10",
        neutral: "",
      },
      template: {
        primaryActions:
          "size-3 min-h-0 min-w-0 rounded-none border-0 bg-transparent p-0 text-primary-foreground shadow-none hover:bg-transparent hover:text-primary-foreground/80",
        secondaryActions:
          "size-9 rounded-full border-0 bg-primary/10 p-0 text-primary shadow-none hover:bg-primary/15 has-[>svg]:p-0 dark:hover:bg-primary/20",
        actionSidebar:
          "h-6 w-6 min-h-6 min-w-6 shrink-0 gap-0 rounded-md border border-input bg-background p-0 text-muted-foreground shadow-none hover:bg-muted/50 aria-pressed:bg-primary aria-pressed:border-primary aria-pressed:text-primary-foreground has-[>svg]:p-0 [&_svg:not([class*='size-'])]:size-3",
        actionSidebarAlign:
          "h-6 w-6 min-h-6 min-w-6 shrink-0 gap-0 rounded-[3.5px] border-0 bg-transparent p-0 text-muted-foreground shadow-none hover:bg-muted/50 aria-pressed:bg-[#eff6ff] aria-pressed:text-primary has-[>svg]:p-0 [&_svg:not([class*='size-'])]:size-3.5",
        actionSidebarColorPicker:
          "h-7 w-7 min-h-7 min-w-7 shrink-0 flex-col gap-0.5 rounded-[8.75px] border border-border bg-background p-0 text-foreground shadow-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 has-[>svg]:p-0 [&_svg:not([class*='size-'])]:size-3",
      },
    },
    compoundVariants: [
      {
        variant: "back-link",
        class: "h-auto px-0 py-1 has-[>svg]:px-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  template,
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";
  const resolvedSize = template && size === "default" ? "neutral" : size;

  return (
    <Comp
      data-slot="button"
      data-variant={template ? undefined : variant}
      data-template={template}
      data-size={resolvedSize}
      className={cn(
        buttonVariants(
          template ? { template, size: resolvedSize } : { variant, size: resolvedSize },
        ),
        className,
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };

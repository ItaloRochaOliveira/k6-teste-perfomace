import type { IconProps } from "@phosphor-icons/react";
import { SpinnerIcon } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: IconProps) {
  return (
    <SpinnerIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };

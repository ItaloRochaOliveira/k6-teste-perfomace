"use client";

import { CheckIcon, InfoIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      expand
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <div className="flex shrink-0 size-7 items-center justify-center rounded-full bg-green-500">
            <div className="flex size-[18px] items-center justify-center rounded-full border-2 border-white">
              <CheckIcon size={11} weight="bold" className="text-white" />
            </div>
          </div>
        ),
        warning: <WarningIcon size={18} className="shrink-0 text-amber-600" />,
        error: (
          <div className="flex shrink-0 size-7 items-center justify-center rounded-full bg-red-500">
            <div className="flex size-[18px] items-center justify-center rounded-full border-2 border-white">
              <XIcon size={11} weight="bold" className="text-white" />
            </div>
          </div>
        ),
        info: <InfoIcon size={18} className="shrink-0 text-foreground" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group flex items-center gap-4 border border-border bg-background text-foreground shadow-[0px_0px_2px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.08)] rounded-lg px-4 py-4",
          success: "!bg-green-50 !border-0",
          error: "!bg-red-50 !border-0",
          title: "text-base font-semibold leading-6 text-neutral-700",
          description: "text-sm leading-5 text-neutral-600",
          closeButton:
            "!bg-transparent !border-0 !text-neutral-400 hover:!text-neutral-600 !shadow-none !top-3 !right-3 !left-auto",
          actionButton: "bg-primary text-primary-foreground rounded-md",
          cancelButton: "bg-muted text-muted-foreground rounded-md",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { Providers } from "@/providers";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "K6 Teste Performance",
  description: "Aplicação alvo para testes de carga com k6",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt">
      <body className={`${manrope.variable} font-manrope antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

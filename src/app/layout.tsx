import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ficha Audiológica",
  description: "Preenchimento automático da ficha audiológica com importação de ASO/PDF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SINAN | Dynamic Web Architect",
  description:
    "Scroll-driven portfolio with a cinematic WebGL aurora fog background.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

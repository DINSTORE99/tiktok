import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VPN STORE",
  description: "Order VPN Otomatis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}

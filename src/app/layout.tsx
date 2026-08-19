import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI IT Team — Your AI Engineering Team",
  description: "AI-powered IT engineering team for your business",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
